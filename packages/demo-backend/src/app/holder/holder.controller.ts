import {Body, Controller, Get, Post} from '@nestjs/common';

import { HolderService } from './holder.service';
import {ethers} from "ethers";

@Controller("/holder")
export class HolderController {
  constructor(private readonly appService: HolderService) {}

  @Get("/challenge")
  getData() {
    return this.appService.getChallengeMessage();
  }

  @Post("/challenge")
  postChallenge(@Body('challenge') challenge: {message: string, signature: string}) {
    const message = challenge.message;
    const signature = challenge.signature;

    const signerAddress = ethers.verifyMessage(message, signature);
    console.log('Content:', message);
    console.log('Signer Address:', signerAddress);
  }
}
