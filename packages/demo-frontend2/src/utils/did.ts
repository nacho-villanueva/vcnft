// @ts-ignore
import { anchor, DID, generateKeyPair } from '@decentralized-identity/ion-tools';

export async function createDID() {
  let authnKeys = await generateKeyPair();
  let did = new DID({
    content: {
      publicKeys: [
        {
          id: 'key-1',
          type: 'EcdsaSecp256k1VerificationKey2019',
          publicKeyJwk: authnKeys.publicJwk,
          purposes: [ 'authentication' ]
        }
      ],
      services: [
        {
          id: 'domain-1',
          type: 'LinkedDomains',
          serviceEndpoint: 'https://foo.example.com'
        }
      ]
    }
  });

  let createRequest = await did.generateRequest(0);
  let anchorResponse = await anchor(createRequest);

  let ionOps = await did.getAllOperations();
  console.log(ionOps);
}
