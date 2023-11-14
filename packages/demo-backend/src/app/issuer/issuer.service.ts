import {ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Issuer as IssuerModel} from "./issue.schema";
import {Issuer, NftDidCreation, NftDidResolution, parseNftDid} from "@vcnft/core";
import {VcnftService} from "../vcnft/vcnft.service";
import {KeyType} from "@vcnft/tbd";
import {AssetType, ChainId} from "caip";
import {IssueSessionService} from "../IssueSession/issue-session.service";
import * as process from "process";

@Injectable()
export class IssuerService {

  private issuer: Issuer;


  constructor(
    @InjectModel(IssuerModel.name) private issuerModel: Model<IssuerModel>,
    @Inject(IssueSessionService) private issueSessionService: IssueSessionService,
    @Inject(VcnftService) private readonly vcnftService: VcnftService
  ) {
  }

  async create(name: string) {
    const exists = await this.issuerModel.exists({name: name});
    if (exists) throw new ConflictException("Issuer already exists");

    return await new this.issuerModel({name: name}).save();
  }

  async findOrCreate(name: string) {
    const exists = await this.issuerModel.exists({name: name});
    if (exists) return await this.getIssuer(name);

    return await this.create(name);
  }

  async getIssuer(name: string) {
    return this.issuerModel
      .findOne({name: name})
      .exec().then((issuer) => issuer);
  }

  async getVcnftIssuerFromName(name: string) {
    const i = await this.getIssuer(name);
    if (!i) throw new NotFoundException("Issuer not found");

    const signer = i.signer || process.env["SIGNER_DEFAULT"];
    return this.vcnftService.getIssuer(signer);
  }

  async getVcnftIssuer(issuer: IssuerModel) {
    const signer = issuer.signer || process.env["SIGNER_DEFAULT"];
    return this.vcnftService.getIssuer(signer);
  }

  async setSigner(name: string, signer: string) {
    await this.issuerModel
      .updateOne({name: name}, {signer: signer})
      .exec();
  }

  async setDefaultChain(name: string, chainId: string) {
    await this.issuerModel
      .updateOne({name: name}, {defaultChain: chainId})
      .exec()
  }

  async exists(name: string) {
    return this.issuerModel.exists({name: name});
  }

  async getDid(name: string) {
    const i = await this.getIssuer(name);
    if (!i) throw new NotFoundException("Issuer not found");
    return i.did;
  }


  async generateDid(name: string): Promise<string> {
    const didDocument = await this.vcnftService.getSSIProvider().generateDid("key", KeyType.ED25519)

    if (!didDocument) throw new Error("Could not generate DID")

    const i = await this.findOrCreate(name);
    i.did = didDocument["id"];
    await i.save();

    return didDocument['id'];
  }

  async issueVcNft(name: string, claims: Record<string, any>, subjectDid: string) {
    const i = await this.getIssuer(name);
    if (!i) throw new NotFoundException("Issuer not found");
    const issuer = await this.getVcnftIssuer(i);

    const issuerDid = i.did;
    const issuerDidDoc = await this.vcnftService.getSSIProvider().resolveDid(issuerDid)
    const verificationMethod = issuerDidDoc["authentication"][0];

    return await issuer.issueVcNft(
      subjectDid,
      i.did,
      claims,
      verificationMethod,
    );
  }

  async issueVcNftRequest(name: string, claims: Record<string, any>) {
    const i = await this.getIssuer(name);

    if (!i.did) throw new NotFoundException("Issuer has no DID. Please generate one first.");

    const chain = (i.defaultChain || "eip155:5")

    return await this.issueSessionService.create({
      issuerName: i.name,
      issuerDID: i.did,
      chainId: chain,
      claims: JSON.stringify(claims),
      status: "PENDING",
      issuedAt: new Date()
    });
  }

  async claimVcNftRequest(credentialId: string, to: string) {
    const credentialRequest = await this.issueSessionService.getIssueSession(credentialId);

    if (!credentialRequest) throw new NotFoundException("Credential request not found");
    if (credentialRequest.status !== "PENDING") throw new ConflictException("Credential can not be claimed");

    const i = await this.getIssuer(credentialRequest.issuerName);
    if (!i.did) throw new NotFoundException("Issuer has no DID");
    const issuer = await this.getVcnftIssuer(i);

    const chain = (credentialRequest.chainId || "eip155:5").split(":");
    const chainId = new ChainId({namespace: chain[0], reference: chain[1]});

    const nftDidCreation = await issuer.issueNftDid(new AssetType({
      chainId: chainId,
      assetName: {namespace: "erc721", reference: this.vcnftService.getChainContract(chainId)}
    }), to);

    return this.issueSessionService.claim(credentialId,
      to,
      nftDidCreation.assetType.toString() + "@" + nftDidCreation.txHash);
  }

  async getIssuedCredential(id: string) {
    const issue = await this.issueSessionService.getIssueSession(id);

    if (!issue) throw new NotFoundException("Issue session not found");
    if (issue.status === "FAILED") {
      return {
        status: "FAILED",
        issueParams: issue,
        credential: null
      }
    }

    if (issue.status === "PENDING") {
      return {
        status: "PENDING",
        issueParams: issue,
        credential: null
      }
    }

    if (issue.status === "ISSUED") {
      return {
        status: "ISSUED",
        issueParams: issue,
        credential: issue.issuedCredential
      }
    }

    const i = await this.getVcnftIssuerFromName(issue.issuerName);
    if (!i) throw new NotFoundException("Issuer not found");

    const split = issue.nftDidCreation.split("@");
    const assetSplit = split[0].split("/");
    const chainSplit = assetSplit[0].split(":");
    const assetNameSplit = assetSplit[1].split(":");
    const nftDidCreation: NftDidCreation = {
      assetType: new AssetType({
        chainId: new ChainId({namespace: chainSplit[0], reference: chainSplit[1]}),
        assetName: {namespace: assetNameSplit[0], reference: assetNameSplit[1]}
      }),
      txHash: split[1]
    }

    let resolution: NftDidResolution;
    try {
      resolution = await i.resolveNftDidCreation(nftDidCreation);
    }
    catch (e) {
      throw new InternalServerErrorException("There was an exception while resolving NFT DID. Try again later.")
    }

    if (resolution.status !== "RESOLVED")
      return {
        status: "CLAIMED",
        issueParams: issue,
        credential: null
      };

    const issuerDid = issue.issuerDID;
    const issuerDidDoc = await this.vcnftService.getSSIProvider().resolveDid(issuerDid)
    const verificationMethod = issuerDidDoc["authentication"][0];

    const claims = JSON.parse(issue.claims);

    const credential = await i.issueVcNft(resolution.did, issue.issuerDID, claims, verificationMethod);

    this.issueSessionService.issue(id, JSON.stringify(credential));

    return {
      status: "ISSUED",
      issueParams: issue,
      credential: credential
    };
  }
}
