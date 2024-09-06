import { RestAuthGuard } from '@common/auth/guards/rest-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { NoCaching } from '@common/decorators/no-caching.decorator';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { PriceApiService } from './services/price-api-ticker.service';

@Controller('price-api')
export class PriceApiController {
  constructor(private readonly api: PriceApiService) {}

  @Get('')
  @NoCaching()
  @UseGuards(RestAuthGuard)
  async getPriceTicker(@CurrentUser('id') userId: string) {
    const tokenData = await this.api.getTickerPrice();
    return tokenData;
  }
}
