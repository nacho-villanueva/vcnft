import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {Credential, NftDidCreation} from '@vcnft/core';

export type RequestSessionDocument = HydratedDocument<RequestSession>;

@Schema()
export class RequestSession {

  @Prop()
  issuedAt: Date;

  @Prop()
  status: "PENDING" | "SUBMITED" | "REJECTED" | "APPROVED";

  @Prop()
  claims: Array<string>;

  @Prop()
  presentation: string;
}

export const RequestSessionSchema = SchemaFactory.createForClass(RequestSession);
