import {AssetId} from "caip";

export function generateOwnershipChallengeMessage(asset: AssetId) {
  return asset.toString() + "nonce: " + Math.random().toString();
}
