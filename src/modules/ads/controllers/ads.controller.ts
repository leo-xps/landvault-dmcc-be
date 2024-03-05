import { Controller, Get } from '@nestjs/common';
import { AdsService } from '../services/ads.service';

@Controller('ads')
export class AdsController {
  constructor(private readonly ads: AdsService) {}

  // get
  @Get()
  async getChatListData() {
    return { adUrl: await this.ads.getAds({}) };
  }
}
