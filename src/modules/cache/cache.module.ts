import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { NestCacheService } from './cache.service';

@Module({
  imports: [CacheModule.register()],
  providers: [NestCacheService],
  exports: [NestCacheService],
})
export class NestCacheModule {}
