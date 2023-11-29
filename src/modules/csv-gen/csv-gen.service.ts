import { Injectable } from '@nestjs/common';
import { stringify } from 'csv-stringify/sync';

@Injectable()
export class CsvGenService {
  async generateCSV(columns: string[], rows: string[][]) {
    const csvString = stringify(rows, {
      header: true,
      columns,
    });

    return {
      string: csvString,
    };
  }
}
