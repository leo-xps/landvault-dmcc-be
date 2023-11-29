import { _1_MINUTE } from '@common/utils/time';
import { NestCacheService } from '@modules/cache/cache.service';
import { DbService } from '@modules/db/db.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ServerTokensService {
  constructor(
    private readonly db: DbService,
    private readonly cache: NestCacheService,
  ) {}

  async checkIfServerTokenExists() {
    if (
      !process.env.SERVER_SECRET_KEY ||
      process.env.SERVER_SECRET_KEY === ''
    ) {
      return;
    }

    // check if token exists in db
    const token = await this.db.serverAdminTokens.findUnique({
      where: {
        token: process.env.SERVER_SECRET_KEY,
      },
    });

    // if not, create one
    if (!token) {
      await this.db.serverAdminTokens.create({
        data: {
          token: process.env.SERVER_SECRET_KEY,
        },
      });
    }
  }

  async validateToken(token: string): Promise<boolean> {
    await this.checkIfServerTokenExists();
    if (!token || token.length == 0) return false;
    return await this.cache.cachedValueOrFetch(
      {
        key: `server-token-${token}`,
      },
      async () => {
        const server = await this.db.serverAdminTokens.findUnique({
          where: {
            token,
          },
        });
        return !!server;
      },
      5 * _1_MINUTE,
    );
  }
}
