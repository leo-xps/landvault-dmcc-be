import { CsvGenService } from '@modules/csv-gen/csv-gen.service';
import { DbService } from '@modules/db/db.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DownloadService {
  constructor(
    private readonly db: DbService,
    private readonly csv: CsvGenService,
  ) {}

  async generateListOfUsers(opts?: { includeGuests?: boolean }) {
    const userList = await this.db.users.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        isGuest: true,
        verified: true,
      },
      where: {
        isGuest: opts?.includeGuests ? undefined : false,
      },
    });

    // filename should consist of {fxname}_{datetime}_{opts}
    const filename = `users_${new Date().getTime()}${
      opts?.includeGuests ? '_withGuest' : ''
    }.csv`;

    const readStream = await this.csv.generateCSV(
      ['id', 'email', 'username', 'createdAt', 'updatedAt'],
      userList.map((user) => [
        user.id,
        user.email,
        user.username,
        user.createdAt.toISOString(),
        user.updatedAt.toISOString(),
      ]),
    );

    return {
      filename,
      readStream,
    };
  }
}
