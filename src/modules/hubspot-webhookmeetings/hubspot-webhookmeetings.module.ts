import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { HubspotWebhookmeetingsController } from './hubspot-webhookmeetings.controller';
import { HubspotWebhookmeetingsService } from './hubspot-webhookmeetings.service';

/**
 * 
 * You can update the webhook endpoints on hubspot by creating a developer account, creating a new app, getting 
 * the app id and developer aaccess token then calling this
 * 
 * curl --request PUT \
        --url 'https://api.hubapi.com/crm/v3/extensions/videoconferencing/settings/2177055?hapikey=466c98de-ce95-4306-bdc1-ebb31675bb86' \
        --header 'content-type: application/json' \
        --data '{
        "createMeetingUrl": "https://dev-landvault-be.int.lv-aws-x3.xyzapps.xyz/api/hubspot/create"
      }'
 */

@Module({
  imports: [HttpModule],
  providers: [HubspotWebhookmeetingsService],
  controllers: [HubspotWebhookmeetingsController],
})
export class HubspotWebhookmeetingsModule {}
