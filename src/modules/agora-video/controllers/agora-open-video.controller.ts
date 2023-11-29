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

@Controller('agora-open-video')
export class AgoraOpenVideoController {
  constructor(
    private readonly agoraVideoToken: AgoraVideoTokenService,
    private readonly i18n: I18nService,
  ) {}

  processChannelName(name: string) {
    return `${AGORA_CHAT_APPKEY}-aov-${name}`;
  }

  @Post('room/join')
  @NoCaching()
  @UseGuards(RestAuthGuard)
  async getAgoraUserAccount(
    @CurrentUser('id') userId: string,
    @Body('channelId') channelName: string,
  ) {
    const tokenData = await this.agoraVideoToken.joinChannel(
      userId,
      this.processChannelName(channelName),
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
