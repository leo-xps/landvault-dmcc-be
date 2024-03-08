import { Controller, Get, Query } from '@nestjs/common';
import { AdsService } from '../services/ads.service';

@Controller('ads')
export class AdsController {
  constructor(private readonly ads: AdsService) {}

  // get
  @Get()
  async getChatListData(@Query('locationID') locationID: string) {
    return {
      adUrl: await this.ads.getAds({
        locationID,
      }),
      locationID,
    };
  }
}
