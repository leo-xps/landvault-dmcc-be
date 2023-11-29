import { NestCacheModule } from '@modules/cache/cache.module';
import { DbModule } from '@modules/db/db.module';
import { ServerTokensModule } from '@modules/server-tokens/server-tokens.module';
import { Module } from '@nestjs/common';
import { AgoraCoreModule } from './../agora-core/agora-core.module';
import { AgoraChatController } from './controllers/agora-chat.controller';
import { AgoraChatRoomService } from './services/agora-chat-room.service';
import { AgoraChatTokenService } from './services/agora-chat-token.service';
import { AgoraChatUserService } from './services/agora-chat-user.service';

@Module({
  imports: [NestCacheModule, AgoraCoreModule, ServerTokensModule, DbModule],
  providers: [
    AgoraChatTokenService,
    AgoraChatUserService,
    AgoraChatRoomService,
  ],
  controllers: [AgoraChatController],
  exports: [AgoraChatTokenService, AgoraChatUserService, AgoraChatRoomService],
})
export class AgoraChatModule {}
