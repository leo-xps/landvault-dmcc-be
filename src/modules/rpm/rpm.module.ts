import { DbModule } from '@modules/db/db.module';
import { Module } from '@nestjs/common';
import { RpmController } from './controllers/rpm.controller';
import { RpmService } from './services/rpm.service';

@Module({
  imports: [DbModule],
  providers: [RpmService],
  controllers: [RpmController],
})
export class RpmModule {}
