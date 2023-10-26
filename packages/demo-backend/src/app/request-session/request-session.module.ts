import { Module } from '@nestjs/common';
import { RequestSessionService } from './request-session.service';
import {MongooseModule} from "@nestjs/mongoose";
import {IssueSession, IssueSessionSchema} from "../IssueSession/issue-session.schema";
import {IssueSessionService} from "../IssueSession/issue-session.service";
import {RequestSession, RequestSessionSchema} from "./request-session.schema";

@Module({
  imports: [MongooseModule.forFeature([{ name: RequestSession.name, schema: RequestSessionSchema }])],
  providers: [RequestSessionService],
  exports: [RequestSessionService],
})
export class RequestSessionModule {}
