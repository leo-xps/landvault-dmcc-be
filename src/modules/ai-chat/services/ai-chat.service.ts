import { CHATBASE_APIKEY } from '@common/environment';
import { BrevoMailerService } from '@modules/brevo-mailer/services/brevo-mailer.service';
import { DbService } from '@modules/db/db.service';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { I18nService } from 'nestjs-i18n';
import { Observable, catchError, firstValueFrom } from 'rxjs';
import { IChatInput } from '../types/ChatInput';

@Injectable()
export class AiChatService {
  constructor(
    private readonly httpService: HttpService,
    private readonly i18n: I18nService,
    private readonly mailer: BrevoMailerService,
    private readonly db: DbService,
  ) {}

  chatLogs: Record<string, string[]> = {};

  async chatChatbase(userId: string, body: IChatInput) {
    // console.log(userId, body);
    const response = {
      message: (
        await this.requestToChatbaseAIServer<{
          text: string;
        }>({
          method: 'POST',
          data: {
            messages: [
              { content: 'How can I help you?', role: 'assistant' },
              { content: body.message, role: 'user' },
            ],
            chatbotId: 'ry3cz1h3nluQKIbbQEQxU',
            // stream: false,
            // temperature: 0,
            // model: 'gpt-3.5-turbo',
            conversationId: userId,
          },
        })
      ).text,
    };

    if (!this.chatLogs[userId]) {
      this.chatLogs[userId] = [];
    }

    this.chatLogs[userId].push(`You: ${body.message}`);
    this.chatLogs[userId].push(`AI: ${response.message}`);

    return {
      message: response.message,
    };
  }

  async streamChatbase(
    userId: string,
    body: IChatInput,
  ): Promise<Observable<{ data: string }>> {
    if (!this.chatLogs[userId]) {
      this.chatLogs[userId] = [];
    }
    this.chatLogs[userId].push(`You: ${body.message}`);
    let messageHistory = ``;
    return new Observable((subscriber) => {
      axios
        .post(
          'https://www.chatbase.co/api/v1/chat',
          {
            messages: [
              { content: 'How can I help you?', role: 'assistant' },
              { content: body.message, role: 'user' },
            ],
            chatbotId: 'ry3cz1h3nluQKIbbQEQxU',
            stream: true,
            conversationId: userId,
          },
          {
            headers: {
              Authorization: `Bearer ${CHATBASE_APIKEY}`,
            },
            responseType: 'stream',
          },
        )
        .then((res) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          res.data.on('data', (data) => {
            const lines = data
              .toString()
              .split('\n')
              .filter((line) => line.trim() !== '');
            for (const line of lines) {
              const message = line.replace(/^data: /, '');
              if (message === '[DONE]') {
                subscriber.complete();
                return;
              }
              try {
                // process.stdout.write(message);
                subscriber.next({ data: message });
                messageHistory += message;
              } catch (error) {
                console.error(
                  'Could not JSON parse stream message',
                  message,
                  error,
                );
              }
            }
          });

          res.data.on('end', () => {
            subscriber.complete();
            this.chatLogs[userId].push(`AI: ${messageHistory}`);
          });
        });
    });
  }

  async chatFlowise(userId: string, body: IChatInput) {
    // console.log(userId, body);
    const response = {
      message: (await this.requestToFlowiseAIServer({
        method: 'POST',
        data: {
          question: body.message,
          overrideConfig: {
            memoryKey: userId,
          },
        },
      })) as string,
    };

    if (!this.chatLogs[userId]) {
      this.chatLogs[userId] = [];
    }

    this.chatLogs[userId].push(`You: ${body.message}`);
    this.chatLogs[userId].push(`AI: ${response.message}`);

    return response;
  }

  async emailChat(userId: string) {
    // get the chat log
    const chatLog = this.chatLogs[userId] ?? ['-no chat log-'];

    // send email to account
    const account = await this.db.users.findUnique({
      where: {
        id: userId,
      },
    });

    await this.sendChatHistoryEmail(
      account.email,
      userId,
      new Date().toUTCString(),
      chatLog,
    );

    // delete chat log
    delete this.chatLogs[userId];

    return {
      message: `Chat ended. Email of chat log sent to account ${account.email}.`,
      chatLog: chatLog.join('\n'),
    };
  }

  async endChat(userId: string) {
    // get the chat log
    const chatLog = this.chatLogs[userId] ?? ['-no chat log-'];

    // delete chat log
    delete this.chatLogs[userId];

    return {
      message: `Chat ended.`,
      chatLog: chatLog.join('\n'),
    };
  }

  async sendChatHistoryEmail(
    emailReceipient: string,
    chatID: string,
    chatDate: string,
    chatLog: string[],
  ) {
    //optional sending email verification
    const emailData = {
      email: emailReceipient.toLowerCase(),
      subject: 'Elevare Sales AI Chat History',
      fileLocation: 'dist/template/chat-template.hbs',
      params: {
        id: chatID,
        date: new Date(chatDate).toLocaleString(),
        messages: chatLog,
        bookurl: `${process.env.SERVER_URL}/api/appointment/hubspot`,
      },
    };

    // console.log(JSON.stringify(emailData));

    await this.mailer.sendEmailFromTemplate(
      emailData.email,
      emailData.subject,
      emailData.fileLocation,
      emailData.params,
    );
    return true;
  }

  async requestToChatbaseAIServer<T>(
    request_data: AxiosRequestConfig,
    onError?: (error: AxiosError) => void,
  ) {
    /*
      I want you to act as a cheerful female sales representative for a company named "Elevare". Your name is "Elevare Sales AI". You will provide me with answers from the given info. If the answer is not included, say exactly "Hmm, I am not sure." and stop after that. Refuse to answer any question not about the info. Never break character.
    */
    const { data } = await firstValueFrom(
      this.httpService
        .request<T>({
          url: 'https://www.chatbase.co/api/v1/chat',
          ...request_data,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${CHATBASE_APIKEY}`,
            ...request_data.headers,
          },
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

  async requestToFlowiseAIServer<T>(
    request_data: AxiosRequestConfig,
    onError?: (error: AxiosError) => void,
  ) {
    const { data } = await firstValueFrom(
      this.httpService
        .request<T>({
          url: 'https://flowisesrv01.app01.xyzapps.xyz/api/v1/prediction/f9712a55-391d-4a7f-94bc-d01f6006860e',
          ...request_data,
          headers: {
            'Content-Type': 'application/json',
            ...request_data.headers,
          },
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
}
