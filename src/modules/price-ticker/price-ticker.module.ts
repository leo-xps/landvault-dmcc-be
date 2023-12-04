import { PuppeteerModule } from '@modules/puppeteer/puppeteer.module';
import { Module } from '@nestjs/common';
import { PriceTickerController } from './price-ticker.controller';

@Module({
  imports: [PuppeteerModule],
  controllers: [PriceTickerController],
})
export class PriceTickerModule {}
