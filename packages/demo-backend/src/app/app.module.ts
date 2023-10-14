import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import {HolderModule} from "./holder/holder.module";

@Module({
  imports: [HolderModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
