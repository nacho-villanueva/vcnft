import {BlockchainProvider} from "@vcnft/core";
import {DIDDocument, DIDResolutionResult, DIDResolver, parse, ParsedDID, VerificationMethod} from "did-resolver";
import {AccountId, AssetId, ChainId} from "caip";

/** NFT DID Structure:
 * did:nft:[NETWORK NAMESPACE][NETWORK ID]:[NFT STANDARD]_[CONTRACT ADDRESS]:[TOKEN ID]
 *
 * The types of each properties follow the Chain Agnostic definitions:
 * https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-19.md
 * https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-2.md
 * Example:
 * did:nft:eip155_1:erc721_0x021c4361c944017bc2037baf86538f952f2f0472:214
 */

export function parseNftDid(did: string) : AssetId {
  const parsedDid = parse(did)
  if (!isNftDid(did) || !parsedDid) throw new Error("Invalid NFT DID format")
  const splitDid = parsedDid.id.split(":")

  const network = splitDid[0]
  const networkNamespace = network.split("_")[0]
  const networkId = network.split("_")[1]

  const contract = splitDid[1]
  const contractNamespace = contract.split("_")[0]
  const contractAddress = contract.split("_")[1]

  const tokenId = splitDid[2]

  return new AssetId({
    chainId: new ChainId({namespace: networkNamespace, reference: networkId}),
    assetName: {namespace: contractNamespace, reference: contractAddress},
    tokenId: tokenId
  })
}
export function isNftDid(did: string): boolean {
  const parsedDid = parse(did)

  if (!parsedDid) return false;

  const splitDid = parsedDid.id.split(":");
  if (splitDid.length !== 3) return false;

  const isNft = parsedDid.method === "nft";

  // Check the NETWORK NAMESPACE format
  const networkNamespacePattern = /^[-a-z0-9]{3,8}$/i;
  const networkSplit = splitDid[0].split("_");
  const isValidNetworkNamespace = networkNamespacePattern.test(networkSplit[0]);

  // Check the NETWORK ID format
  const networkIdPattern = /^[-_a-zA-Z0-9]{1,32}$/i;
  const isValidNetworkId = networkIdPattern.test(networkSplit[1]);

  // Check the NFT STANDARD format
  const nftStandardPattern = /^[-a-z0-9]{3,8}$/i;
  const nftStandardSplit = splitDid[1].split("_");
  const isValidNftStandard = nftStandardPattern.test(nftStandardSplit[0]);

  // Check the CONTRACT ADDRESS format
  const contractAddressPattern = /^[-.%a-zA-Z0-9]{1,128}$/i;
  const isValidContractAddress = contractAddressPattern.test(nftStandardSplit[1]);

  // Check the TOKEN ID format
  const tokenIdPattern = /^[-.%a-zA-Z0-9]{1,78}$/i;
  const isValidTokenId = tokenIdPattern.test(splitDid[2]);

  return isNft && isValidNetworkNamespace && isValidNetworkId && isValidNftStandard && isValidContractAddress && isValidTokenId;
}

interface ConfigurationOptions {
  blockchainProvider: BlockchainProvider
}

export function getResolver(config: ConfigurationOptions): Record<string, DIDResolver> {
  async function resolve(did: string, parsed: ParsedDID): Promise<DIDResolutionResult> {
    if (!isNftDid(did)) {
      return {
        didDocument: {id: did},
        didResolutionMetadata: {error: 'invalidDid'},
        didDocumentMetadata: {}
      } as DIDResolutionResult
    }


    const asset = parseNftDid(did)
    const owners = await config.blockchainProvider.getNFTOwners(asset)
    const verificationMethods: VerificationMethod[] = owners.map(owner => ({
        id: `${did}#${owner}`,
        type: 'EcdsaSecp256k1RecoveryMethod2020',
        controller: did,
        blockchainAccountId: new AccountId({chainId: asset.chainId, address: owner}).toString()
      }
    ))

    const didDocument: DIDDocument = {
      id: did,
      verificationMethod: verificationMethods,
    }

    const contentType =
      typeof didDocument?.['@context'] !== 'undefined' ? 'application/did+ld+json' : 'application/did+json'

    return {
      didDocument,
      didDocumentMetadata: {},
      didResolutionMetadata: {
        contentType
      }
    } as DIDResolutionResult
  }

  return { nft: resolve }
}


