import { Module } from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import {TransferSession, TransferSessionSchema} from "./transfer-session.schema";
import {TransferSessionService} from "./transfer-session.service";

@Module({
  imports: [MongooseModule.forFeature([{ name: TransferSession.name, schema: TransferSessionSchema }])],
  providers: [TransferSessionService],
  exports: [TransferSessionService],
})
export class TransferSessionModule {}
