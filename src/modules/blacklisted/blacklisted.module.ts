import { DbModule } from '@modules/db/db.module';
import { Module } from '@nestjs/common';
import { BlacklistedController } from './controllers/blacklisted.controller';
import { BlacklistedService } from './services/blacklisted.service';

@Module({
  imports: [DbModule],
  controllers: [BlacklistedController],
  providers: [BlacklistedService],
  exports: [BlacklistedService],
})
export class BlacklistedModule {}
