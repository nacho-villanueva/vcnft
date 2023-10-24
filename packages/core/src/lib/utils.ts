import {AssetId} from "caip";

export function generateOwnershipChallengeMessage(did: string) {
  return did + "nonce: " + Math.random().toString();
}


// did:nft:eip155_1:erc721_0x021c4361c944017bc2037baf86538f952f2f0472:214
export function toNftDid(assetId: AssetId) {
  return `did:nft:${assetId.chainId.namespace}_${assetId.chainId.reference}:${assetId.assetName.namespace}_${assetId.assetName.reference}:${assetId.tokenId}`
}
