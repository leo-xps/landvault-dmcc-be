import { ServerTokensService } from '@modules/server-tokens/services/server-tokens.service';
import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { GameDataService } from '../services/game-data.service';

@Controller('game-data')
export class GameDataController {
  constructor(
    private readonly game: GameDataService,
    private readonly serverAdminToken: ServerTokensService,
  ) {}

  async checkAdminTokenValidity(token: string) {
    return this.serverAdminToken.validateToken(token);
  }

  // set
  @Post(':id')
  async setGameData(
    @Headers('lv-srv-adm') srvToken: string,
    @Param('id') chatID: string,
    @Body('data') data: string,
  ) {
    const valid = await this.checkAdminTokenValidity(srvToken);

    if (!valid) {
      return { error: 'Invalid server admin token' };
    }
    return this.game.setGameData(chatID, data);
  }

  // get
  @Get(':id')
  async getGameData(
    @Headers('lv-srv-adm') srvToken: string,
    @Param('id') chatID: string,
  ) {
    const valid = await this.checkAdminTokenValidity(srvToken);

    if (!valid) {
      return { error: 'Invalid server admin token' };
    }
    return { id: chatID, data: await this.game.getGameData(chatID) };
  }

  // get
  @Get('')
  async getGameDataList(@Headers('lv-srv-adm') srvToken: string) {
    const valid = await this.checkAdminTokenValidity(srvToken);

    if (!valid) {
      return { error: 'Invalid server admin token' };
    }
    return { data: await this.game.getGameDataAll() };
  }
}
