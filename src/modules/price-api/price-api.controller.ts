import { NoCaching } from '@common/decorators/no-caching.decorator';
import { ServerTokensService } from '@modules/server-tokens/services/server-tokens.service';
import { Controller, Get, Headers } from '@nestjs/common';
import { PriceApiService } from './services/price-api-ticker.service';

@Controller('price-api')
export class PriceApiController {
  constructor(
    private readonly api: PriceApiService,
    private readonly serverAdminToken: ServerTokensService,
  ) {}

  async checkAdminTokenValidity(token: string) {
    return this.serverAdminToken.validateToken(token);
  }

  @Get('')
  @NoCaching()
  async getPriceTicker(@Headers('lv-srv-adm') srvToken: string) {
    const valid = await this.checkAdminTokenValidity(srvToken);

    if (!valid) {
      return { error: 'Invalid server admin token' };
    }

    const tokenData = await this.api.getTickerPrice();
    return tokenData;
  }
}
