import { Module } from '@nestjs/common';
import {VcnftService} from "./vcnft.service";
import {VcnftController} from "./vcnft.controller";

@Module({
  providers: [VcnftService],
  controllers: [VcnftController],
  exports: [VcnftService]
})
export class VcnftModule {}
