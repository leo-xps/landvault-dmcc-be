import { AGORA_APP_CERTIFICATE, AGORA_APP_ID } from '@common/environment';
import { hashString } from '@common/utils/hash';
import { _1_SECOND } from '@common/utils/time';
import { NestCacheService } from '@modules/cache/cache.service';
import { Injectable } from '@nestjs/common';
import { ChatTokenBuilder } from 'agora-token';

@Injectable()
export class AgoraChatTokenService {
  constructor(private readonly cache: NestCacheService) {}

  userTokenExpiryInSeconds = 60 * 60 * 24;

  async createUserToken(uuid: string) {
    return await this.cache.cachedValueOrFetch(
      {
        key: AgoraChatTokenService.name,
        name: 'agora-chat-user-token',
        args: hashString([uuid].join('||')),
      },
      async () => {
        const userToken = ChatTokenBuilder.buildUserToken(
          AGORA_APP_ID,
          AGORA_APP_CERTIFICATE,
          uuid,
          this.userTokenExpiryInSeconds,
        );

        return userToken;
      },
      (this.userTokenExpiryInSeconds - 5) * _1_SECOND,
    );
  }
}
