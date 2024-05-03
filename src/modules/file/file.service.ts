import { CsvGenService } from '@modules/csv-gen/csv-gen.service';
import { DbService } from '@modules/db/db.service';
import { Injectable } from '@nestjs/common';
import { Client, ClientOptions } from 'minio';

const ClientOpts: ClientOptions = {
  accessKey: process.env.S3_ACCESS_KEY ?? '',
  secretKey: process.env.S3_SECRET_KEY ?? '',
  endPoint: process.env.S3_ENDPOINT ?? '',
  region: process.env.S3_REGION ?? '',
};

const BUCKET_NAME = process.env.S3_BUCKET_NAME ?? '';
const PREFIX = process.env.S3_PATH_PREFIX ?? '';

@Injectable()
export class FileService {
  constructor(
    private readonly db: DbService,
    private readonly csv: CsvGenService,
  ) {}

  client = new Client(ClientOpts);

  async getPresignedUrl(objectName: string, expiry: number = 24 * 60 * 60) {
    const url = await this.client.presignedPutObject(
      BUCKET_NAME,
      PREFIX + objectName,
      expiry,
    );
    return url;
  }

  async generateUploadUrl(fileName: string) {
    const presignedUrl = await this.getPresignedUrl(fileName);

    const getURL = presignedUrl.split('?')[0];

    return { putURL: presignedUrl, getURL: getURL };
  }
}
