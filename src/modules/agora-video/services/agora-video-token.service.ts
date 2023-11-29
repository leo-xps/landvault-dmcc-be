import { IDynamicObject } from '@common/auth/types/DynamicObject.types';
import { AGORA_APP_CERTIFICATE, AGORA_APP_ID } from '@common/environment';
import { hashString } from '@common/utils/hash';
import { _1_SECOND } from '@common/utils/time';
import { AgoraCoreHttpService } from '@modules/agora-core/services/agora-core-http.service';
import { NestCacheService } from '@modules/cache/cache.service';
import { DbService } from '@modules/db/db.service';
import { ServerTokensService } from '@modules/server-tokens/services/server-tokens.service';
import { Injectable } from '@nestjs/common';
import { RtcRole, RtcTokenBuilder } from 'agora-token';
import { IAgoraChatKickResponse } from '../types/AgoraChat.types';

@Injectable()
export class AgoraVideoTokenService {
  constructor(
    private readonly cache: NestCacheService,
    private readonly db: DbService,
    private readonly agoraCore: AgoraCoreHttpService,
    private readonly serverAdminToken: ServerTokensService,
  ) {}

  userTokenExpiryInSeconds = 60 * 60 * 24;

  async checkAdminTokenValidity(token: string) {
    return this.serverAdminToken.validateToken(token);
  }

  generateRandomNumberFromStringSeed(seed: string) {
    let hash = 0;
    if (seed.length == 0) return hash;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  async joinChannel(
    uuid: string,
    channelName: string,
    role: 'pub' | 'sub' = 'pub',
    includeRole = false,
  ) {
    return await this.cache.cachedValueOrFetch(
      {
        key: AgoraVideoTokenService.name,
        name: 'agora-video-user-token',
        args: hashString([uuid, channelName, role].join('||')),
      },
      async () => {
        const uid = this.generateRandomNumberFromStringSeed(uuid);
        const currentTimestamp = Math.floor(Date.now() / 1000);

        const privilegeExpiredTs =
          currentTimestamp + this.userTokenExpiryInSeconds;

        const selectedRole =
          role == 'pub' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

        // console.log(role, selectedRole);

        // Build token with uid
        const token = RtcTokenBuilder.buildTokenWithUid(
          AGORA_APP_ID,
          AGORA_APP_CERTIFICATE,
          channelName,
          uid,
          selectedRole,
          privilegeExpiredTs,
          privilegeExpiredTs,
        );

        return {
          // Pass your App ID here.
          appId: AGORA_APP_ID,
          // Set the channel name.
          channel: channelName,
          // Pass your temp token here.
          token: token,
          // Set the user ID.
          uid: uid,
          // Set the user role
          role: includeRole ? selectedRole : undefined,
        };
      },
      (this.userTokenExpiryInSeconds - 5) * _1_SECOND,
    );
  }

  async recordDeleteRuleIntoDatabase(
    blockID: number,
    blockInfo: IDynamicObject,
  ) {
    const hashedBlock = this.cache.sortDynamicObjectIntoKey(blockInfo);

    await this.db.agoraVideoBlockIDs.create({
      data: {
        kickID: blockID.toString(),
        blockHash: hashedBlock,
      },
    });
  }

  async getAndDeleteBlockIDFromDatabase(blockInfo: IDynamicObject) {
    const hashedBlock = this.cache.sortDynamicObjectIntoKey(blockInfo);

    const fetchData = await this.db.agoraVideoBlockIDs.findUnique({
      where: {
        blockHash: hashedBlock,
      },
    });

    if (fetchData) {
      await this.db.agoraVideoBlockIDs.delete({
        where: {
          id: fetchData.id,
        },
      });
    }

    return fetchData?.kickID;
  }

  async kickUserFromChannel(
    channelName: string,
    toBlockUUID?: string,
    toBlockIP?: string,
  ) {
    const blockData = {
      appid: AGORA_APP_ID,
      cname: channelName,
      uid: toBlockUUID,
      str_uid: true,
      ip: toBlockIP ?? '',
      time: 240,
      privileges: ['join_channel'],
    };

    const data =
      await this.agoraCore.requestToAgoraServer<IAgoraChatKickResponse>(null, {
        url: `https://api.agora.io/dev/v1/kicking-rule`,
        method: 'POST',
        headers: {
          Authorization: await this.agoraCore.getRESTAuth(),
        },
        data: blockData,
      });

    await this.recordDeleteRuleIntoDatabase(data.id, blockData);

    return data;
  }

  async revokeKickUserFromChannel(
    channelName: string,
    toBlockUUID?: string,
    toBlockIP?: string,
  ) {
    const blockData = {
      appid: AGORA_APP_ID,
      cname: channelName,
      uid: toBlockUUID,
      str_uid: true,
      ip: toBlockIP ?? '',
      time: 240,
      privileges: ['join_channel'],
    };

    const blockRule = await this.getAndDeleteBlockIDFromDatabase(blockData);

    if (!blockRule) {
      return null;
    }

    const data =
      await this.agoraCore.requestToAgoraServer<IAgoraChatKickResponse>(null, {
        url: `https://api.agora.io/dev/v1/kicking-rule`,
        method: 'DELETE',
        headers: {
          Authorization: await this.agoraCore.getRESTAuth(),
        },
        data: {
          appid: AGORA_APP_ID,
          id: blockRule,
        },
      });

    return data;
  }
}
