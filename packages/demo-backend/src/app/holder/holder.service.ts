import { Injectable } from '@nestjs/common';
import {Holder, generateOwnershipChallengeMessage} from "@vcnft/core"

@Injectable()
export class HolderService {
  getData(): { message: string } {
    return { message: 'Hello API' };
  }

  getChallengeMessage() {
    return { message: generateOwnershipChallengeMessage("did:nft:eip155_1:erc721_0x123123:2") };
  }
}
