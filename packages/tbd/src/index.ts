import {DIDDocument, DIDResolutionOptions, DIDResolutionResult, ParsedDID, Resolver} from "did-resolver";

import {TBDSSIProvider} from "./lib/tbd";

export * from './lib/tbd';


export function getResolver(ssi: TBDSSIProvider) {
  async function resolve(
    did: string,
    parsed: ParsedDID,
    didResolver: Resolver,
    options: DIDResolutionOptions
  ): Promise<DIDResolutionResult> {

    const didDocument = await ssi.resolveDid(did) as DIDDocument;

    const contentType =
      typeof didDocument?.['@context'] !== 'undefined' ? 'application/did+ld+json' : 'application/did+json'

    return {
      didDocument: didDocument,
      didDocumentMetadata: {},
      didResolutionMetadata: {
        contentType
      }
    } as DIDResolutionResult
  }

  return {
    web: resolve,
    key: resolve,
    ion: resolve,
  }
}
