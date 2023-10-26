import {Injectable, MethodNotAllowedException, NotFoundException} from '@nestjs/common';
import {IssueSession} from "../IssueSession/issue-session.schema";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {TransferSession} from "./transfer-session.schema";

@Injectable()
export class TransferSessionService {

  constructor(@InjectModel(TransferSession.name) private transferSessionModel: Model<TransferSession>) {}

  async create(transferSession: TransferSession): Promise<string> {
    return await this.transferSessionModel.create(transferSession).then(r => r.id);
  }

  async getTransferSession(id: string): Promise<TransferSession> {
    return this.transferSessionModel
      .findOne({ _id: id })
      .exec();
  }

  async setTransferCredentials(address: string, credentials: string[]): Promise<TransferSession> {
    return this.transferSessionModel.create({
        forAddress: address,
        credentials: credentials,
        status: "SUBMITED"
    })
  }

  async findAllForAddress(forAddress: string): Promise<TransferSession[]> {
    return this.transferSessionModel.find({forAddress: forAddress}).exec();
  }

  async deleteTransferSession(address: string) {
    return this.transferSessionModel.deleteMany({forAddress: address}).exec();
  }

}
