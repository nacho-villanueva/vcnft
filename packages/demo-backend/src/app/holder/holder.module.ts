import { Module } from '@nestjs/common';

import { HolderController } from './holder.controller';
import { HolderService } from './holder.service';

@Module({
  imports: [],
  controllers: [HolderController],
  providers: [HolderService],
})
export class HolderModule {}
