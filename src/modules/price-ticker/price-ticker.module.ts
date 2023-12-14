import { PuppeteerModule } from '@modules/puppeteer/puppeteer.module';
import { Module } from '@nestjs/common';
import { PriceTickerController } from './price-ticker.controller';
import { PriceTicker2Controller } from './price-ticker2.controller copy';

@Module({
  imports: [PuppeteerModule],
  controllers: [PriceTickerController, PriceTicker2Controller],
})
export class PriceTickerModule {}
