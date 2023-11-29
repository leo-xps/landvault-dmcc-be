import { Module } from '@nestjs/common';
import { BrevoMailerController } from './controllers/brevo-mailer.controller';
import { BrevoMailerService } from './services/brevo-mailer.service';

@Module({
  controllers: [BrevoMailerController],
  providers: [BrevoMailerService],
  exports: [BrevoMailerService],
})
export class BrevoMailerModule {}
