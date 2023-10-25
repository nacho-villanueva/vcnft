import {Injectable} from '@nestjs/common';
import {EthersBlockchainProvider, Issuer} from "@vcnft/core";
import {TBDSSIProvider} from "@vcnft/tbd";
import {ChainId} from "caip";
import {Issuer as IssuerModel} from "../issuer/issue.schema";
import * as process from "process";

@Injectable()
export class VcnftService {

    getChainContract(chainId: ChainId) {
      if (chainId.namespace == "eip155") {
        switch (chainId.reference) {
          case "1": return process.env["NFT_CONTRACT_ETH"];
          case "5": return process.env["NFT_CONTRACT_GOERLI"];
          case "137": return process.env["NFT_CONTRACT_MATIC"];
          case "80001": return process.env["NFT_CONTRACT_MUMBAI"];
        }
      }
    }

    getBlockchainProvider() {
        return new EthersBlockchainProvider([
            {
                chainId: new ChainId({namespace: "eip155", reference: "1"}),
                jsonRpcUrl: process.env["INFURA_ETH_MAINNET"]
            },
            {
                chainId: new ChainId({namespace: "eip155", reference: "5"}),
                jsonRpcUrl: process.env["INFURA_ETH_GOERLI"]
            },
            {
                chainId: new ChainId({namespace: "eip155", reference: "137"}),
                jsonRpcUrl: process.env["INFURA_MATIC_MAINNET"]
            },
            {
                chainId: new ChainId({namespace: "eip155", reference: "80001"}),
                jsonRpcUrl: process.env["INFURA_MATIC_MUMBAI"]
            }
        ]);
    }

    getSSIProvider(): TBDSSIProvider {
        return new TBDSSIProvider(process.env["TBD_URL"] || "http://localhost:8080");
    }

    getIssuer(signer: string) {
        const bp = this.getBlockchainProvider()
        bp.setSigner(signer)

        const ssi = this.getSSIProvider()

        return new Issuer(bp, ssi)
    }

}
