import { RestAuthGuard } from '@common/auth/guards/rest-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { NoCaching } from '@common/decorators/no-caching.decorator';
import { AGORA_CHAT_APPKEY } from '@common/environment';
import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Post,
  UseGuards,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { AgoraVideoTokenService } from '../services/agora-video-token.service';

@Controller('agora-broadcast')
export class AgoraBroadcasterVideoController {
  constructor(
    private readonly agoraVideoToken: AgoraVideoTokenService,
    private readonly i18n: I18nService,
  ) {}

  processChannelName(name: string) {
    return `${AGORA_CHAT_APPKEY}-abv-${name}`;
  }

  @Post('room/join/broadcaster')
  @NoCaching()
  async createBroadcastSession(
    @Headers('lv-srv-adm') srvToken: string,
    @Body('presenterId') userId: string,
    @Body('channelId') channelName: string,
  ) {
    const valid = await this.agoraVideoToken.checkAdminTokenValidity(srvToken);
    if (!valid) {
      throw new BadRequestException(this.i18n.translate('RBAC.UNAUHTORIZED'));
    }

    const tokenData = await this.agoraVideoToken.joinChannel(
      userId,
      this.processChannelName(channelName),
      'pub',
      true,
    );
    return tokenData;
  }

  @Post('room/join/audience')
  @NoCaching()
  @UseGuards(RestAuthGuard)
  async joinBroadcastSession(
    @CurrentUser('id') userId: string,
    @Body('channelId') channelName: string,
  ) {
    const tokenData = await this.agoraVideoToken.joinChannel(
      userId,
      this.processChannelName(channelName),
      'sub',
      true,
    );
    return tokenData;
  }

  @Post('room/block/create')
  @NoCaching()
  async kickAgoraUserFromVideo(
    @Headers('lv-srv-adm') srvToken: string,
    @Body('channelId') channelName: string,
    @Body('userID') uuid: string,
  ) {
    const valid = await this.agoraVideoToken.checkAdminTokenValidity(srvToken);
    if (!valid) {
      throw new BadRequestException(this.i18n.translate('RBAC.UNAUHTORIZED'));
    }

    const tokenData = await this.agoraVideoToken.kickUserFromChannel(
      this.processChannelName(channelName),
      uuid,
    );
    return tokenData;
  }

  @Post('room/block/cancel')
  @NoCaching()
  async disableKickAgoraUserFromVideo(
    @Headers('lv-srv-adm') srvToken: string,
    @Body('channelId') channelName: string,
    @Body('userID') uuid: string,
  ) {
    const valid = await this.agoraVideoToken.checkAdminTokenValidity(srvToken);
    if (!valid) {
      throw new BadRequestException(this.i18n.translate('RBAC.UNAUHTORIZED'));
    }

    const tokenData = await this.agoraVideoToken.revokeKickUserFromChannel(
      this.processChannelName(channelName),
      uuid,
    );
    return tokenData;
  }
}
