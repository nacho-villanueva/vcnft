import {AlchemyBlockchainProvider} from './alchemy';
import {Alchemy, Network} from "alchemy-sdk";
import {AssetId} from "caip";
import {alchemyNetworkToChainId} from "./utils";

describe('alchemy', () => {
  let abp : AlchemyBlockchainProvider;
  let network: Network;

  beforeAll(() => {
    network = process.env["ALCHEMY_NETWORK"] as Network || Network.MATIC_MUMBAI
    abp = new AlchemyBlockchainProvider(process.env["ALCHEMY_API_KEY"]!);
  })

  it('Test getAlchemyInstance', async () => {
    const ethNetwork = Network.ETH_MAINNET;
    const mumbaiNetwork = Network.MATIC_MUMBAI;
    const envNetwork = process.env["ALCHEMY_NETWORK"] as Network

    const ethInstance = abp.getAlchemyInstance(ethNetwork);
    const mumbaiInstance = abp.getAlchemyInstance(mumbaiNetwork);
    const envInstance = abp.getAlchemyInstance(envNetwork);

    expect(ethInstance.config.network).toBe(ethNetwork)
    expect(mumbaiInstance.config.network).toBe(mumbaiNetwork)

    if (envNetwork) expect(envInstance.config.network).toBe(envNetwork)
    else expect(envInstance.config.network).toBe(mumbaiNetwork)
  })

  it('Test getNFTOwners', async () => {
    const myAddr = "0x85c00AD33190bf65ec12D9ED85A60FFc464704f1";
    const ownedNFTs = await abp.getAlchemyInstance(network).nft.getNftsForOwner(myAddr).then(r => r.ownedNfts);
    const assets = ownedNFTs.map(nft => new AssetId({
      chainId: alchemyNetworkToChainId(network),
      assetName: {namespace: nft.tokenType, reference: nft.contract.address},
      tokenId: nft.tokenId
    }))
    await new Promise((r) => setTimeout(r, 500));
    const owner = await abp.getNFTOwners(assets[0])
    expect(owner.map(o => o.toLowerCase())).toContain(myAddr.toLowerCase());
  }, 10000)
});
