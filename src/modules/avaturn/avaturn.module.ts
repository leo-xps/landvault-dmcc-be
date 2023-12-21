import { DbModule } from '@modules/db/db.module';
import { Module } from '@nestjs/common';
import { AvaturnController } from './controllers/avaturn.controller';
import { AvaturnService } from './services/avaturn.service';

@Module({
  imports: [DbModule],
  providers: [AvaturnService],
  controllers: [AvaturnController],
})
export class AvaturnModule {}
