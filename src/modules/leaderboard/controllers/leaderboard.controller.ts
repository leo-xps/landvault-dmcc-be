import { RestAuthGuard } from '@common/auth/guards/rest-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { LeaderboardService } from '../services/leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly game: LeaderboardService) {}

  // set
  @Post()
  @UseGuards(RestAuthGuard)
  async setGameData(
    @CurrentUser('id') userId: string,
    @Body('score') score: number,
    @Body('gameID') gameID: string,
  ) {
    return this.game.setUserScore(userId, score, gameID);
  }

  // get
  @Get()
  @UseGuards(RestAuthGuard)
  async getGameData(
    @CurrentUser('id') userId: string,
    @Query('gameID') gameID: string,
  ) {
    return {
      id: userId,
      data: await this.game.getUserScore(userId, gameID),
    };
  }

  // get
  @Get('list')
  async getGameDataList(
    @Query('gameID') gameID: string,
    @Query('skip') skip: number,
    @Query('take') take: number,
    @Query('sort') sort: string,
  ) {
    return {
      data: await this.game.getLeaderboard(
        gameID,
        Number(skip),
        Number(take),
        sort,
      ),
    };
  }
}
