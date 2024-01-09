import { BrevoMailerModule } from '@modules/brevo-mailer/brevo-mailer.module';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CalendlyController } from './calendly.controller';
import { CalendlyService } from './calendly.service';

@Module({
  imports: [HttpModule, BrevoMailerModule],
  providers: [CalendlyService],
  controllers: [CalendlyController],
})
export class CalendlyModule {}
