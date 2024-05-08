import { PRICE_TICKER_FINANCIAL_PREP } from '@common/environment';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { I18nService } from 'nestjs-i18n';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class PriceApiCoreHttpService {
  constructor(
    private readonly httpService: HttpService,
    private readonly i18n: I18nService,
  ) {}

  getPriceRestURL(suffix: string) {
    return `https://financialmodelingprep.com/api/${suffix}?apikey=${PRICE_TICKER_FINANCIAL_PREP}`;
  }

  async requestToFinancialModellingServer<T>(
    endpoint: string,
    request_data: AxiosRequestConfig,
    onError?: (error: AxiosError) => void,
  ) {
    const { data } = await firstValueFrom(
      this.httpService
        .request<T>({
          url: this.getPriceRestURL(endpoint),
          ...request_data,
          headers: {
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
