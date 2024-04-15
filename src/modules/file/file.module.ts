import { CsvGenModule } from '@modules/csv-gen/csv-gen.module';
import { DbModule } from '@modules/db/db.module';
import { ServerTokensModule } from '@modules/server-tokens/server-tokens.module';
import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';

@Module({
  imports: [DbModule, ServerTokensModule, CsvGenModule],
  providers: [FileService],
  controllers: [FileController],
})
export class FileModule {}
