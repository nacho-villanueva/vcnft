import {SSIProvider, Suite, VerifiableCredential, VerifiablePresentation} from "@vcnft/core";
import { verifiable } from "@transmute/vc.js";
import {DocumentLoader, documentLoaderFactory} from "@transmute/jsonld-document-loader";

export class TransmuteSSIProvider implements SSIProvider {

  private documentLoader: any;

  constructor(documentLoader?: DocumentLoader) {
    this.documentLoader = documentLoader ?? documentLoaderFactory.build();
  }

  setDocumentLoader(documentLoader: DocumentLoader) : TransmuteSSIProvider {
    this.documentLoader = documentLoader;
    return this;
  }

    async signCredential(credential: VerifiableCredential, suite:Suite): Promise<VerifiableCredential> {
      return (await verifiable.credential.create({
        credential,
        format: ["vc", "vc-jwt"],
        documentLoader: this.documentLoader,
        suite: suite,
      })).items[0];
    }

    async signPresentation(presentation: VerifiablePresentation, suite: Suite, challenge: string): Promise<VerifiablePresentation> {
      return (await verifiable.presentation.create({
        presentation,
        format: ["vp", "vp-jwt"],
        documentLoader: this.documentLoader,
        challenge: challenge, // this is supplied by the verifier / presentation recipient
        suite: suite,
      })).items[0];
    }

    async verifyCredentialJWT(credential: VerifiableCredential, suite: Suite): Promise<boolean> {
      const verification = (await verifiable.credential.verify({
        credential,
        format: ["vc", "vc-jwt"],
        documentLoader: this.documentLoader,
        suite: suite
      }));

      console.log(JSON.stringify(verification, null, 2))

      return verification.verified;
    }

  async verifyPresentationJWT(presentation: VerifiablePresentation, suite: Suite, challenge: string): Promise<boolean> {
    return (await verifiable.presentation.verify({
      presentation,
      format: ["vp", "vp-jwt"],
      documentLoader: this.documentLoader,
      challenge: challenge,
      suite: suite
    })).verified;
  }


}
