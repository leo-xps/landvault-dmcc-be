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
  @Get('tournamentList')
  async getTournaments() {
    const tournamentHardCode = process.env.TOURNAMENT_HARD_CODE ?? '[]';
    const hardCorde = JSON.parse(tournamentHardCode);
    const tournamentList = [
      {
        id: 246,
        name: 'Crypto Tournament 1',
        description: 'Crypto Tournament 1',
        start: '2024-04-01T00:00:00.000Z',
        end: '2024-06-30T23:59:59.000Z',
      },
    ];
    return {
      data: hardCorde.length > 0 ? hardCorde : tournamentList,
    };
  }

  // get
  @Get('list')
  async getGameDataList(
    @Query('contestID') contestID = 246,
    @Query('skip') skip: number,
    @Query('take') take: number,
    @Query('sort') sort: string,
  ) {
    return {
      data: await this.game.getLeaderboard(
        contestID,
        Number(skip),
        Number(take),
        sort,
      ),
    };
  }
}
