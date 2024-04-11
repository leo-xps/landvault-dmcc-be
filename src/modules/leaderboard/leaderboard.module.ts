import { DbModule } from '@modules/db/db.module';
import { ServerTokensModule } from '@modules/server-tokens/server-tokens.module';
import { Module } from '@nestjs/common';
import { LeaderboardController } from './controllers/leaderboard.controller';
import { LeaderboardService } from './services/leaderboard.service';

@Module({
  imports: [DbModule, ServerTokensModule],
  providers: [LeaderboardService],
  controllers: [LeaderboardController],
})
export class LeaderboardModule {}
