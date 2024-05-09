import {
  APP_NAME,
  HUBSPOT_WEBHOOK_VIDEO_CONFERENCE_LINK,
} from '@common/environment';
import { sha256HashString } from '@common/utils/hash';
import { BrevoMailerService } from '@modules/brevo-mailer/services/brevo-mailer.service';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { I18nService } from 'nestjs-i18n';
import { catchError, firstValueFrom } from 'rxjs';
import { OnEventCreated, OrganizationType } from './calendly.types';

@Injectable()
export class CalendlyService {
  constructor(
    private readonly httpService: HttpService,
    private readonly i18n: I18nService,
    private readonly mailer: BrevoMailerService,
  ) {}

  getCalendlyWebhookUrl(endpoint: string) {
    return `https://api.calendly.com/${endpoint}`;
  }

  async requestToCalendly<T>(
    endpoint: string,
    request_data: AxiosRequestConfig,
    onError?: (error: AxiosError) => void,
  ) {
    const { data } = await firstValueFrom(
      this.httpService
        .request<T>({
          url: this.getCalendlyWebhookUrl(endpoint),
          ...request_data,
        })
        .pipe(
          catchError((error: AxiosError) => {
            if (onError) {
              onError(error);
            }
            console.log(error);
            throw this.i18n.translate('agora-core.REQUEST_ERROR');
          }),
        ),
    );

    return data;
  }

  // create listener
  async instantiateListener(token: string) {
    // get organization id
    const organization = await this.requestToCalendly<OrganizationType>(
      '/users/me',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
      (error) => {
        console.log(error);
        throw this.i18n.translate('agora-core.REQUEST_ERROR');
      },
    );

    const request = await this.requestToCalendly('/webhook_subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      data: {
        url: `${process.env.SERVER_URL}/api/calendly/listener`,
        events: ['invitee.created'],
        organization: organization.resource.current_organization,
        scope: 'organization',
      },
    });

    return request;
  }

  // on webhook event receive
  async onWebhookEventReceive(eventData: OnEventCreated) {
    if (eventData.event !== 'invitee.created') {
      return;
    }

    // check if event is our event
    if (
      eventData.payload.scheduled_event.name !==
      process.env.CALENDLY_EVENT_TITLE
    ) {
      return;
    }

    // get members of meeting
    const email = eventData.payload.email;
    const guests =
      eventData.payload.scheduled_event?.event_guests?.map((e) => e.email) ??
      [];

    // get the host of meeting
    const host = eventData.payload.scheduled_event?.event_memberships?.map(
      (e) => e.user_email,
    );

    const createdAt = eventData.payload.created_at;

    const recipients = [email, ...guests, ...host];

    const joinURL = new URL(HUBSPOT_WEBHOOK_VIDEO_CONFERENCE_LINK);
    joinURL.searchParams.append(
      'token',
      sha256HashString(email + createdAt).substring(0, 7),
    );

    const location = eventData.payload.questions_and_answers.find(
      (e) => e.question === 'On what room would you like us to meet?',
    ) ?? { answer: 'Meeting Room' };
    const roomDecode = {
      'Private Room': 'private',
      'Meeting Room': 'meeting',
      'Co-Working Space': 'coworking',
      Auditorium: 'auditorium',
    };
    const findOrDefault = (key: string) => {
      return roomDecode[key] ?? 'meeting';
    };
    joinURL.searchParams.append('room', findOrDefault(location.answer));

    const joinLink = joinURL.toString();
    const joinID = sha256HashString(joinLink).toUpperCase();

    return {
      conferenceId: joinID,
      conferenceDetails: `Join ${APP_NAME} Meeting at ` + joinLink,
      conferenceUrl: joinLink,
      recipients,
    };
  }

  async sendEmailTemplate(emailReceipient: string, joinLink: string) {
    //optional sending email verification
    const emailData = {
      email: emailReceipient.toLowerCase(),
      subject: `Join Us on ${APP_NAME}!`,
      fileLocation: 'dist/template/email-invite.hbs',
      params: {
        joinLink,
        time_date: new Date().toLocaleString(),
      },
    };

    // console.log(JSON.stringify(emailData));

    await this.mailer.sendEmailByBrevoTemplate(
      emailData.email,
      emailData.subject,
      process.env.MAILER_BREVO_JOINLINK_URL || '7',
      emailData.params,
    );
    return true;
  }
}
