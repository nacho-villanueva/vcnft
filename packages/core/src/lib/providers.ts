export interface BlockchainProvider {
  deployContract: (contractName: string, args: any[]) => Promise<any>;
  getNFT: (contractName: string, tokenId: number) => Promise<any>;
}
