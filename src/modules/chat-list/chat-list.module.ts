import { DbModule } from '@modules/db/db.module';
import { ServerTokensModule } from '@modules/server-tokens/server-tokens.module';
import { Module } from '@nestjs/common';
import { ChatListController } from './controllers/chat-list.controller';
import { ChatListService } from './services/chat-list.service';

@Module({
  imports: [DbModule, ServerTokensModule],
  providers: [ChatListService],
  controllers: [ChatListController],
})
export class ChatListModule {}
