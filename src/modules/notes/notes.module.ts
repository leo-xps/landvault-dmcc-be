import { DbModule } from '@modules/db/db.module';
import { Module } from '@nestjs/common';
import { NotesController } from './controllers/notes.controller';
import { NotesService } from './services/notes.service';

@Module({
  imports: [DbModule],
  providers: [NotesService],
  controllers: [NotesController],
})
export class NotesModule {}
