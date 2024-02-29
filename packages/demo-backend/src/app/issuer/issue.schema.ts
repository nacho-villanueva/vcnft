import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {HydratedDocument} from 'mongoose';
import * as process from "process";

export type IssuerDocument = HydratedDocument<Issuer>;

@Schema()
export class Issuer {

  @Prop({
    unique: true,
    required: true
  })
  name: string;

  @Prop({
    default: process.env.DEFAULT_CHAIN || "eip155:11155111"
  })
  defaultChain: string;

  @Prop()
  did: string;

  @Prop()
  signer: string;
}

export const IssuerSchema = SchemaFactory.createForClass(Issuer);
