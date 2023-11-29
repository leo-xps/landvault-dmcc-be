import { BrevoMailerModule } from '@modules/brevo-mailer/brevo-mailer.module';
import { DbModule } from '@modules/db/db.module';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AiChatController } from './controllers/ai-chat.controller';
import { AiChatService } from './services/ai-chat.service';

@Module({
  imports: [HttpModule, DbModule, BrevoMailerModule],
  providers: [AiChatService],
  controllers: [AiChatController],
  exports: [AiChatService],
})
export class AiChatModule {}
