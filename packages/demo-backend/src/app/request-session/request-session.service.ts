import {Injectable, MethodNotAllowedException, NotFoundException} from '@nestjs/common';
import {IssueSession} from "../IssueSession/issue-session.schema";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {RequestSession} from "./request-session.schema";

@Injectable()
export class RequestSessionService {

  constructor(@InjectModel(RequestSession.name) private requestSessionModel: Model<RequestSession>) {}

  async create(requestSession: RequestSession): Promise<string> {
    return await this.requestSessionModel.create(requestSession).then(r => r.id);
  }

  async getRequestSession(id: string): Promise<RequestSession> {
    return this.requestSessionModel
      .findOne({ _id: id })
      .exec();
  }

  async updatePresentation(id: string, presentation: string): Promise<RequestSession> {
    const p = await this.requestSessionModel.findOne({_id: id}).exec();
    if (!p) throw new NotFoundException("Presentation request not found.");

    if (p.status === "SUBMITED") throw new MethodNotAllowedException("Presentation request already submitted.");

    p.presentation = presentation;
    p.status= "SUBMITED"
    return p.save()
  }

  async findAll(): Promise<RequestSession[]> {
    return this.requestSessionModel.find().exec();
  }

  async findAllByIssuer(issuerName: string): Promise<RequestSession[]> {
    return this.requestSessionModel.find({issuerName: issuerName}).exec();
  }

}
