import { MAILER_BREVO_API_KEY } from '@common/environment';
import { Injectable } from '@nestjs/common';
import * as Sib from 'sib-api-v3-sdk';
@Injectable()
export class BrevoSmsService {
  private apiInstance: Sib.TransactionalSMSAPI;
  constructor() {
    const defaultClient = Sib.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = MAILER_BREVO_API_KEY;

    // console.log(Sib);
    this.apiInstance = new Sib.TransactionalSMSApi();
  }

  async sendSMS(opts: { sender: string; recipient: string; content: string }) {
    const sendTransacSms = new Sib.SendTransacSms();
    sendTransacSms.sender = 'LANDVAULT';
    sendTransacSms.recipient = opts.recipient;
    sendTransacSms.content = opts.content;
    sendTransacSms.type = 'transactional';

    try {
      await this.apiInstance.sendTransacSms(sendTransacSms);
    } catch (error) {
      console.error(error);
      throw new Error('Failed to send transactional SMS');
    }
  }
}
