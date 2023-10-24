import { ethers, Interface, JsonRpcProvider, Wallet } from 'ethers';
import {BlockchainProvider } from '@vcnft/core';
import { AssetId, AssetType, ChainId } from 'caip';
import {AssetStatus, ResolvedAsset} from "./types";

export class EthersBlockchainProvider implements BlockchainProvider {
  private static providers: Map<string, JsonRpcProvider> = new Map();

  private signerKey?: string;

  constructor(
    providers: {chainId: ChainId, jsonRpcUrl: string}[],
  ) {
    providers.forEach(({chainId, jsonRpcUrl}) => {
      EthersBlockchainProvider.providers.set(
        chainId.toString(),
        new JsonRpcProvider(jsonRpcUrl)
      );
    });
  }

  // Method to get the provider for a given chainId
  private static getProvider(chainId: ChainId): JsonRpcProvider {
    if (!EthersBlockchainProvider.providers.has(chainId.toString())) {
      throw new Error(
        `Provider for chain ${chainId.reference} is not defined.`
      );
    }

    return EthersBlockchainProvider.providers.get(
      chainId.toString()
    ) as JsonRpcProvider;
  }

  async getNFTOwners(asset: AssetId): Promise<string[]> {
    const contractAddress: string = asset.assetName.reference;
    const tokenId: string = asset.tokenId;

    if (asset.assetName.namespace !== 'erc721')
      throw new Error('ERC721 is the only supported namespace');

    const provider = EthersBlockchainProvider.getProvider(asset.chainId);
    const contract = new ethers.Contract(
      contractAddress,
      [
        'function ownerOf(uint256 tokenId) view returns (address)', // ERC721
      ],
      provider
    );

    // @ts-ignore
    const owner = await contract.ownerOf(tokenId);

    return [owner];
  }

  private getSigner(chainId: ChainId): Wallet {
    if (!this.signerKey) throw new Error('Signer key is not set');
    return new Wallet(
      this.signerKey,
      EthersBlockchainProvider.getProvider(chainId)
    );
  }

  async mintNFT(
    assetType: AssetType,
    to: string,
    tokenId?: string,
    contractFunction: string = 'function safeMint(address to)'
  ): Promise<string> {
    if (assetType.assetName.namespace !== 'erc721')
      throw new Error('ERC721 is the only supported namespace');

    const contractAddress: string = assetType.assetName.reference;
    const signer = this.getSigner(assetType.chainId);

    const contractInstance = new ethers.Contract(
      contractAddress,
      [
       contractFunction,
      ],
      signer
    );

    // @ts-ignore
    const tx = tokenId
      ? await contractInstance.getFunction("safeMint").send(to, tokenId)
      : await contractInstance.getFunction("safeMint").send(to)
    return tx.hash;
  }

  async getMintedAssets(
    transactionHash: string,
    assetType: AssetType,
    filterAddress?: string
  ): Promise<ResolvedAsset> {
    if (assetType.assetName.namespace !== 'erc721')
      throw new Error('ERC721 is the only supported namespace');

    const provider = EthersBlockchainProvider.getProvider(assetType.chainId);
    const receipt = await provider.getTransactionReceipt(transactionHash);

    if (!receipt) throw new Error('Invalid transaction hash');

    if (!receipt.logs || !receipt.to)
      return {
        status: AssetStatus.PENDING,
        txHash: transactionHash,
      }; // Transaction not confirmed yet

    //TODO: Use the assetType namespace to determine the ABI
    const abi = [
      'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
    ];

    const iface = new Interface(abi);
    let tokenIds: string[] = [];

    // Loop through the logs in the receipt
    for (let log of receipt.logs) {
      const mutableLog = { ...log, topics: [...log.topics] };

      const parsedLog = iface.parseLog(mutableLog);

      if (!parsedLog || parsedLog.name !== 'Transfer') continue;
      if (filterAddress && parsedLog.args['to'] !== filterAddress) continue;

      tokenIds.push(parsedLog.args['tokenId'].toString());
    }

    return {
      assetIds: tokenIds.map(
        (tokenId) =>
          new AssetId({
            chainId: assetType.chainId,
            assetName: assetType.assetName,
            tokenId: tokenId,
          })
      ),
      status: AssetStatus.RESOLVED,
      txHash: transactionHash,
    };
  }

  setSigner(privateKey: string): EthersBlockchainProvider {
    this.signerKey = privateKey;
    return this;
  }
}
