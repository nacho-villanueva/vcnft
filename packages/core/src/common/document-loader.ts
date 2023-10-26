import {
  Did,
  documentLoaderFactory,
  Url,
} from '@transmute/jsonld-document-loader';
import { getResolver } from '../nft-did-resolver/resolver';
import {BlockchainProvider, SSIProvider} from './providers';
import { Resolver } from 'did-resolver';
import axios from 'axios';

import didContext from './contexts/did-v1.json';
import credentialContext from './contexts/credentials-v1.json';
import jwsContext from './contexts/jws-2020-v1.json';
import pexContext from './contexts/pex-v1.json';

const contexts: Record<string, any> = {
  'https://www.w3.org/ns/did/v1': didContext,
  'https://www.w3.org/2018/credentials/v1': credentialContext,
  'https://w3id.org/security/suites/jws-2020/v1': jwsContext,
  'https://identity.foundation/presentation-exchange/submission/v1': pexContext,
};

export function getBaseDocumentLoader(bp: BlockchainProvider, ssi: SSIProvider) {
  const resNft = async (iri: Did) => {
    const resolver = getResolver({ blockchainProvider: bp });
    console.log('resolving ' + iri.toString() + ' using nft-did-resolver');
    const result = await new Resolver(resolver).resolve(iri);
    return result.didDocument;
  };

  const resHttps = async (iri: Url) => {
    if (contexts[iri]) {
      console.log('resolving ' + iri.toString() + ' from cache');
      return contexts[iri];
    }
    console.log('resolving ' + iri.toString() + ' using axios');
    const { data } = await axios.get(iri);
    return data;
  };

  const resSsiProvider = async (iri: Did) => {
    return ssi.resolveDid(iri.toString());
  }

  return {
    ['did:nft']: resNft,
    ['https:']: resHttps,
    ['did:web']: resSsiProvider,
    ['did:key']: resSsiProvider,
    ['did:ion']: resSsiProvider,
  };
}

export function getDocumentLoader(bp: BlockchainProvider, ssi: SSIProvider) {
  const baseDocumentLoader = getBaseDocumentLoader(bp, ssi);

  return documentLoaderFactory.build(baseDocumentLoader);
}
