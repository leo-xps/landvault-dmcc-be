import { RestAuthGuard } from '@common/auth/guards/rest-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { LeaderboardCryptoService } from '../services/leaderboard-crypto.service';

@Controller('leaderboard-crypto')
export class LeaderboardCryptoController {
  constructor(private readonly game: LeaderboardCryptoService) {}

  // get
  @Get()
  @UseGuards(RestAuthGuard)
  async getGameData(@CurrentUser('id') userId: string) {
    return {
      id: userId,
      data: await this.game.getUserScore(userId),
    };
  }

  // get
  @Get('list')
  async getGameDataList(
    @Query('skip') skip: number,
    @Query('take') take: number,
    @Query('sort') sort: string,
  ) {
    return {
      data: await this.game.getLeaderboard(Number(skip), Number(take), sort),
    };
  }
}
