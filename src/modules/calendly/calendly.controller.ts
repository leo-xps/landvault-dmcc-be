import { Body, Controller, Post, Query } from '@nestjs/common';
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

    for (const invitee of data.recipients) {
      await this.service.sendEmailTemplate(invitee, data.conferenceUrl);
    }

    return {
      status: 'ok',
    };
  }
}
