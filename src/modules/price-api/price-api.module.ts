import { NestCacheModule } from '@modules/cache/cache.module';
import { ServerTokensModule } from '@modules/server-tokens/server-tokens.module';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PriceApiController } from './price-api.controller';
import { PriceApiCoreHttpService } from './services/price-api-core-http.service';
import { PriceApiService } from './services/price-api-ticker.service';

@Module({
  imports: [NestCacheModule, HttpModule, ServerTokensModule],
  providers: [PriceApiService, PriceApiCoreHttpService],
  controllers: [PriceApiController],
})
export class PriceApiModule {}
