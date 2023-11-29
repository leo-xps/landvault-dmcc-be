import { AGORA_APP_CERTIFICATE, AGORA_APP_ID } from '@common/environment';
import { _1_SECOND } from '@common/utils/time';
import { AgoraChatTokenService } from '@modules/agora-chat/services/agora-chat-token.service';
import { NestCacheService } from '@modules/cache/cache.service';
import { Injectable } from '@nestjs/common';
import { ChatTokenBuilder } from 'agora-token';

@Injectable()
export class AgoraCoreTokenService {
  appTokenExpiryInSeconds = 24 * 60 * 60;

  constructor(private readonly cache: NestCacheService) {}

  async getAgoraAppToken() {
    return await this.cache.cachedValueOrFetch(
      {
        key: AgoraChatTokenService.name,
        name: 'agora-app-token',
      },
      async () => {
        const appToken = ChatTokenBuilder.buildAppToken(
          AGORA_APP_ID,
          AGORA_APP_CERTIFICATE,
          this.appTokenExpiryInSeconds,
        );
        return appToken;
      },
      (this.appTokenExpiryInSeconds - 5) * _1_SECOND,
    );
  }
}
