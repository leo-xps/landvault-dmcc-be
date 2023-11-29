import { NestCacheModule } from '@modules/cache/cache.module';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AgoraCoreHttpService } from './services/agora-core-http.service';
import { AgoraCoreTokenService } from './services/agora-core-token.service';

@Module({
  imports: [NestCacheModule, HttpModule],
  providers: [AgoraCoreTokenService, AgoraCoreHttpService],
  exports: [AgoraCoreTokenService, AgoraCoreHttpService],
})
export class AgoraCoreModule {}
