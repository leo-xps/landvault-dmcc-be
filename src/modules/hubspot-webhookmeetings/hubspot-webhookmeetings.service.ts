import {
  HUBSPOT_LANDVAULT_PRIVATE_APP_KEY,
  HUBSPOT_WEBHOOK_VIDEO_CONFERENCE_LINK,
} from '@common/environment';
import { sha256HashString } from '@common/utils/hash';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { I18nService } from 'nestjs-i18n';
import { stringify } from 'qs';
import { catchError, firstValueFrom } from 'rxjs';
import {
  CallbackData,
  CallbackResponse,
  CreateMeetingResponse,
  CreateMeetingWebhookBody,
  GetUserDataResponse,
} from './HubspotMeeting.types';

@Injectable()
export class HubspotWebhookmeetingsService {
  constructor(
    private readonly httpService: HttpService,
    private readonly i18n: I18nService,
  ) {}

  async getUserID(email: string) {
    const urlObject = new URL('https://api.hubapi.com');
    urlObject.pathname = `/crm/v3/objects/contacts/search`;

    const { data: output } = await firstValueFrom(
      this.httpService
        .request<GetUserDataResponse>({
          method: 'POST',
          url: urlObject.toString(),
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            authorization: `Bearer ${HUBSPOT_LANDVAULT_PRIVATE_APP_KEY}`,
          },
          data: {
            limit: 1,
            after: 0,
            sorts: ['email'],
            properties: ['room'],
            filterGroups: [
              {
                filters: [
                  {
                    propertyName: 'email',
                    value: email,
                    operator: 'EQ',
                  },
                ],
              },
            ],
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            console.log(error);
            console.log(error.request._header);
            // log the request data
            console.log(error.config.data);
            throw this.i18n.translate('agora-core.REQUEST_ERROR');
          }),
        ),
    );

    // console.log('creating output', output);

    return output;
  }

  async createMeeting(
    data: CreateMeetingWebhookBody,
  ): Promise<CreateMeetingResponse> {
    const joinURL = new URL(HUBSPOT_WEBHOOK_VIDEO_CONFERENCE_LINK);
    joinURL.searchParams.append(
      'token',
      sha256HashString(
        data.invitees[0].email + data.startTime.toString(),
      ).substring(0, 7),
    );

    // console.log('data', data);

    const user = await this.getUserID(data.invitees[0].email);
    if (user.total >= 1) {
      if (user.results[0].properties.room) {
        joinURL.searchParams.append('room', user.results[0].properties.room);
      }
    }

    const joinLink = joinURL.toString();
    const joinID = sha256HashString(joinLink).toUpperCase();

    return {
      conferenceId: joinID,
      conferenceDetails: 'Join Landvault Meeting at ' + joinLink,
      conferenceUrl: joinLink,
    };
  }

  // Additional info can be found here: https://developers.hubspot.com/docs/api/oauth-quickstart-guide
  async processCallback(data: CallbackData) {
    console.log('processing callback');
    const { data: output } = await firstValueFrom(
      this.httpService
        .request<CallbackResponse>({
          method: 'POST',
          url: 'https://api.hubapi.com/oauth/v1/token',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          data: stringify(data),
        })
        .pipe(
          catchError((error: AxiosError) => {
            console.log(error);
            console.log(error.request._header);
            // log the request data
            console.log(error.config.data);
            throw this.i18n.translate('agora-core.REQUEST_ERROR');
          }),
        ),
    );

    console.log('creating output', output);

    return output;
  }
}
