import {AssetId} from "caip";
import {generateOwnershipChallengeMessage, toNftDid} from './utils';
describe("Test generateOwnershipChallengeMessage", () => {
  it("should return string with the provided did and a nonce", () => {
    const did = "did:test";
    const result = generateOwnershipChallengeMessage(did);
    expect(result).toContain(did);
    expect(result).toContain("nonce:");
  });
});

describe("Test toNftDid", () => {
  it("should return a nft did based on the provided AssetId", () => {
    const asset: AssetId = new AssetId({
      chainId: {namespace: "eip155", reference: "1"},
      assetName: {namespace: "erc721", reference: "0x021c4361c944017bc2037baf86538f952f2f0472"},
      tokenId: "214"
    });

    const result = toNftDid(asset);
    expect(result).toEqual(`did:nft:eip155_1:erc721_0x021c4361c944017bc2037baf86538f952f2f0472:214`);
  });
});
