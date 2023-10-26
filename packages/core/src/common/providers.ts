import {AssetId, AssetType, ChainId} from "caip";
import {Credential, JWT, JWTWithPayload, ResolvedAsset, Suite, W3CCredential} from "./types";

export interface BlockchainProvider {
  getNFTOwners: (asset: AssetId) => Promise<string[]>;
  mintNFT(assetType: AssetType, to: string, tokenId?: string): Promise<string>
  getMintedAssets(transactionHash: string, assetType: AssetType, filterAddress?: string): Promise<ResolvedAsset>
  setSigner(privateKey: string): BlockchainProvider
  getProviderJsonRpcUrl(chainId: ChainId): string
  getAddressFromSignature(message: string, signature: string): string
}

export interface SSIProvider {
  resolveDid(did: string): Promise<Record<any, any>>
  signCredential(credential: W3CCredential, verificationMethodId?: string): Promise<JWTWithPayload<Credential>>
  verifyCredentialJWT(credentialJwt: JWT): Promise<boolean>
  verifyPresentationJWT(JWTWithPayload: JWT): Promise<boolean>
}
