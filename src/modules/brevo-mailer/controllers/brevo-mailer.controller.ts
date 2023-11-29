import { Body, Controller, Post } from '@nestjs/common';
import { BrevoMailerService } from '../services/brevo-mailer.service';

@Controller('brevo-mailer')
export class BrevoMailerController {
  constructor(private readonly brevoMailerService: BrevoMailerService) {}

  // @Post('send')
  // async sendTransactionalEmail(@Body() sendSmtpEmail: any) {
  //   try {
  //     const result = await this.brevoMailerService.executeSendEmail(
  //       sendSmtpEmail,
  //     );
  //     return { message: 'Email sent successfully', result };
  //   } catch (error) {
  //     console.error(error);
  //     throw new Error('Failed to send transactional email');
  //   }
  // }

  @Post('send')
  async sendTransactionalEmail(
    @Body('to') to: string,
    @Body('subject') subject: string,
    @Body('htmlFileLocation') htmlFileLocation: string,
    @Body('templateVariables') templateVariables: string,
  ) {
    try {
      const result = await this.brevoMailerService.sendEmailFromTemplate(
        to,
        subject,
        htmlFileLocation,
        templateVariables,
      );
      return { message: 'Email sent successfully', result };
    } catch (error) {
      console.error(error);
      throw new Error('Failed to send transactional email');
    }
  }
}
