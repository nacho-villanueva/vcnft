import {Body, Controller, Delete, Get, Inject, Param, Post, Put} from '@nestjs/common';
import {RequestSessionService} from "../request-session/request-session.service";
import {Verifier} from "@vcnft/core";
import {VcnftService} from "../vcnft/vcnft.service";
import {TransferSessionService} from "../transfer-session/transfer-session.service";
import {IssueSessionService} from "../IssueSession/issue-session.service";
import {IssuerService} from "../issuer/issuer.service";

@Controller("/holder")
export class HolderController {
    private readonly vcnftVerifier: Verifier

    constructor(
        @Inject(RequestSessionService) private readonly requestSessionService: RequestSessionService,
        @Inject(IssueSessionService) private readonly issuerSessionService: IssueSessionService,
        @Inject(IssuerService) private readonly issuerService: IssuerService,
        @Inject(VcnftService) private readonly vcnftService: VcnftService,
        @Inject(TransferSessionService) private readonly transferSessionService: TransferSessionService,
    ) {
        this.vcnftVerifier = new Verifier(this.vcnftService.getBlockchainProvider(), this.vcnftService.getSSIProvider())
    }

    @Get("/claim/:id")
    async getClaim(@Param("id") id: string) {
        return await this.issuerSessionService.getIssueSession(id);
    }

    @Post("/claim/:id")
    async postClaim(@Param("id") id: string, @Body('address') address: string) {
      return this.issuerService.claimVcNftRequest(id, address);
    }

    @Post("/credential/resolved")
    async getResolvedCredentials(@Body('ids') ids: string[]) {
      let resolved = {}
      for (const id of ids) {
        try {
          const res = await this.issuerService.getIssuedCredential(id);
          if (res && res.status === "ISSUED") {
            resolved = {
              ...resolved,
              [id]: res.credential
            }
          }
        }
        catch (e) {
          console.error("Error resolving credential", e);
        }
      }
      return resolved;
    }

    @Post("/verify/:id")
    async postPresentation(@Param("id") id: string, @Body('presentation') presentation: string) {
        return this.requestSessionService.updatePresentation(id, presentation);
    }

    @Post("/credential/verify")
    async verifyPresentation(@Body('presentation') presentation: string) {
        const verified = await this.vcnftVerifier.verifyVcnftPresentationJwt(presentation, this.vcnftService.getResolver());

        return {
            verified: verified.verified,
            error: verified.metadata,
        }
    }

    @Get("/verify/:id")
    async getPresentationRequest(@Param("id") id: string) {
        return this.requestSessionService.getRequestSession(id);
    }

    @Get("/credential/transfer/:address")
    async getTransferCredentials(@Param("address") address: string) {
        return this.transferSessionService.findAllForAddress(address);
    }

    @Delete("/credential/transfer/:address")
    async deleteTransferCredentials(@Param("address") address: string) {
        return this.transferSessionService.deleteTransferSession(address);
    }

    @Put("/credential/transfer/:address")
    async transferCredentials(@Param("address") address: string, @Body('credentials') credentials: string[]) {
        return this.transferSessionService.setTransferCredentials(address, credentials);}
}
