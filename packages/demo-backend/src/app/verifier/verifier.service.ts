import {Inject, Injectable} from '@nestjs/common';
import {RequestSessionService} from "../request-session/request-session.service";
import {Verifier} from "@vcnft/core";
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
      return {
        status: "SUBMITED",
        verified: verified.verified,
        metadata: verified.metadata, //
      };
    }
    return {
      status: "PENDING",
      verified: false,
      claims: [],
    };
  }

}
