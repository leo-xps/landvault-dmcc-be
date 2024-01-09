import {
  MAILER_BREVO_API_KEY,
  MAILER_EMAILADDRESS,
  MAILER_NAME,
} from '@common/environment';
import { getHTMLFileFromTemplates } from '@common/utils/readFiles';
import { ISendMailOptions } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import handlebars from 'handlebars';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';
import { ApiClient, TransactionalEmailsApi } from 'sib-api-v3-sdk';
@Injectable()
export class BrevoMailerService {
  private apiInstance: TransactionalEmailsApi;
  constructor() {
    const defaultClient = ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = MAILER_BREVO_API_KEY;

    this.apiInstance = new TransactionalEmailsApi();
  }

  async executeSendEmail(
    options: ISendMailOptions,
    extra?: {
      templateParams?: SibApiV3Sdk.SendSmtpEmail['params'];
    },
  ) {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = options.subject;
    sendSmtpEmail.htmlContent = options.html as string;
    sendSmtpEmail.sender = {
      name: MAILER_NAME,
      email: MAILER_EMAILADDRESS,
    };
    sendSmtpEmail.to = [
      {
        email: options.to as string,
      },
    ];

    if (options.cc) sendSmtpEmail.cc = [{ email: options.cc as string }];

    if (options.template) {
      sendSmtpEmail.templateId = Number(options.template);
    } else if (options.html) {
      sendSmtpEmail.htmlContent = options.html as string;
    }
    if (extra?.templateParams) {
      sendSmtpEmail.params = extra?.templateParams;
    }

    return await this.apiInstance.sendTransacEmail(sendSmtpEmail);
  }

  async sendEmail(to: string, subject: string, htmlMessage: string) {
    const messageId = await this.executeSendEmail({
      to: to,
      subject: subject,
      html: htmlMessage,
      textEncoding: 'base64',
    });

    return messageId;
  }

  async sendEmailFromTemplate(
    to: string,
    subject: string,
    htmlFileLocation: string,
    templateVariables:
      | {
          [key: string]: string;
        }
      | any,
  ) {
    const htmlText = await this.getHandleBarFile(
      htmlFileLocation,
      templateVariables,
    );

    const messageId = await this.sendEmail(to, subject, htmlText);

    return messageId;
  }

  async getHandleBarFile(
    emailTemplate: string,
    replacements: Record<string, unknown>,
    compile = true,
  ) {
    const htmlText = await getHTMLFileFromTemplates(emailTemplate);

    if (!compile) {
      return htmlText;
    }

    const context = { ...replacements };
    const template = handlebars.compile(htmlText);
    const hbsToSend = template(context);

    return hbsToSend;
  }

  async executeBatchSendEmail(
    options: any,
    messageVersions: SibApiV3Sdk.SendSmtpEmailMessageVersions[],
  ) {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = options.subject;
    sendSmtpEmail.htmlContent = options.html as string;
    sendSmtpEmail.sender = {
      name: MAILER_NAME,
      email: MAILER_EMAILADDRESS,
    };
    if (options.cc) sendSmtpEmail.cc = [{ email: options.cc as string }];

    sendSmtpEmail.messageVersions = messageVersions;

    try {
      const res = await this.apiInstance.sendTransacEmail(sendSmtpEmail);

      return res;
    } catch (err) {
      console.log(err);
    }
  }

  async sendBatchEmail(
    messageVersions: SibApiV3Sdk.SendSmtpEmailMessageVersions[],
    subject: string,
    htmlMessage: string,
  ) {
    const messageId = await this.executeBatchSendEmail(
      {
        subject: subject,
        html: htmlMessage,
        textEncoding: 'base64',
      },
      messageVersions,
    );

    return messageId;
  }

  async sendBatchEmailFromTemplate(
    messageVersions: SibApiV3Sdk.SendSmtpEmailMessageVersions[],
    subject: string,
    htmlFileLocation: string,
  ) {
    const htmlText = await this.getHandleBarFile(htmlFileLocation, {}, false);

    const messageId = await this.sendBatchEmail(
      messageVersions,
      subject,
      htmlText,
    );

    return messageId;
  }

  async sendEmailByBrevoTemplate(
    to: string,
    subject: string,
    templateId: string,
    params: SibApiV3Sdk.SendSmtpEmail['params'],
  ) {
    const messageId = await this.executeSendEmail(
      {
        to: to,
        cc: '',
        subject: subject,
        template: templateId,
      },
      {
        templateParams: params,
      },
    );

    return messageId;
  }
}
