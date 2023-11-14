import {Injectable} from '@nestjs/common';
import {EthersBlockchainProvider, Issuer} from "@vcnft/core";
import {TBDSSIProvider} from "@vcnft/tbd";
import {ChainId} from "caip";
import {Issuer as IssuerModel} from "../issuer/issue.schema";
import * as process from "process";
import {getResolver as getEthrResolver} from "ethr-did-resolver";
import {getResolver as getTBDResolver} from "@vcnft/tbd";
import {getResolver as getNFTResolver} from "@vcnft/core";
import {Resolver} from "did-resolver";

@Injectable()
export class VcnftService {

  private readonly resolver: Resolver;

  constructor() {
    this.resolver = new Resolver({
      ...getNFTResolver({blockchainProvider: this.getBlockchainProvider()}),
      ...getTBDResolver(this.getSSIProvider()),
      ...getEthrResolver({
        networks: [
          {name: "mainnet", rpcUrl: process.env["INFURA_ETH_MAINNET"]},
          {name: "0x5", rpcUrl: process.env["INFURA_ETH_GOERLI"]},
          {name: "0x137", rpcUrl: process.env["INFURA_MATIC_MAINNET"]},
          {name: "0x80001", rpcUrl: process.env["INFURA_MATIC_MUMBAI"]},
        ]
      }),
    }, {
      cache: true,
    })
  }

  getChainContract(chainId: ChainId) {
    if (chainId.namespace == "eip155") {
      switch (chainId.reference) {
        case "1":
          return process.env["NFT_CONTRACT_ETH"];
        case "5":
          return process.env["NFT_CONTRACT_GOERLI"];
        case "137":
          return process.env["NFT_CONTRACT_MATIC"];
        case "80001":
          return process.env["NFT_CONTRACT_MUMBAI"];
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

  getResolver() {
    return this.resolver;
  }

  async faucet(chainId:string, address: string) {
    const bp = this.getBlockchainProvider()
    bp.setSigner(process.env["SIGNER_DEFAULT"])

    return bp.faucet(
      new ChainId({namespace: "eip155", reference: chainId}),
      address
    )
  }

  async getFaucetBalance(chainId: string) {
    return this.getBlockchainProvider().getBalance(
      new ChainId({namespace: "eip155", reference: chainId})
    )
  }

}
