import { AGORA_CHAT_ORGNAME } from '@common/environment';
import { hashString } from '@common/utils/hash';
import { _1_DAY } from '@common/utils/time';
import { AgoraCoreHttpService } from '@modules/agora-core/services/agora-core-http.service';
import { NestCacheService } from '@modules/cache/cache.service';
import { DbService } from '@modules/db/db.service';
import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { z } from 'zod';
import {
  IAgoraChatDeleteRoomResponseFormat,
  IAgoraChatGetRoomsResponseFormat,
  IAgoraChatRoomCoreResponseFormat,
} from '../types/AgoraChatREST.types';
import { AgoraChatUserService } from './agora-chat-user.service';

const AGORA_CHAT_BOT_USERNAME = 'LANDVAULT_CHATROOM_BOT';

@Injectable()
export class AgoraChatRoomService {
  constructor(
    private readonly i18n: I18nService,
    private readonly agoraHTTP: AgoraCoreHttpService,
    private readonly agoraChatUser: AgoraChatUserService,
    private readonly cache: NestCacheService,
    private readonly db: DbService,
  ) {}

  async getAdminBotForChatRoom() {
    return await this.cache.cachedValueOrFetch(
      {
        key: 'agora-chat-admin-bot',
      },
      async () => {
        // check if bot already exists
        try {
          // if it already exists, return the bot
          const bot = await this.agoraChatUser.queryUser(
            AGORA_CHAT_BOT_USERNAME,
          );
          return bot.entities[0];
        } catch (error) {
          // if it doesn't exist, create the bot and return it
          const bot = await this.agoraChatUser.registerUser(
            AGORA_CHAT_BOT_USERNAME,
            hashString(
              `${AGORA_CHAT_ORGNAME}#${AGORA_CHAT_BOT_USERNAME}#${AGORA_CHAT_BOT_USERNAME}`,
            ),
            AGORA_CHAT_BOT_USERNAME,
          );

          return bot.entities[0];
        }
      },
      _1_DAY,
    );
  }

  async createChatRoom(
    name: string,
    description: string,
    ownerUserName?: string,
  ) {
    const input = z.object({
      name: z.string().max(128),
      description: z.string().max(512),
    });

    const result = input.safeParse({
      name,
      description,
    });

    if (!result.success) {
      throw this.i18n.translate('agora-chat.INVALID_INPUT');
    }

    if (!ownerUserName) {
      const bot = await this.getAdminBotForChatRoom();
      ownerUserName = bot.username;
    }

    const data =
      await this.agoraHTTP.requestToAgoraServer<IAgoraChatRoomCoreResponseFormat>(
        'chatrooms',
        {
          method: 'POST',
          data: {
            name: result.data.name,
            description: result.data.description,
            owner: ownerUserName,
          },
        },
      );

    await this.db.agoraChatRoomIDs.create({
      data: {
        roomID: data.data.id,
      },
    });

    return data;
  }

  async prolongChatRoomExpiration(roomID: string) {
    const data = await this.db.agoraChatRoomIDs.update({
      where: {
        roomID,
      },
      data: {
        lastCheckAt: new Date(),
      },
    });

    return data;
  }

  async deleteChatRoom(roomIDToDelete: string) {
    const result =
      await this.agoraHTTP.requestToAgoraServer<IAgoraChatDeleteRoomResponseFormat>(
        `chatrooms/${roomIDToDelete}`,
        {
          method: 'DELETE',
        },
      );

    return result;
  }

  async getChatRoomDetails(chatRoomID: string) {
    const result =
      await this.agoraHTTP.requestToAgoraServer<IAgoraChatGetRoomsResponseFormat>(
        `chatrooms/${chatRoomID}`,
        {
          method: 'GET',
        },
      );

    return result;
  }
}
