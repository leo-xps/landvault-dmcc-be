import { Controller, Post } from '@nestjs/common';
import { BrevoSmsService } from '../services/brevo-sms.service';

@Controller('brevo-sms')
export class BrevoSmsController {
  constructor(private readonly brevoMailerService: BrevoSmsService) {}

  @Post('send')
  async sendTransactionalSms(args: {
    sender: string;
    recipient: string;
    content: string;
  }) {
    try {
      const result = await this.brevoMailerService.sendSMS({
        sender: args.sender,
        recipient: args.recipient,
        content: args.content,
      });
      return { message: 'SMS sent successfully', result };
    } catch (error) {
      console.error(error);
      throw new Error('Failed to send transactional email');
    }
  }
}
