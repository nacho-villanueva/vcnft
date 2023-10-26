import { Module } from '@nestjs/common';

import { HolderController } from './holder.controller';
import { HolderService } from './holder.service';
import {RequestSessionModule} from "../request-session/request-session.module";
import {VcnftModule} from "../vcnft/vcnft.module";
import {TransferSessionModule} from "../transfer-session/transfer-session.module";

@Module({
  imports: [RequestSessionModule, TransferSessionModule, VcnftModule],
  controllers: [HolderController],
  providers: [HolderService],
})
export class HolderModule {}
