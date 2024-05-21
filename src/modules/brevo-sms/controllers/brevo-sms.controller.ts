import { Controller, Post } from '@nestjs/common';
import { BrevoSmsService } from '../services/brevo-sms.service';

@Controller('brevo-sms')
export class BrevoSmsController {
  constructor(private readonly brevoMailerService: BrevoSmsService) {}

  @Post('send')
  async sendTransactionalEmail() {
    console.log('Sending SMS');
    try {
      const result = await this.brevoMailerService.sendSMS({
        sender: 'Brevo',
        recipient: '639777384315',
        content: 'Hello, this is a test message from Brevo',
      });
      return { message: 'Email sent successfully', result };
    } catch (error) {
      console.error(error);
      throw new Error('Failed to send transactional email');
    }
  }
}
