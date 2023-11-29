import { NestCacheModule } from '@modules/cache/cache.module';
import { DbModule } from '@modules/db/db.module';
import { Module } from '@nestjs/common';
import { ServerTokensService } from './services/server-tokens.service';

@Module({
  imports: [DbModule, NestCacheModule],
  providers: [ServerTokensService],
  exports: [ServerTokensService],
})
export class ServerTokensModule {}
