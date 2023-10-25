import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import {HolderModule} from "./holder/holder.module";
import { MongooseModule } from '@nestjs/mongoose';
import {IssuerModule} from "./issuer/issuer.module";
import {VcnftModule} from "./vcnft/vcnft.module";
import {ConfigModule} from "@nestjs/config";
import {CredentialsModule} from "./credentials/credentials.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HolderModule,
    IssuerModule,
    VcnftModule,
    CredentialsModule,
    MongooseModule.forRoot(`mongodb://mongoadmin:bdung@${process.env.MONGO_HOST}`)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
