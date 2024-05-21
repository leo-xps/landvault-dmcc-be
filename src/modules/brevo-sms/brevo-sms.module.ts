import { Module } from '@nestjs/common';
import { BrevoSmsController } from './controllers/brevo-sms.controller';
import { BrevoSmsService } from './services/brevo-sms.service';

@Module({
  controllers: [BrevoSmsController],
  providers: [BrevoSmsService],
  exports: [BrevoSmsService],
})
export class BrevoSmsModule {}
