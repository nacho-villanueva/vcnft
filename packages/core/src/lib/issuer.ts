import { BlockchainProvider, SSIProvider } from '../common/providers';
import { AssetType } from 'caip';
import {
  AssetStatus,
  Credential,
  NftDidCreation,
  NftDidResolution,
} from '../common/types';
import { toNftDid } from './utils';

export class Issuer {
  private readonly bp: BlockchainProvider;
  private readonly ssiProvider: SSIProvider;

  constructor(
    blockchainProvider: BlockchainProvider,
    ssiProvider: SSIProvider
  ) {
    this.bp = blockchainProvider;
    this.ssiProvider = ssiProvider;
  }

  async issueNftDid(assetType: AssetType, to: string): Promise<NftDidCreation> {
    const tx = await this.bp.mintNFT(assetType, to);
    return {
      assetType: assetType,
      txHash: tx,
    };
  }

  async resolveNftDidCreation(
    nftDidCreation: NftDidCreation,
    index: number = 0
  ): Promise<NftDidResolution> {
    const txHash = nftDidCreation.txHash;
    const resolved = await this.bp.getMintedAssets(
      txHash,
      nftDidCreation.assetType
    );

    if (resolved.status === AssetStatus.RESOLVED) {
      if (!resolved.assetIds || resolved.assetIds.length === 0)
        throw new Error('Invalid transaction hash');

      const assetId = resolved.assetIds[index];
      const did = toNftDid(assetId);
      return {
        did: did,
        assetId: assetId,
        status: AssetStatus.RESOLVED,
      };
    }

    return {
      assetType: nftDidCreation.assetType,
      txHash: txHash,
      status: AssetStatus.PENDING,
    } as NftDidResolution;
  }

  generateBaseVcNft(
    nftDid: string,
    issuer: string,
    claim: Record<string, any>
  ): Credential {
    return {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', 'NftCredential'],
      issuer: issuer,
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: nftDid,
        ...claim,
      },
    };
  }

  async issueVcNft(nftDid: string, issuer: string, claim: Record<string, any>, verificationId: string) {
    const credential = this.generateBaseVcNft(nftDid, issuer, claim);
    return await this.ssiProvider.signCredential(credential, verificationId);
  }

}
