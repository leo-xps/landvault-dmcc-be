import { DbModule } from '@modules/db/db.module';
import { ServerTokensModule } from '@modules/server-tokens/server-tokens.module';
import { Module } from '@nestjs/common';
import { RatingController } from './controllers/rating.controller';
import { RatingService } from './services/rating.service';

@Module({
  imports: [DbModule, ServerTokensModule],
  providers: [RatingService],
  controllers: [RatingController],
})
export class RatingsModule {}
