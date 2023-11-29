import { AGORA_CHAT_SECRET } from '@common/environment';
import { AgoraCoreHttpService } from '@modules/agora-core/services/agora-core-http.service';
import { NestCacheService } from '@modules/cache/cache.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { z } from 'zod';
import {
  IAgoraQueryUserResponse,
  IAgoraRegisterUserResponse,
} from '../types/AgoraChatREST.types';
import { AgoraChatTokenService } from './agora-chat-token.service';

@Injectable()
export class AgoraChatUserService {
  constructor(
    private readonly i18n: I18nService,
    private readonly agoraChatToken: AgoraChatTokenService,
    private readonly agoraHTTP: AgoraCoreHttpService,
    private readonly cache: NestCacheService,
  ) {}

  async registerUser(username: string, password: string, nickname: string) {
    const input = z.object({
      username: z.string().max(64),
      password: z.string().max(64),
      nickname: z.string().max(100),
    });

    const result = input.safeParse({
      username,
      password,
      nickname,
    });

    if (!result.success) {
      throw this.i18n.translate('agora-chat.INVALID_INPUT');
    }

    const data =
      await this.agoraHTTP.requestToAgoraServer<IAgoraRegisterUserResponse>(
        'users',
        {
          method: 'POST',
          data: {
            username: result.data.username,
            password: result.data.password,
            nickname: result.data.nickname,
          },
        },
        // (error: AxiosError) => {
        //   console.log(error);
        //   throw this.i18n.translate('agora-chat.CANT_CREATE_AGORACHAT_USER');
        // },
      );

    return data;
  }

  async queryUser(username: string) {
    const input = z.object({
      username: z.string().max(64),
    });

    const result = input.safeParse({
      username,
    });

    if (!result.success) {
      throw this.i18n.translate('agora-chat.INVALID_INPUT');
    }

    const data =
      await this.agoraHTTP.requestToAgoraServer<IAgoraQueryUserResponse>(
        `users/${result.data.username}`,
        {
          method: 'GET',
        },
        // (error: AxiosError) => {
        //   console.log(error);
        //   throw this.i18n.translate('agora-chat.CANT_QUERY_AGORACHAT_USER');
        // },
      );

    return data;
  }

  async loginUser(username: string) {
    const user = await this.queryUser(username);

    if (user.entities.length === 0) {
      throw new BadRequestException(
        this.i18n.translate('agora-chat.USER_NOT_FOUND'),
      );
    }

    try {
      const uid = user.entities[0].uuid;
      const token = await this.agoraChatToken.createUserToken(uid);
      return {
        username,
        uuid: uid,
        token,
      };
    } catch (err) {
      throw new BadRequestException(
        this.i18n.translate('agora-chat.CANT_LOGIN'),
      );
    }
  }

  async getAgoraChatUser(username: string) {
    return await this.cache.cachedValueOrFetch(
      {
        key: `agora-chat-user-${username}`,
      },
      async () => {
        // get if user exists
        try {
          const user = await this.queryUser(username);

          return user.entities[0];
        } catch {
          const hashPassword = `${AGORA_CHAT_SECRET}_PASS_${username}`;
          const user = await this.registerUser(
            username,
            hashPassword,
            username,
          );

          return user.entities[0];
        }
      },
    );
  }
}
