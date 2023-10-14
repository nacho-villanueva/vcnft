import {AssetId} from "caip";

export function generateOwnershipChallengeMessage(did: string) {
  return did + "nonce: " + Math.random().toString();
}
