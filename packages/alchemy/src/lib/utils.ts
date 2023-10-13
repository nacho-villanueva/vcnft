import {ChainId} from "caip";
import { Network } from "alchemy-sdk";

export function chainIdToAlchemyNetwork(chainId: ChainId): Network {
  if (chainId.namespace !== "eip155") throw new Error("Only eip155 chains are supported");
  switch (chainId.reference) {
    case "1":   return Network.ETH_MAINNET
    case "5":   return Network.ETH_GOERLI
    case "14":  return Network.ARB_MAINNET
    case "137": return Network.MATIC_MAINNET
    case "592": return Network.ASTAR_MAINNET
    case "1101":  return Network.POLYGONZKEVM_MAINNET
    case "1442":  return Network.POLYGONZKEVM_TESTNET
    case "8453":  return Network.BASE_GOERLI
    case "80001": return Network.MATIC_MUMBAI
    case "220315":  return Network.BASE_MAINNET
    case "421613":  return Network.ARB_GOERLI
    case "11155111":  return Network.ETH_SEPOLIA
  }

  throw new Error("Unsupported chainId: " + chainId.reference);
}

export function alchemyNetworkToChainId(network: Network): ChainId {
  let chainIdRef = "";
  switch (network) {
    case Network.ETH_MAINNET: chainIdRef = "1"; break;
    case Network.ETH_GOERLI: chainIdRef = "5"; break;
    case Network.ARB_MAINNET: chainIdRef = "14"; break;
    case Network.MATIC_MAINNET: chainIdRef = "137"; break;
    case Network.ASTAR_MAINNET: chainIdRef = "592"; break;
    case Network.POLYGONZKEVM_MAINNET: chainIdRef = "1101"; break;
    case Network.POLYGONZKEVM_TESTNET: chainIdRef = "1442"; break;
    case Network.BASE_GOERLI: chainIdRef = "8453"; break;
    case Network.MATIC_MUMBAI: chainIdRef = "80001"; break;
    case Network.BASE_MAINNET: chainIdRef = "220315"; break;
    case Network.ARB_GOERLI: chainIdRef = "421613"; break;
    case Network.ETH_SEPOLIA: chainIdRef = "11155111"; break;
    default: throw new Error("Unsupported network: " + network);
  }
  return new ChainId({namespace: "eip155", reference: chainIdRef});
}
