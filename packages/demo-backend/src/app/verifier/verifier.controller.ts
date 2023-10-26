import {Body, Controller, Get, Param, Post, Put} from '@nestjs/common';
import {ApiProperty, ApiResponse} from "@nestjs/swagger";
import {Issuer} from "../issuer/issue.schema";
import {VerifierService} from "./verifier.service";

@Controller('verifier')
export class VerifierController {

  constructor(
    private readonly verifierService: VerifierService,
  ) {

  }

  @ApiProperty({
    description: "Verify a JWT Presentation",
  })
  @ApiResponse({
    status: 200,
    description: "Verification",
    type: Object,
  })
  @Get("/verify/:id")
  async getIssuer(@Param("id") id: string) {
    return this.verifierService.verifyPresentationRequest(id)
  }

  @ApiProperty({
    description: "Request a JWT Presentation",
  })
  @ApiResponse({
    status: 200,
    description: "Verification",
    type: Object,
  })
  @Put("/verify")
  async requestPresentation(@Body("claims") claims: Array<string>) {
    return this.verifierService.requestPresentation(claims)
  }

}
