import { EthersBlockchainProvider } from './blockchain';
import { ChainId, AssetId, AssetType} from 'caip';

describe('EthersBlockchainProvider', () => {
  let ethersBlockchainProvider: EthersBlockchainProvider;
  let testAssetType: AssetType;
  let myTestAddress = "0x69D2d2347e05ece6c9Daae509456B8855c759718";
  let testChainId: ChainId;

  beforeAll(() => {
    testChainId = new ChainId({namespace: 'eip155', reference: '5'});
    testAssetType = new AssetType({
      chainId: testChainId,
      assetName: {namespace: 'erc721', reference: '0xe069b10800Aab13CBc2bb8FACdF2df0b6CEAf5f8'}
    });

    ethersBlockchainProvider = new EthersBlockchainProvider(
        [
          {chainId: new ChainId({namespace: "eip155", reference: "5"}),
            jsonRpcUrl: process.env["JSON_RPC_URL_5"]!
          },
        ]
    ).setSigner(process.env["TEST_WALLET_PRIVATE_KEY"]!);
  });

  test('getNFTOwners', async () => {
    const tokenIds = ['1', '2', '3'];
    const testAssets = tokenIds.map(tokenId => new AssetId({
      chainId: testChainId,
      assetName: testAssetType.assetName,
      tokenId: tokenId
    }));

    for (const asset of testAssets) {
      const owner = await ethersBlockchainProvider.getNFTOwners(asset);
      expect(owner.map(o => o.toLowerCase())).toContain(myTestAddress.toLowerCase());
    }
  }, 50000); // adjusted timeout value

  test('mintNFT', async () => {
    const transactionHash = await ethersBlockchainProvider.mintNFT(testAssetType, myTestAddress);
    expect(transactionHash).toMatch(/0x[a-fA-F0-9]{64}/);
  });

  describe('getMintedAssets', () => {
    test('should be valid', async () => {
      const transactionHash = "0x234ad0e5533980c74ce94f44c2df7a8a76b89be3fea85187fb63b4ad1227209f";
      const resolved = await ethersBlockchainProvider.getMintedAssets(transactionHash, testAssetType, myTestAddress);
      expect(resolved.status).toBe("RESOLVED");
      expect(resolved.txHash).toBe(transactionHash);
      expect(resolved.assetIds).toBeDefined();
      expect(resolved.assetIds).toHaveLength(1);
      expect(resolved.assetIds![0].tokenId).toEqual("2")
    });

    test('should be invalid transaction', async () => {
      const transactionHash = "0x234ad0e5533980c74ce94f44c2df7a8a76b89be3fea85187fb63b4ad12272091";
      await expect(ethersBlockchainProvider.getMintedAssets(transactionHash, testAssetType, myTestAddress)).rejects.toThrow("Invalid transaction hash")
    });
  })
});
