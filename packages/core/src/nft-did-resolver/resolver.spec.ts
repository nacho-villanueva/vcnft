import {BlockchainProvider} from '@vcnft/core';
import { getResolver, parseNftDid, isNftDid } from './resolver';
import {Resolver} from "did-resolver";
import {AssetType, ChainId} from "caip"; // Import all functions from actual file

describe('NFT DID Resolver', () => {

  let mockBlockchainProvider: BlockchainProvider;

  beforeAll(() => {
    // Mock the BlockchainProvider
    mockBlockchainProvider = {
      getMintedAssets: jest.fn(),
      setSigner: jest.fn(),
      getNFTOwners: jest.fn(),
      mintNFT: jest.fn()
    };

    // Mock the getNFTOwners method
    (mockBlockchainProvider.getNFTOwners as jest.Mock).mockResolvedValue(['ownerAddress1', 'ownerAddress2']);
  });

  describe('isNftDid', () => {

    test('valid NFT DID', () => {
      const did = "did:nft:eip155_1:erc721_0x021c4361c944017bc2037baf86538f952f2f0472:214";
      expect(isNftDid(did)).toBe(true);
    });

    test('not nft did', () => {
      const invalidDid = "did:notNft:somevalue";
      expect(isNftDid(invalidDid)).toBe(false);
    });

    test('incorrect schema did', () => {
      const incorrectSchemaDid = "incorrect:did:somevalues:morevalues";
      expect(isNftDid(incorrectSchemaDid)).toBe(false);
    });

    test('extra whitespace did', () => {
      const extraWhitespaceDid = " did:nft:eip155_1:erc721_0x021c4361c944017bc2037baf86538f952f2f0472:214 ";
      expect(isNftDid(extraWhitespaceDid)).toBe(false);
    });

    test('special characters did', () => {
      const specialCharactersDid = "did:nft:eip155_1:erc721_0x021c4361c944017bc2037#baf86538f952f2f0472:214";
      expect(isNftDid(specialCharactersDid)).toBe(false);
    });

  });

  test('parseNftDid', () => {
    const did = "did:nft:eip155_1:erc721_0x021c4361c944017bc2037baf86538f952f2f0472:214";

    const parsed = parseNftDid(did);
    // Check the parsed output. You might need to adjust these to match your actual expected output
    expect(parsed.chainId.namespace).toBe('eip155');
    expect(parsed.chainId.reference).toBe('1');
    expect(parsed.assetName.namespace).toBe('erc721');
    expect(parsed.assetName.reference).toBe('0x021c4361c944017bc2037baf86538f952f2f0472');
    expect(parsed.tokenId).toBe('214');
  });

  function testInvalidDIDResolution(invalidDid: string, description: string) {
    it(`should be ${description}`, async () => {
      const resolver = new Resolver(getResolver({blockchainProvider:mockBlockchainProvider}));
      const result = await resolver.resolve(invalidDid);
      expect(result.didResolutionMetadata.error).toEqual('invalidDid');
      if (result.didDocument) {
        expect(result.didDocument.id).toEqual(invalidDid);
      }
    });
  }

  describe('getResolver', () => {
    it('should validate with valid DID', async () => {
      const did = "did:nft:eip155_1:erc721_0x021c4361c944017bc2037baf86538f952f2f0472:214";

      const resolver = getResolver({blockchainProvider:mockBlockchainProvider});
      const result = await new Resolver(resolver).resolve(did);

      console.log(result.didDocument)

      expect(result.didDocument?.id).toEqual(did);
      expect(result.didDocument?.verificationMethod).toHaveLength(2);
      expect(result.didResolutionMetadata.contentType).toEqual('application/did+json');
    });

    const invalidDids = [
      {description: "Invalid schema", did: "invalid:did:somevalues:morevalues"},
      {description: "Invalid DID length", did: "did:nft:eip155_1:erc721_0x021c4361c944017bc2037baf86538f952f2f0472"},
      {description: "Invalid did method", did: "did:INVALID_NFT:eip155_1:erc721_0x021c4361c944017bc2037baf86538f952f2f0472:214"},
      {description: "Invalid network namespace", did: "did:nft:_1:erc721_0x021c4361c944017bc2037baf86538f952f2f0472:214"},
      {description: "Invalid network id", did: "did:nft:eip155_:erc721_0x021c4361c944017bc2037baf86538f952f2f0472:214"},
      {description: "Invalid nft standard", did: "did:nft:eip155_1:_0x021c4361c944017bc2037baf86538f952f2f0472:214"},
      {description: "Invalid contract address", did: "did:nft:eip155_1:erc721_:214"},
      {description: "Invalid token id", did: "did:nft:eip155_1:erc721_0x021c4361c944017bc2037baf86538f952f2f0472:"},
    ];

    invalidDids.forEach(invalidDid => {
      testInvalidDIDResolution(invalidDid.did, invalidDid.description);
    });
  });
});
