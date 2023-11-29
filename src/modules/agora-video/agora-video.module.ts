import { AgoraCoreModule } from '@modules/agora-core/agora-core.module';
import { NestCacheModule } from '@modules/cache/cache.module';
import { DbModule } from '@modules/db/db.module';
import { ServerTokensModule } from '@modules/server-tokens/server-tokens.module';
import { Module } from '@nestjs/common';
import { AgoraBroadcasterVideoController } from './controllers/agora-broadcast.controller';
import { AgoraOpenVideoController } from './controllers/agora-open-video.controller';
import { AgoraVideoTokenService } from './services/agora-video-token.service';

@Module({
  imports: [NestCacheModule, AgoraCoreModule, ServerTokensModule, DbModule],
  providers: [AgoraVideoTokenService],
  controllers: [AgoraOpenVideoController, AgoraBroadcasterVideoController],
})
export class AgoraVideoModule {}
