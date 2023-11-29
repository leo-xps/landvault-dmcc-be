import { Module } from '@nestjs/common';
import { CalendlyApiController } from './calendly-api.controller';
import { CalendlyApiService } from './calendly-api.service';

@Module({
  providers: [CalendlyApiService],
  controllers: [CalendlyApiController],
})
export class CalendlyApiModule {}
