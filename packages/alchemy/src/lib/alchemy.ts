import { Alchemy, Network, AssetTransfersCategory } from "alchemy-sdk";
import * as process from "process";
import {BlockchainProvider} from "@vcnft/core";
import * as assert from "assert";
import {AssetId} from "caip";
import {chainIdToAlchemyNetwork} from "./utils";

export class AlchemyBlockchainProvider implements BlockchainProvider {
  private readonly apiKey: string
  private nftEmitterNetwork?: Network;
  private nftEmitterContract?: string;

  private readonly instances: Map<Network, Alchemy> = new Map();

  constructor(apiKey: string, nftEmitterNetwork?: Network, nftEmitterContract?: string) {
    this.apiKey = apiKey
    this.nftEmitterNetwork = nftEmitterNetwork;
    this.nftEmitterContract = nftEmitterContract;
    if (nftEmitterNetwork)
      this.getAlchemyInstance(nftEmitterNetwork)
  }

  getAlchemyInstance(network: Network) {
    if (!this.instances.has(network)) {
      // Use overrides if they exist -- otherwise use the default settings.
      const alchemySettings = {
        apiKey: this.apiKey,
        network: network
      }
      this.instances.set(network, new Alchemy(alchemySettings));
    }

    return this.instances.get(network) as Alchemy
  }

  async getNFTOwners(asset: AssetId): Promise<string[]> {
    const network = chainIdToAlchemyNetwork(asset.chainId);
    return (await this.getAlchemyInstance(network).nft.getOwnersForNft(asset.assetName.reference, asset.tokenId)).owners;
  }


}
