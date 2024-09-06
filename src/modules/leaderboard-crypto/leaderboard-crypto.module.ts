import { NestCacheModule } from '@modules/cache/cache.module';
import { DbModule } from '@modules/db/db.module';
import { UsersModule } from '@modules/users/users.module';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { LeaderboardCryptoController } from './controllers/leaderboard-crypto.controller';
import { LeaderboardCryptoService } from './services/leaderboard-crypto.service';

@Module({
  imports: [DbModule, NestCacheModule, HttpModule, UsersModule],
  providers: [LeaderboardCryptoService],
  controllers: [LeaderboardCryptoController],
})
export class LeaderboardCryptoModule {}
