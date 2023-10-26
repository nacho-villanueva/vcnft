import { Module } from '@nestjs/common';
import { VerifierService } from './verifier.service';
import {VerifierController} from "./verifier.controller";
import {VcnftModule} from "../vcnft/vcnft.module";
import {RequestSessionModule} from "../request-session/request-session.module";

@Module({
  controllers: [VerifierController],
  providers: [VerifierService],
  imports: [VcnftModule, RequestSessionModule],
})
export class VerifierModule {}
