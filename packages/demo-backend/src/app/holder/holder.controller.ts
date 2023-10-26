import {Body, Controller, Get, Inject, Param, Post} from '@nestjs/common';

import { HolderService } from './holder.service';
import {ethers} from "ethers";
import {RequestSessionService} from "../request-session/request-session.service";

@Controller("/holder")
export class HolderController {
  constructor(
    // private readonly appService: HolderService,
    @Inject(RequestSessionService) private readonly requestSessionService: RequestSessionService,
  ) {}

  // @Get("/challenge")
  // getData() {
  //   return this.appService.getChallengeMessage();
  // }
  //
  // @Post("/challenge")
  // postChallenge(@Body('challenge') challenge: {message: string, signature: string}) {
  //   const message = challenge.message;
  //   const signature = challenge.signature;
  //
  //   const signerAddress = ethers.verifyMessage(message, signature);
  //   console.log('Content:', message);
  //   console.log('Signer Address:', signerAddress);
  // }
  //
  @Post("/verify/:id")
  async postPresentation(@Param("id") id: string, @Body('presentation') presentation: string) {
    return this.requestSessionService.updatePresentation(id, presentation);
  }
}
