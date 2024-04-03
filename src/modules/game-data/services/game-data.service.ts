import { DbService } from '@modules/db/db.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GameDataService {
  constructor(private readonly db: DbService) {}

  // set
  async setGameData(sourceID: string, data: string) {
    // if gameData exists, update it
    const gameData = await this.db.gameData.findFirst({
      where: {
        sourceID,
      },
    });

    if (gameData) {
      return this.db.gameData.update({
        where: {
          id: gameData.id,
        },
        data: {
          data,
        },
      });
    } else {
      // if gameData does not exist, create it
      return this.db.gameData.create({
        data: {
          sourceID,
          data,
        },
      });
    }
  }

  // get
  async getGameData(sourceID: string) {
    const gameData = await this.db.gameData.findFirst({
      where: {
        sourceID,
      },
    });

    return gameData?.data ?? '';
  }

  // get
  async getGameDataAll() {
    const gameData = await this.db.gameData.findMany({});

    return gameData;
  }
}
