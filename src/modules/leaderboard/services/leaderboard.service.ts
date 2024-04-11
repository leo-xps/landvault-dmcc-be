import { DbService } from '@modules/db/db.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LeaderboardService {
  constructor(private readonly db: DbService) {}

  // set user score if it doesnt exist yet
  async setUserScore(
    userID: string,
    score: number,
    gameID: string,
    username?: string,
    email?: string,
  ) {
    // if user score already exists, update, else create
    const userScore = await this.db.leaderboard.findFirst({
      where: {
        gameID,
        userID,
      },
    });

    if (userScore) {
      return await this.db.leaderboard.update({
        where: {
          id: userScore.id,
        },
        data: {
          score,
          email,
          nickname: username,
        },
      });
    } else {
      return await this.db.leaderboard.create({
        data: {
          userID,
          score,
          gameID,
          email,
          nickname: username,
        },
      });
    }
  }

  // get user score
  async getUserScore(userID: string, gameID: string) {
    const userScore = await this.db.leaderboard.findFirst({
      where: {
        gameID,
        userID,
      },
      select: {
        score: true,
        createdAt: true,
        nickname: true,
        email: true,
        User: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
    });

    return {
      score: userScore?.score || 0,
      createdAt: userScore?.createdAt || new Date(),
      nickname: userScore?.nickname ?? userScore?.User?.username ?? 'ANONYMOUS',
      email: userScore?.email || userScore?.User?.email || 'ANONYMOUS',
    };
  }

  // get listed scores
  async getLeaderboard(
    gameID: string,
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
    const leaderboard = await this.db.leaderboard.findMany({
      where: {
        gameID,
      },
      orderBy: {
        // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'sortDirection' implicitly has an 'any' type.
        score: sortDirection || 'desc',
      },
      skip,
      take,
      select: {
        score: true,
        createdAt: true,
        nickname: true,
        email: true,
        User: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
    });

    return leaderboard.map((user) => {
      return {
        score: user.score,
        createdAt: user.createdAt,
        // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'user' implicitly has an 'any' type.
        nickname: user.nickname || user.User?.username || 'ANONYMOUS',
        // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'user' implicitly has an 'any' type.
        email: user.email || user.User?.email || 'ANONYMOUS',
      };
    });
  }

  async clearLeaderboard(gameID: string) {
    return await this.db.leaderboard.deleteMany({
      where: {
        gameID,
      },
    });
  }
}
