import { DbModule } from '@modules/db/db.module';
import { ServerTokensModule } from '@modules/server-tokens/server-tokens.module';
import { Module } from '@nestjs/common';
import { GameDataController } from './controllers/game-data.controller';
import { GameDataService } from './services/game-data.service';

@Module({
  imports: [DbModule, ServerTokensModule],
  providers: [GameDataService],
  controllers: [GameDataController],
})
export class GameDataModule {}
