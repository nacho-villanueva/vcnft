import {KeyType, TBDSSIProvider} from "./tbd";
import {VerifiableCredential, VerifiablePresentation, W3CCredential} from "@vcnft/core";

describe('TBDSSIProvider', () => {

  let provider: TBDSSIProvider;

  let mockIssuerDid: string;
  let mockVerificationMethodId: string;
  let mockHolderDid: string;

  let mockCredential: W3CCredential;
  let mockPresentation: VerifiablePresentation;


  beforeAll(async () => {
    provider = new TBDSSIProvider("http://tbd.vcnft.me:8080");
    const dids = await provider.getDids("key");
    if (!dids || dids.length < 2) {
      mockIssuerDid = (await provider.generateDid("key", KeyType.ED25519))["id"];
      mockHolderDid = (await provider.generateDid("key", KeyType.ED25519))["id"];
    } else {
      mockIssuerDid = dids[0]["id"];
      mockHolderDid = dids[1]["id"];
    }

    mockVerificationMethodId = mockIssuerDid + "#" + mockIssuerDid.split(":")[2];

    console.log("mockIssuerDid", mockIssuerDid)
    console.log("mockHolderDid", mockHolderDid)

    mockCredential = {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://w3id.org/security/suites/jws-2020/v1",
      ],
      id: "http://example.edu/credentials/3732",
      type: ["VerifiableCredential"],
      issuer: mockIssuerDid,
      issuanceDate: "2010-01-01T19:23:24Z",
      credentialSubject: {
        id: mockHolderDid,
      },
    } as W3CCredential;

    mockPresentation = {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://w3id.org/security/suites/jws-2020/v1",
      ],
      type: ["VerifiablePresentation"],
      holder: "did:key:z6MkokrsVo8DbGDsnMAjnoHhJotMbDZiHfvxM4j65d8prXUr",
    } as VerifiablePresentation;
  });

  // test("should generate did", async () => {
  //   const did = await provider.generateDid("key", KeyType.ED25519);
  //   console.log(did)
  //   expect(did).toBeDefined();
  //   expect(did["id"].startsWith("did:key:")).toBe(true);
  // });

  test('should sign credential', async () => {
    const signedCredential = await provider.signCredential(mockCredential, mockVerificationMethodId);
    console.log(signedCredential)
    expect(signedCredential).toBeDefined();
    expect(signedCredential.jwt).toBeDefined();
    expect(signedCredential.payload).toBeDefined();
  }, 500_000);


  test('should verify credential', async () => {
    const signedCredential = await provider.signCredential(mockCredential, mockVerificationMethodId);
    console.log(signedCredential);
    const verificationResult = await provider.verifyCredentialJWT(signedCredential.jwt);
    expect(verificationResult).toBe(true);
  }, 500_000);

  //
  // test('should verify presentation', async () => {
  //   const provider = new TransmuteSSIProvider(getDocumentLoader(mockBlockchainProvider));
  //   const challenge = "some-challenge-string";
  //   const signedPresentation = await provider.signPresentation(mockPresentation, mockSuite, challenge);
  //   console.log("signed", signedPresentation);
  //   const verificationResult = await provider.verifyPresentation(signedPresentation, mockSuite, challenge);
  //   expect(verificationResult).toBe(true);
  // }, 500_000);

});
