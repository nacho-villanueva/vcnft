import {ConflictException, Inject, Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Issuer as IssuerModel} from "./issue.schema";
import {Issuer, NftDidCreation} from "@vcnft/core";
import {VcnftService} from "../vcnft/vcnft.service";
import {KeyType} from "@vcnft/tbd";
import {AssetType, ChainId} from "caip";
import {IssueSessionService} from "../IssueSession/issue-session.service";

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

  async getIssuer(name: string) {
    return this.issuerModel
      .findOne({name: name})
      .exec().then((issuer) => issuer);
  }

  async getVcnftIssuerFromName(name: string) {
    const i = await this.getIssuer(name);
    if (!i) throw new NotFoundException("Issuer not found");

    return this.vcnftService.getIssuer(i);
  }

  async getVcnftIssuer(issuer: IssuerModel) {
    return this.vcnftService.getIssuer(issuer);
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
    return this.issuerModel
      .findOne({name: name})
      .exec().then((issuer) => issuer.did["id"]);
  }


  async generateDid(name: string): Promise<string> {
    const didDocument = await this.vcnftService.getSSIProvider().generateDid("key", KeyType.ED25519)

    if (!didDocument) throw new Error("Could not generate DID")

    await this.issuerModel
      .updateOne({name: name}, {did: didDocument["id"]})
      .exec();

    return didDocument['id'];
  }

  async issueVcNft(name: string, to: string, claims: Record<string, any>) {
    const i = await this.getIssuer(name);
    const issuer = await this.getVcnftIssuer(i);

    if (!i.did) throw new NotFoundException("Issuer has no DID. Please generate one first.");
    const did = i.did;
    const chain = (i.defaultChain || "eip155:5").split(":");
    const chainId = new ChainId({namespace: chain[0], reference: chain[1]});

    const nftDidCreation = await issuer.issueNftDid(new AssetType({
      chainId: chainId,
      assetName: {namespace: "erc721", reference: this.vcnftService.getChainContract(chainId)}
    }), to);

    return await this.issueSessionService.create({
      issuerName: i.name,
      issuerDID: did,
      nftDidCreation: nftDidCreation.assetType.toString() + "@" + nftDidCreation.txHash,
      claims: JSON.stringify(claims),
    });
  }

  async getIssuedCredential(id: string) {
    const issue = await this.issueSessionService.getIssueSession(id);
    if (!issue) throw new NotFoundException("Issue session not found");
    const i = await this.getVcnftIssuerFromName(issue.issuerName);

    const split = issue.nftDidCreation.split("@");
    const assetSplit = split[0].split("/");
    const chainSplit = assetSplit[0].split(":");
    const assetNameSplit = assetSplit[1].split(":");
    const nftDidCreation:NftDidCreation = {
        assetType: new AssetType({
          chainId: new ChainId({namespace: chainSplit[0], reference: chainSplit[1]}),
          assetName: {namespace: assetNameSplit[0], reference: assetNameSplit[1]}}),
        txHash: split[1]
    }

    const resolution = await i.resolveNftDidCreation(nftDidCreation);
    if (resolution.status !== "RESOLVED") return false;

    const issuerDid = issue.issuerDID;
    const issuerDidDoc = await this.vcnftService.getSSIProvider().resolveDid(issuerDid)
    const verificationMethod = issuerDidDoc["authentication"][0];

    const claims = JSON.parse(issue.claims);

    const vc = i.generateBaseVcNft(resolution.did, issue.issuerDID, claims);
    return await i.issueVcNft(resolution.did, issue.issuerDID, claims, verificationMethod);
  }
}
