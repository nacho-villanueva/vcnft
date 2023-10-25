import { Module } from '@nestjs/common';
import { CredentialsService } from './credentials.service';

@Module({
  providers: [CredentialsService],
})
export class CredentialsModule {}
