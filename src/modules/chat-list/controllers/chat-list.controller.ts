import { RestAuthGuard } from '@common/auth/guards/rest-auth.guard';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ChatListService } from '../services/chat-list.service';

@Controller('chat-history')
export class ChatListController {
  constructor(private readonly chat: ChatListService) {}

  // set
  @Post(':id')
  @UseGuards(RestAuthGuard)
  async setChatListData(
    @Param('id') chatID: string,
    @Body('data') data: string,
  ) {
    return this.chat.setChatListData(chatID, data);
  }

  // get
  @Get(':id')
  @UseGuards(RestAuthGuard)
  async getChatListData(@Param('id') chatID: string) {
    return { id: chatID, data: await this.chat.getChatListData(chatID) };
  }
}
