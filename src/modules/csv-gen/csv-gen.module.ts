import { Module } from '@nestjs/common';
import { CsvGenService } from './csv-gen.service';

@Module({
  providers: [CsvGenService],
  exports: [CsvGenService],
})
export class CsvGenModule {}
