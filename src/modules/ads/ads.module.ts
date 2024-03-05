import { DbModule } from '@modules/db/db.module';
import { Module } from '@nestjs/common';
import { AdsController } from './controllers/ads.controller';
import { AdsService } from './services/ads.service';

@Module({
  imports: [DbModule],
  providers: [AdsService],
  controllers: [AdsController],
})
export class AdsModule {}
