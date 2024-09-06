import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { readFileSync } from 'fs';
import * as moment from 'moment-timezone';
import { join } from 'path';
import { CalendlyPostBook } from './CalendlyPostBook';
import { CalendlyService } from './calendly.service';
import { OnEventCreated } from './calendly.types';

@Controller('calendly')
export class CalendlyController {
  constructor(private readonly service: CalendlyService) {}

  @Post('/set')
  async setupCalendlyListener(@Query('token') token: string) {
    return await this.service.instantiateListener(token);
  }

  @Post('/listener')
  async onWebhookEventReceive(@Body() body: OnEventCreated) {
    const data = await this.service.onWebhookEventReceive(body);

    if (!data) {
      return 'Ok';
    }

    for (const invitee of data.recipients) {
      await this.service.sendEmailTemplate(invitee, data.conferenceUrl);
    }

    console.log('Emails sent');

    return {
      status: 'ok',
    };
  }

  async getHTMLFileFromTemplates(fileLocation: string) {
    try {
      const fileLoc = join(__dirname, '..', '..', 'template', fileLocation);
      const data = readFileSync(fileLoc, 'utf8');
      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  @Get('/postbooking')
  async postBookingPage(@Res() res, @Query() queries: CalendlyPostBook) {
    const members = [...queries.guests, queries.invitee_email];
    const time = moment(queries.event_start_time).format(
      'MMMM Do YYYY, h:mm:ss a',
    );
    const timezone = '+' + queries.event_start_time.split('+')[1];

    // read html from file
    let html = await this.getHTMLFileFromTemplates('post_booking.html');

    // replace placeholders with data
    html = html.replace('{{name}}', queries.event_type_name);
    html = html.replace('{{host}}', queries.assigned_to);
    html = html.replace('{{time}}', time);
    html = html.replace('{{timezone}}', timezone);
    html = html.replace('{{members}}', members.join('<br/> '));
    html = html.replace('{{url}}', queries.invitee_uuid);

    // return html
    return res.send(html);
  }
}
