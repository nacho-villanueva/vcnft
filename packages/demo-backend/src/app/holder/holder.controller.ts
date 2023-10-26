import {Body, Controller, Delete, Get, Inject, Param, Post, Put} from '@nestjs/common';
import {RequestSessionService} from "../request-session/request-session.service";
import {Verifier} from "@vcnft/core";
import {VcnftService} from "../vcnft/vcnft.service";
import {TransferSessionService} from "../transfer-session/transfer-session.service";

@Controller("/holder")
export class HolderController {
    private readonly vcnftVerifier: Verifier

    constructor(
        @Inject(RequestSessionService) private readonly requestSessionService: RequestSessionService,
        @Inject(VcnftService) private readonly vcnftService: VcnftService,
        @Inject(TransferSessionService) private readonly transferSessionService: TransferSessionService,
    ) {
        this.vcnftVerifier = new Verifier(this.vcnftService.getBlockchainProvider(), this.vcnftService.getSSIProvider())
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
} {


}
