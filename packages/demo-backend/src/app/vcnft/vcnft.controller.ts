import {ApiTags} from "@nestjs/swagger";
import {Body, Controller, Get, Inject, Param, Post, Query} from "@nestjs/common";
import {VcnftService} from "./vcnft.service";

@ApiTags('VCNFT')
@Controller('vcnft')
export class VcnftController {

  constructor(
    @Inject(VcnftService) private readonly vcnftService: any
  ) {}

  @Get("/ssi-provider/health")
  async getHealth() {
    return this.vcnftService.getSSIProvider().health();
  }

  @Post("/faucet/:chain")
  async faucet(@Body() body: {address: string}, @Param("chain") chain: string) {
    return this.vcnftService.faucet(chain, body.address);
  }

  @Get("/faucet/:chain")
  async getFaucetBalance(@Param("chain") chain: string) {
    return this.vcnftService.getFaucetBalance(chain);
  }




}
