import { Module } from '@nestjs/common';

import { HolderController } from './holder.controller';
import { HolderService } from './holder.service';
import {RequestSessionModule} from "../request-session/request-session.module";

@Module({
  imports: [RequestSessionModule],
  controllers: [HolderController],
  providers: [HolderService],
})
export class HolderModule {}
