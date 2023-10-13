import {AssetId} from "caip";

export interface BlockchainProvider {
  getNFTOwners: (asset: AssetId) => Promise<string[]>;
}
