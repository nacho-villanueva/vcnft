import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IssueSession } from './issue-session.schema';
import {CarCredential} from "../credentials/car-credential";

@Injectable()
export class IssueSessionService {
  constructor(@InjectModel(IssueSession.name) private issueSessionModel: Model<IssueSession>) {}

  async create(issueSession: IssueSession): Promise<IssueSession> {
    const createdIssueSession = new this.issueSessionModel(issueSession);

    return createdIssueSession.save();
  }

  async getIssueSession(id: string): Promise<IssueSession> {
    return this.issueSessionModel
      .findOne({ _id: id })
      .exec();
  }

  async findAll(): Promise<IssueSession[]> {
    return this.issueSessionModel.find().exec();
  }

  async findAllByIssuer(issuerName: string): Promise<IssueSession[]> {
    return this.issueSessionModel.find({issuerName: issuerName}).exec();
  }

  async claim(id: string ,address: string, tx: string): Promise<boolean> {
    return this.issueSessionModel.updateOne({_id: id}, {status: "CLAIMED",
      forAddress: address,
      nftDidCreation: tx})
      .exec().then((res) => res.acknowledged);
  }

  async issue(id: string, credential: string): Promise<boolean> {
    return this.issueSessionModel.updateOne({_id: id}, {status: "ISSUED", issuedCredential: credential})
      .exec().then((res) => res.acknowledged);
  }
}
