import {AssetId, AssetType} from "caip";
import {Credential, JWT, JWTWithPayload, ResolvedAsset, Suite} from "./types";

export interface BlockchainProvider {
  getNFTOwners: (asset: AssetId) => Promise<string[]>;
  mintNFT(assetType: AssetType, to: string, tokenId?: string): Promise<string>
  getMintedAssets(transactionHash: string, assetType: AssetType, filterAddress?: string): Promise<ResolvedAsset>
  setSigner(privateKey: string): BlockchainProvider
}

export interface SSIProvider {
  signCredential(credential: Credential, verificationMethodId?: string): Promise<JWTWithPayload<Credential>>
  verifyCredential(credential: JWTWithPayload<Credential>, suite: Suite): Promise<boolean>
  verifyPresentation(JWTWithPayload: JWT): Promise<boolean>
}
