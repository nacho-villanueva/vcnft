import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {IssueSession, IssueSessionSchema} from "./issue-session.schema";
import {IssueSessionService} from "./issue-session.service";

@Module({
  imports: [MongooseModule.forFeature([{ name: IssueSession.name, schema: IssueSessionSchema }])],
  providers: [IssueSessionService],
  exports: [IssueSessionService],
})
export class IssueSessionModule {}
