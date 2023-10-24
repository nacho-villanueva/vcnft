import {
  Did,
  documentLoaderFactory,
  Url,
} from '@transmute/jsonld-document-loader';
import { getResolver } from '../nft-did-resolver/resolver';
import { BlockchainProvider } from './providers';
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

export function getDocumentLoader(bp: BlockchainProvider) {
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

  const resKey = async (iri: Did) => {
    const key = {
      id: "did:key:z6MkokrsVo8DbGDsnMAjnoHhJotMbDZiHfvxM4j65d8prXUr",
      type: 'JsonWebKey2020',
      controller: 'did:key:z6MkokrsVo8DbGDsnMAjnoHhJotMbDZiHfvxM4j65d8prXUr',
      publicKeyJwk: {
        kty: 'OKP',
        crv: 'Ed25519',
        x: 'ijtvFnowiumYMcYVbaz6p64Oz6bXwe2V_9IlCgDR_38',
      }
    };

    const doc = {
      "@context": [
        "https://www.w3.org/ns/did/v1",
        "https://w3id.org/security/suites/jws-2020/v1",
        {"@vocab":"https://www.w3.org/ns/did/controller-dependent#"}
      ],
      id: "did:key:z6MkokrsVo8DbGDsnMAjnoHhJotMbDZiHfvxM4j65d8prXUr",
      verificationMethod: [key],
      assertionMethod: ["did:key:z6MkokrsVo8DbGDsnMAjnoHhJotMbDZiHfvxM4j65d8prXUr"],
      authentication: ["did:key:z6MkokrsVo8DbGDsnMAjnoHhJotMbDZiHfvxM4j65d8prXUr"],
    };

    console.log('resolving ' + iri.toString() + ' using key');

    const ret = {
      contextUrl: null,
      documentUrl: iri,
      document: doc,
    };
    console.log(ret)
    return ret;
  };

  return documentLoaderFactory.build({
    ['did:nft']: resNft,
    ['https:']: resHttps,
    ['did:key']: resKey,

  });
}
