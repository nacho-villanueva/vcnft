import { Test, TestingModule } from '@nestjs/testing';
import { IssuerController } from './issuer.controller';
import {INestApplication} from "@nestjs/common";
import {agent, SuperAgentTest} from "supertest";
import {IssueSessionModule} from "../IssueSession/issue-session.module";
import {VcnftModule} from "../vcnft/vcnft.module";
import {MongooseModule} from "@nestjs/mongoose";
import {Issuer, IssuerSchema} from "./issue-session.schema";
import {IssuerService} from "./issuer.service";

describe('IssuerController', () => {
  let app: INestApplication;
  let controller: IssuerController;
  let request: SuperAgentTest

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        IssueSessionModule,
        VcnftModule,
        MongooseModule.forFeature([{ name: Issuer.name, schema: IssuerSchema }])
      ],
      controllers: [IssuerController],
      providers: [IssuerService],
    }).compile();

    controller = module.get<IssuerController>(IssuerController);

    app = module.createNestApplication();
    await app.init();

    request = agent(app.getHttpServer())
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create and get did', async () => {
    await request
      .put("/issuer/test/did")
      .expect(201)

    await request
      .get("/issuer/test/did")
      .expect(200)
      .expect((res) => (res.body as string).startsWith("did:ion:"))
  });
});
