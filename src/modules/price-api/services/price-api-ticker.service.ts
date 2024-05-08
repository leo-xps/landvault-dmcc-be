import { _1_SECOND } from '@common/utils/time';
import { NestCacheService } from '@modules/cache/cache.service';
import { Injectable } from '@nestjs/common';
import { PriceApiCoreHttpService } from './price-api-core-http.service';
import { QuoteType } from './price-api-core.type';

@Injectable()
export class PriceApiService {
  constructor(
    private readonly api: PriceApiCoreHttpService,
    private readonly cache: NestCacheService,
  ) {}

  priceList = [
    'BTCUSD',
    'ETHUSD',
    'SOLUSD',
    'XRPUSD',
    'BSUDUSD',
    'LINKUSD',
    'SGLYUSD',
    'HAIUSD',
    'MATICUSD',
    'BICOUSD',
    'SUIUSD',
    'ANKRUSD',
    'BOBAUSD',
    'BLOK',
    'ADAUSD',
    'TONUSD',
    'AVAXUSD',
    'UNIUSD',
    '1INCHUSD',
    'AGIXUSD',
  ];

  async getTickerPrice(tickers: string[] = this.priceList) {
    return await this.cache.cachedValueOrFetch(
      {
        key: 'price-list',
      },
      async () => {
        const result = await this.api.requestToFinancialModellingServer<
          QuoteType[]
        >(`v3/quote/${tickers.join(',')}`, {
          method: 'GET',
        });

        return result.map((item) => ({
          symbol: item.symbol,
          name: item.name,
          price: item.price,
          changePercentage: item.changesPercentage,
          change: item.change,
          timestamp: item.timestamp,
        }));
      },
      10 * _1_SECOND,
    );
  }
}
