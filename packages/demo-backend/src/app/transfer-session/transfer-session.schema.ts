import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {Credential, NftDidCreation} from '@vcnft/core';

export type TransferSessionDocument = HydratedDocument<TransferSession>;

@Schema()
export class TransferSession {

  @Prop()
  forAddress: string;

  @Prop()
  status: "PENDING" | "SUBMITED";

  @Prop()
  credentials: string[];
}

export const TransferSessionSchema = SchemaFactory.createForClass(TransferSession);
