import {ApiTags} from "@nestjs/swagger";
import {Controller, Get, Inject} from "@nestjs/common";
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



}
