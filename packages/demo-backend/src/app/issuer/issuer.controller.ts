import {Controller, Get, Post, Param, Put, Res, HttpStatus, HttpCode, Body} from '@nestjs/common';
import {IssuerService} from "./issuer.service";
import {IssueSessionService} from "../IssueSession/issue-session.service";
import {ApiBody, ApiProperty, ApiResponse, ApiTags} from "@nestjs/swagger";
import {Issuer} from "./issue.schema";

@ApiTags('Issuer')
@Controller('issuer')
export class IssuerController {

    constructor(
        private readonly issuerService: IssuerService,
        private readonly issueSessionService: IssueSessionService
    ) {
    }

    // @Post("/issue/credential")
    // @ApiOperation({ summary: 'Issue a credential'})
    // async issueCredential(@Body() issueSession: IssueSession) {
    //   return await this.issueSessionService.create(issueSession);
    // }
    //
    // @Post("/issue/nftdid")
    // async issueNftDid() {
    //   return await this.issuerService.issueNftDid();
    // }

    @ApiProperty({
        description: "Create an issuer",
    })
    @Post("/:name")
    async create(@Param("name") name: string, @Res() res: Response) {
        return this.issuerService.create(name);
    }

    @ApiProperty({
        description: "Get an issuer",
    })
    @ApiResponse({
        status: 200,
        description: "Issuer",
        type: Issuer,
    })
    @Get("/:name")
    async getIssuer(@Param("name") name: string) {
        return this.issuerService.getIssuer(name);
    }

    @ApiProperty({
        description: "Get Issuer's DID",
    })
    @Get("/:name/did")
    @ApiResponse({
        status: 200,
        description: "Issuer's DID",
        type: String,
    })
    async getDid(@Param("name") name: string) {
        return this.issuerService.getDid(name);
    }

    @ApiProperty({
        description: "Generate a DID for the issuer, and set it as the issuer's DID.",
    })
    @ApiResponse({
        status: 201,
        description: "Issuer's DID",
        type: String,
    })
    @HttpCode(201)
    @Put("/:name/did")
    async generateDid(@Param("name") name: string) {
        return await this.issuerService.generateDid(name);
    }

    @ApiProperty({
        description: "Set the issuer's signer"
    })
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                signer: {
                    type: "string",
                }
            }
        }
    })
    @HttpCode(200)
    @Put("/:name/signer")
    async setSigner(@Param("name") name: string, @Body("signer") signer: string) {
        await this.issuerService.setSigner(name, signer);
        return {status: "ok"}
    }

    @ApiProperty({description: "Set the issuer's default chain"})
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                chainId: {
                    type: "string", example: "eip155:5"
                }
            }
        }
    })
    @HttpCode(200)
    @Put("/:name/chain")
    async setDefaultChain(@Param("name") name: string, @Body("chainId") chainId: string) {
        return await this.issuerService.setDefaultChain(name, chainId);
    }

    @ApiProperty({description: "Issue a VCNFT"})
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                to: {
                    type: "string",
                    example: "0x1234",
                    description: "The address to send the VCNFT to"
                },
                claims: {
                    type: "object",
                    example: {"Make": "Ferrari", "Model": "Enzo"},
                    description: "The claims to include in the VCNFT"
                }
            }
        }
    })
    @HttpCode(200)
    @Post("/:name/issue/vcnft")
    async issueVcNft(@Param("name") name: string, @Body("to") to: string, @Body("claims") claims: Record<string, any>) {
        return await this.issuerService.issueVcNft(name, to, claims);
    }

    @ApiProperty({description: "Fetch Issued Credential"})
    @HttpCode(200)
    @Get("/:name/issue/vcnft/:id")
    async getIssuedCredential(@Param("name") name: string, @Param("id") id: string) {
        return await this.issuerService.getIssuedCredential(id);
    }

    @ApiProperty({description: "Fetch Issued Credentials"})
    @HttpCode(200)
    @Get("/:name/issue/vcnft")
    async getIssuedCredentials(@Param("name") name: string) {
        return await this.issueSessionService.findAllByIssuer(name);
    }


}
