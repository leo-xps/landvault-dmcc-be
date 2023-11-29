import { DbService } from '@modules/db/db.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BlacklistedService {
  constructor(private readonly db: DbService) {}

  async addTokenToBlacklist(token: string): Promise<void> {
    const exist = await this.db.blacklistedToken.findUnique({
      where: { token },
    });

    if (!exist) {
      await this.db.blacklistedToken.create({
        data: { token },
      });
    }
  }
}
