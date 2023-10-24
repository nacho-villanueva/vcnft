import { TransmuteSSIProvider } from "./transmute";
import {DocumentLoader, documentLoaderFactory} from "@transmute/jsonld-document-loader";
import {Suite} from "@transmute/vc.js/dist/types/Suite";
import {
  BlockchainProvider,
  getDocumentLoader,
  ResolvedAsset,
  VerifiableCredential,
  VerifiablePresentation
} from "@vcnft/core";
import {JsonWebKey, JsonWebKey2020, JsonWebSignature} from "@transmute/json-web-signature";
import {AssetId, AssetType} from "caip";  // Adjust the import path accordingly

describe('TransmuteSSIProvider', () => {

  let mockDocumentLoader: DocumentLoader;
  let mockSuite: Suite;
  let mockCredential: VerifiableCredential;
  let mockPresentation: VerifiablePresentation;
  let mockBlockchainProvider: BlockchainProvider;

  beforeAll(async () => {
    // Setup mock objects and functions
    mockDocumentLoader = documentLoaderFactory.build();
    const key = {
      id: "did:key:z6MkokrsVo8DbGDsnMAjnoHhJotMbDZiHfvxM4j65d8prXUr#z6MkokrsVo8DbGDsnMAjnoHhJotMbDZiHfvxM4j65d8prXUr",
      type: "JsonWebKey2020",
      controller: "did:key:z6MkokrsVo8DbGDsnMAjnoHhJotMbDZiHfvxM4j65d8prXUr",
      publicKeyJwk: {kty: "OKP", crv: "Ed25519", x: "ijtvFnowiumYMcYVbaz6p64Oz6bXwe2V_9IlCgDR_38"},
      privateKeyJwk: {
        kty: "OKP",
        crv: "Ed25519",
        x: "ijtvFnowiumYMcYVbaz6p64Oz6bXwe2V_9IlCgDR_38",
        d: "ZrHpIW1JBb-sK2-wzKV0mQjbxpnxjUCu151QZ9_F_Vs"
      },
    };
    mockSuite = new JsonWebSignature({
      key: await JsonWebKey.from(key as JsonWebKey2020),
    });
    mockCredential = {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://w3id.org/security/suites/jws-2020/v1",
      ],
      id: "http://example.edu/credentials/3732",
      type: ["VerifiableCredential"],
      issuer: {
        id: "did:key:z6MkokrsVo8DbGDsnMAjnoHhJotMbDZiHfvxM4j65d8prXUr",
      },
      issuanceDate: "2010-01-01T19:23:24Z",
      credentialSubject: {
        id: "did:key:z6MkokrsVo8DbGDsnMAjnoHhJotMbDZiHfvxM4j65d8prXUr",
      },
    };

    mockPresentation = {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://w3id.org/security/suites/jws-2020/v1",
      ],
      type: ["VerifiablePresentation"],
      holder: {
        id: key.controller,
      },
    };

    mockBlockchainProvider = {
      getNFTOwners(asset: AssetId): Promise<string[]> {
        return Promise.resolve(["owner1"]);
      },
      getMintedAssets: jest.fn(),
      mintNFT: jest.fn(),
      setSigner: jest.fn()
    };
  });

  test('should sign credential', async () => {
    const provider = new TransmuteSSIProvider(getDocumentLoader(mockBlockchainProvider));
    const signedCredential = await provider.signCredential(mockCredential, mockSuite);
    expect(signedCredential).toBeDefined();
    expect(signedCredential.proof).toBeDefined();
    expect(signedCredential.proof.type).toEqual("JsonWebSignature2020");
  }, 500_000);

  test('should sign presentation', async () => {
    const provider = new TransmuteSSIProvider(getDocumentLoader(mockBlockchainProvider));
    const challenge = "some-challenge-string";
    const signedPresentation = await provider.signPresentation(mockPresentation, mockSuite, challenge);
    expect(signedPresentation).toBeDefined();
    expect(signedPresentation.proof).toBeDefined();
    expect(signedPresentation.proof.type).toEqual("JsonWebSignature2020");
  }, 500_000);

  test('should verify credential', async () => {
    const provider = new TransmuteSSIProvider(getDocumentLoader(mockBlockchainProvider));
    const signedCredential = await provider.signCredential(mockCredential, mockSuite);
    console.log(signedCredential);
    const verificationResult = await provider.verifyCredential(signedCredential, mockSuite);
    expect(verificationResult).toBe(true);
  }, 500_000);

  test('should verify presentation', async () => {
    const provider = new TransmuteSSIProvider(getDocumentLoader(mockBlockchainProvider));
    const challenge = "some-challenge-string";
    const signedPresentation = await provider.signPresentation(mockPresentation, mockSuite, challenge);
    console.log("signed", signedPresentation);
    const verificationResult = await provider.verifyPresentation(signedPresentation, mockSuite, challenge);
    expect(verificationResult).toBe(true);
  }, 500_000);

});
