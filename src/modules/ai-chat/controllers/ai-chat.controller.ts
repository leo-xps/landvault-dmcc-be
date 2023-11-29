import { RestAuthGuard } from '@common/auth/guards/rest-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { NoCaching } from '@common/decorators/no-caching.decorator';
import { Body, Controller, Post, Sse, UseGuards } from '@nestjs/common';
import { AiChatService } from '../services/ai-chat.service';
import { IChatInput } from '../types/ChatInput';

@Controller('ai-chat')
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Post('')
  @NoCaching()
  @UseGuards(RestAuthGuard)
  async chatSend(@CurrentUser('id') userId: string, @Body() body: IChatInput) {
    // call ai chat here
    return await this.aiChatService.chatFlowise(userId, body);
  }

  @Post('stream')
  @NoCaching()
  @UseGuards(RestAuthGuard)
  @Sse()
  async chatSendStream(
    @CurrentUser('id') userId: string,
    @Body() body: IChatInput,
  ) {
    // call ai chat here
    return this.aiChatService.streamChatbase(userId, body);
  }

  @Post('end-email')
  @NoCaching()
  @UseGuards(RestAuthGuard)
  async emailChat(@CurrentUser('id') userId: string) {
    // call ai chat here
    return await this.aiChatService.emailChat(userId);
  }

  @Post('end')
  @NoCaching()
  @UseGuards(RestAuthGuard)
  async endChat(@CurrentUser('id') userId: string) {
    // call ai chat here
    return await this.aiChatService.endChat(userId);
  }
}
