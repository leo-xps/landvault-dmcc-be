import { CRYPTO_SSO, CRYPTO_UID } from '@common/environment';
import { NestCacheService } from '@modules/cache/cache.service';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LeaderboardCryptoService {
  constructor(
    private readonly httpService: HttpService,
    private readonly cache: NestCacheService,
  ) {}

  async getLeaderboardCryptoToken() {
    return await this.cache.cachedValueOrFetch(
      {
        key: LeaderboardCryptoService.name,
        name: 'leaderboard-crypto-token',
      },
      async () => {
        const token = await this.httpService.axiosRef.post(
          'https://metaapi.3-verse.io/api/verify',
          {
            uid: CRYPTO_UID,
            ssoToken: CRYPTO_SSO,
          },
        );
        console.log('token', token.data?.token);
        return token.data?.token;
      },
      5 * 60 * 1000,
    );
  }

  // get user score
  async getUserScore(userID: string) {
    // get score here

    return {
      score: 0,
      userId: userID,
      createdAt: new Date(),
      nickname: 'ANONYMOUS',
      email: 'ANONYMOUS',
    };
  }

  // get listed scores
  async getLeaderboard(
    contestId = 246,
    skip?: number,
    take?: number,
    sortDirection?: string,
  ) {
    if (['asc', 'desc'].indexOf(sortDirection) === -1) {
      sortDirection = 'desc';
    }
    if (!skip) {
      skip = 0;
    }
    if (!take) {
      take = 10;
    }

    return await this.cache.cachedValueOrFetch(
      {
        contestId: contestId.toString(),
        skip: skip.toString(),
        take: take.toString(),
        sortDirection: sortDirection,
        key: LeaderboardCryptoService.name,
        name: 'leaderboard-crypto-token',
      },
      async () => {
        const token = await this.getLeaderboardCryptoToken();

        const { data } = await this.httpService.axiosRef.post(
          'https://metaapi.3-verse.io/api/leaderboard-data',
          {
            contestId: contestId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const leaderboard = data?.data || [];

        return leaderboard.map((user) => {
          return {
            score: user.portfoliovalue,
            createdAt: user.createdAt,
            userId: user.uid,
            nickname: user.name || user.userName || 'ANONYMOUS',
            email: user.name || user.userName || 'ANONYMOUS',
          };
        });
      },
      5 * 60 * 1000,
    );
  }
}
