import { RestAuthGuard } from '@common/auth/guards/rest-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { NoCaching } from '@common/decorators/no-caching.decorator';
import { AGORA_CHAT_APPKEY } from '@common/environment';
import { XHours } from '@modules/cron-agora-delete-chatroom/cron-agora-delete-chatroom.global';
import { DbService } from '@modules/db/db.service';
import { ServerTokensService } from '@modules/server-tokens/services/server-tokens.service';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { z } from 'zod';
import { AgoraChatRoomService } from '../services/agora-chat-room.service';
import { AgoraChatTokenService } from '../services/agora-chat-token.service';
import { AgoraChatUserService } from '../services/agora-chat-user.service';
import { IAgoraChatRoomCreateInput } from '../types/AgoraChatInput.types';

@Controller('agora-chat')
export class AgoraChatController {
  constructor(
    private readonly db: DbService,
    private readonly agoraChatService: AgoraChatUserService,
    private readonly agoraChatToken: AgoraChatTokenService,
    private readonly agoraChatRoom: AgoraChatRoomService,
    private readonly serverAdminToken: ServerTokensService,
    private readonly i18n: I18nService,
  ) {}

  @Get('/account/get-me')
  @NoCaching()
  @UseGuards(RestAuthGuard)
  async getAgoraUserAccount(@CurrentUser('id') userId: string) {
    const user = await this.agoraChatService.getAgoraChatUser(userId);
    const token = await this.agoraChatToken.createUserToken(user.uuid);
    return {
      username: user.username,
      uuid: user.uuid,
      token,
    };
  }

  async checkAdminTokenValidity(token: string) {
    return this.serverAdminToken.validateToken(token);
  }

  @Get('/account/get/:email')
  @NoCaching()
  @UseGuards(RestAuthGuard)
  async getAgoraUserAccountByUsername(@Param('email') email: string) {
    const user = await this.db.users.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new BadRequestException(this.i18n.translate('GENERAL.NOT_FOUND'));
    }

    return {
      email: user.email,
      agoraUsername: user.id,
    };
  }

  // create chatroom
  @Get('/chatroom/appkey')
  async getAppKey() {
    return {
      appKey: AGORA_CHAT_APPKEY,
    };
  }

  // create chatroom
  @Post('/chatroom/create')
  async createChatroom(
    @Headers('lv-srv-adm') srvToken: string,
    @Body() body: IAgoraChatRoomCreateInput,
  ) {
    const valid = await this.checkAdminTokenValidity(srvToken);
    if (!valid) {
      throw new BadRequestException(this.i18n.translate('RBAC.UNAUHTORIZED'));
    }

    const checkInput = z.object({
      name: z.string().min(1).max(128),
      description: z.string().min(1).max(512),
    });

    const parseResult = checkInput.safeParse(body);

    if (!parseResult.success) {
      throw new BadRequestException(this.i18n.translate('GENERAL.INPUT_ERROR'));
    }

    const data = parseResult.data;

    const chatroom = await this.agoraChatRoom.createChatRoom(
      data.name,
      data.description,
    );

    return {
      id: chatroom.data.id,
    };
  }

  // delete chatroom
  @Put('/chatroom/:id/prolong')
  async prolongChatroom(
    @Headers('lv-srv-adm') srvToken: string,
    @Param('id') id: string,
  ) {
    const chatroom = await this.agoraChatRoom.prolongChatRoomExpiration(id);

    return {
      id: chatroom.roomID,
      expiresIn: new Date(Date.now() + XHours),
    };
  }

  // delete chatroom
  @Put('/chatroom/:id/delete')
  async deleteChatroom(
    @Headers('lv-srv-adm') srvToken: string,
    @Param('id') id: string,
  ) {
    const chatroom = await this.agoraChatRoom.deleteChatRoom(id);

    return {
      id: chatroom.data.id,
    };
  }
}
