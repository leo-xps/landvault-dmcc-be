import { CsvGenModule } from '@modules/csv-gen/csv-gen.module';
import { DbModule } from '@modules/db/db.module';
import { ServerTokensModule } from '@modules/server-tokens/server-tokens.module';
import { Module } from '@nestjs/common';
import { DownloadController } from './download.controller';
import { DownloadService } from './download.service';

@Module({
  imports: [DbModule, ServerTokensModule, CsvGenModule],
  providers: [DownloadService],
  controllers: [DownloadController],
})
export class DownloadModule {}
