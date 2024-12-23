import { RestAuthGuard } from '@common/auth/guards/rest-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ServerTokensService } from '@modules/server-tokens/services/server-tokens.service';
import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LeaderboardService } from '../services/leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(
    private readonly game: LeaderboardService,
    private readonly serverAdminToken: ServerTokensService,
  ) {}

  async checkAdminTokenValidity(token: string) {
    return this.serverAdminToken.validateToken(token);
  }

  // set
  @Post()
  @UseGuards(RestAuthGuard)
  async setGameData(
    @CurrentUser('id') userId: string,
    @Body('score') score: number,
    @Body('gameID') gameID: string,
    @Body('nickname') nickname: string,
    @Body('email') email: string,
  ) {
    return this.game.setUserScore(userId, score, gameID, nickname, email);
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

  // delete all
  @Post('delete')
  async deleteLeaderboard(
    @Headers('lv-srv-adm') srvToken: string,
    @Body('gameID') gameID: string,
  ) {
    const valid = await this.checkAdminTokenValidity(srvToken);

    if (!valid) {
      return { error: 'Invalid server admin token' };
    }

    return this.game.clearLeaderboard(gameID);
  }
}
