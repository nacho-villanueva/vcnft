import {Inject, Injectable} from '@nestjs/common';
import {RequestSessionService} from "../request-session/request-session.service";
import {generateOwnershipProofMessage, Verifier} from "@vcnft/core";
import {VcnftService} from "../vcnft/vcnft.service";


@Injectable()
export class VerifierService {

  private readonly verifier: Verifier

  constructor(
    @Inject(RequestSessionService) private readonly requestSessionService: RequestSessionService,
    @Inject(VcnftService) private readonly vcnftService: VcnftService,
  ) {
    this.verifier = new Verifier(this.vcnftService.getBlockchainProvider(), this.vcnftService.getSSIProvider())
  }

  requestPresentation(claims: Array<string>) {
    return this.requestSessionService.create({
      issuedAt: new Date(),
      status: "PENDING",
      claims: claims,
      presentation: ""
    })
  }

  async verifyPresentationRequest(id: string) {
    const requestSession = await this.requestSessionService.getRequestSession(id)
    if (requestSession.status === "SUBMITED") {
      const verified = await this.verifier.verifyVcnftPresentationJwt(requestSession.presentation, this.vcnftService.getResolver());

      const addr = await this.verifier.getAddressFromPresentation(verified.verifiedPresentation)

      return {
        status: "SUBMITED",
        verified: verified.verified,
        metadata: verified.metadata,
        holder: verified.verifiedPresentation.verifiablePresentation.holder,
        holderAccount: addr.toString(),
        subject: verified.verifiedPresentation.verifiablePresentation.verifiableCredential
          .map(vc => vc.credentialSubject.id)
          .filter(id => id !== undefined)[0],
        claims: Object.fromEntries(verified.verifiedPresentation.verifiablePresentation.verifiableCredential
          .map(vc => Object.entries(vc.credentialSubject).filter(([key, value]) => key !== "id"))
          .flat())
      };
    }
    return {
      status: "PENDING",
      verified: false,
      metadata: [],
    };
  }

}
