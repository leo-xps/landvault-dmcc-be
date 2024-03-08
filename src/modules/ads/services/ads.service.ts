import { DbService } from '@modules/db/db.service';
import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class AdsService {
  constructor(
    private readonly db: DbService,
    private readonly i18n: I18nService,
  ) {}

  // get
  async getAds(_opts: { locationID: string }) {
    return 'https://scontent.fmnl4-1.fna.fbcdn.net/v/t1.6435-9/122481459_5356753694350090_306339678597961678_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=c2f564&_nc_ohc=p7Ra6m9s4VQAX8Y1UbA&_nc_ht=scontent.fmnl4-1.fna&oh=00_AfCxhEH9v1CyB8Am3GukbV2i6tplJaVYQYO65qy3v_djDA&oe=660E1916';
  }
}
