import { ServerTokensService } from '@modules/server-tokens/services/server-tokens.service';
import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { ChatListService } from '../services/chat-list.service';

@Controller('chat-history')
export class ChatListController {
  constructor(
    private readonly chat: ChatListService,
    private readonly serverAdminToken: ServerTokensService,
  ) {}

  async checkAdminTokenValidity(token: string) {
    return this.serverAdminToken.validateToken(token);
  }

  // set
  @Post(':id')
  async setChatListData(
    @Headers('lv-srv-adm') srvToken: string,
    @Param('id') chatID: string,
    @Body('data') data: string,
  ) {
    const valid = await this.checkAdminTokenValidity(srvToken);

    if (!valid) {
      return { error: 'Invalid server admin token' };
    }
    return this.chat.setChatListData(chatID, data);
  }

  // get
  @Get(':id')
  async getChatListData(
    @Headers('lv-srv-adm') srvToken: string,
    @Param('id') chatID: string,
  ) {
    const valid = await this.checkAdminTokenValidity(srvToken);

    if (!valid) {
      return { error: 'Invalid server admin token' };
    }
    return { id: chatID, data: await this.chat.getChatListData(chatID) };
  }

  // get
  @Get('')
  async getChatList(@Headers('lv-srv-adm') srvToken: string) {
    const valid = await this.checkAdminTokenValidity(srvToken);

    if (!valid) {
      return { error: 'Invalid server admin token' };
    }
    return { data: await this.chat.getChatListAll() };
  }
}
