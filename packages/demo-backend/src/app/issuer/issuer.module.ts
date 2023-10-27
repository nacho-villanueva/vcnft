import { Module } from '@nestjs/common';
import { IssuerController } from './issuer.controller';
import { IssuerService } from './issuer.service';
import {IssueSessionModule} from "../IssueSession/issue-session.module";
import {VcnftModule} from "../vcnft/vcnft.module";
import {MongooseModule} from "@nestjs/mongoose";
import {Issuer, IssuerSchema} from "./issue.schema";
import {TransferSessionModule} from "../transfer-session/transfer-session.module";

@Module({
  imports: [
    IssueSessionModule,
    VcnftModule,
      TransferSessionModule,
    MongooseModule.forFeature([{ name: Issuer.name, schema: IssuerSchema }])
  ],
  controllers: [IssuerController],
  providers: [IssuerService],
})
export class IssuerModule {}


// hello
