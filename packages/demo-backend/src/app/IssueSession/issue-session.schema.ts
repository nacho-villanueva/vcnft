import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {Credential, NftDidCreation} from '@vcnft/core';

export type IssueSessionDocument = HydratedDocument<IssueSession>;

@Schema()
export class IssueSession {

  @Prop()
  issuedAt: Date;

  @Prop()
  issuerName: string;

  @Prop()
  status: "PENDING" | "CLAIMED" | "CONFIRMING" | "ISSUED" | "FAILED";

  @Prop()
  issuerDID: string;

  @Prop()
  forAddress?: string;

  @Prop()
  nftDidCreation?: string;

  @Prop()
  claims: string;

  @Prop()
  issuedCredential?: string;

  @Prop()
  chainId?: string;

  @Prop({default: false})
  requiresConfirmation?: boolean;
}

export const IssueSessionSchema = SchemaFactory.createForClass(IssueSession);
