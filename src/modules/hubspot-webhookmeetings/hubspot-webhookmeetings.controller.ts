import {
  HUBSPOT_LANDVAULT_APP_ID,
  HUBSPOT_LANDVAULT_APP_REDIRECT_URI,
  HUBSPOT_LANDVAULT_APP_SECRET,
} from '@common/environment';
import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { CallbackData, CreateMeetingWebhookBody } from './HubspotMeeting.types';
import { HubspotWebhookmeetingsService } from './hubspot-webhookmeetings.service';

@Controller('hubspot')
export class HubspotWebhookmeetingsController {
  constructor(private readonly service: HubspotWebhookmeetingsService) {}

  @Post('/create')
  createMeeting(@Body() body: CreateMeetingWebhookBody) {
    const data = this.service.createMeeting(body);
    return data;
  }

  @Get('/callback')
  async callback(@Query('code') code: string, @Res() res) {
    const formData: CallbackData = {
      grant_type: 'authorization_code',
      client_id: HUBSPOT_LANDVAULT_APP_ID,
      client_secret: HUBSPOT_LANDVAULT_APP_SECRET,
      redirect_uri: HUBSPOT_LANDVAULT_APP_REDIRECT_URI,
      code: code,
    };
    console.log('received callback');
    await this.service.processCallback(formData);

    console.log('sending response');
    return 'Ok';
  }
}
