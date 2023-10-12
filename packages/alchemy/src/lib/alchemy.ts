import { Alchemy, Network, AssetTransfersCategory } from "alchemy-sdk";
import * as process from "process";

const config = {
  apiKey: process.env["ALCHEMY_API_KEY"]!,
  network: process.env["ALCHEMY_NETWORK"] as Network || Network.MATIC_MUMBAI,
};

const alchemy = new Alchemy(config);

export const getTransfer = async () => {
// Print owner's wallet address:
  const ownerAddr = "n4ch0.eth";
  console.log("fetching NFTs for address:", ownerAddr);
  console.log("...");

// Print total NFT count returned in the response:
  const nftsForOwner = await alchemy.nft.getNftsForOwner(ownerAddr);
  console.log("number of NFTs found:", nftsForOwner.totalCount);
  console.log("...");
}
