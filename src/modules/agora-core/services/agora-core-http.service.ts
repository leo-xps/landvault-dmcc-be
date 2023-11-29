import {
  AGORA_CHAT_API_URL,
  AGORA_CHAT_APPNAME,
  AGORA_CHAT_ORGNAME,
  AGORA_REST_ID,
  AGORA_REST_SECRET,
} from '@common/environment';
import { NestCacheService } from '@modules/cache/cache.service';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { I18nService } from 'nestjs-i18n';
import { catchError, firstValueFrom } from 'rxjs';
import { AgoraCoreTokenService } from './agora-core-token.service';

@Injectable()
export class AgoraCoreHttpService {
  constructor(
    private readonly httpService: HttpService,
    private readonly agoraToken: AgoraCoreTokenService,
    private readonly i18n: I18nService,
    private readonly cache: NestCacheService,
  ) {}

  getAgoraChatRestURL(suffix: string) {
    return `https://${AGORA_CHAT_API_URL}/${AGORA_CHAT_ORGNAME}/${AGORA_CHAT_APPNAME}/${suffix}`;
  }

  getRESTAuth() {
    return this.cache.cachedValueOrFetch(
      {
        key: 'agora-rest-auth',
      },
      async () => {
        const customerKey = AGORA_REST_ID;
        // Customer secret
        const customerSecret = AGORA_REST_SECRET;
        // Concatenate customer key and customer secret and use base64 to encode the concatenated string
        const plainCredential = customerKey + ':' + customerSecret;
        // Encode with base64
        const encodedCredential =
          Buffer.from(plainCredential).toString('base64');
        const authorizationField = 'Basic ' + encodedCredential;
        return authorizationField;
      },
    );
  }

  async requestToAgoraServer<T>(
    endpoint: string,
    request_data: AxiosRequestConfig,
    onError?: (error: AxiosError) => void,
  ) {
    const { data } = await firstValueFrom(
      this.httpService
        .request<T>({
          url: this.getAgoraChatRestURL(endpoint),
          ...request_data,
          headers: {
            Authorization: `Bearer ${await this.agoraToken.getAgoraAppToken()}`,
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
