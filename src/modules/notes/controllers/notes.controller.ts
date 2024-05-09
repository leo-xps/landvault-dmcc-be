import { RestAuthGuard } from '@common/auth/guards/rest-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { NotesService } from '../services/notes.service';
import { INotesCreateInput } from '../types/NotesModel.types';

@Controller('notes')
export class NotesController {
  constructor(private readonly avaturnService: NotesService) {}

  // get list
  @Get('list')
  @UseGuards(RestAuthGuard)
  async getList(@CurrentUser('id') userId: string) {
    return this.avaturnService.getAllNotes(userId);
  }

  // get by id
  @Get(':id')
  @UseGuards(RestAuthGuard)
  async getById(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.avaturnService.getNoteByID(userId, id);
  }

  // create new
  @Post()
  @UseGuards(RestAuthGuard)
  async createNew(
    @CurrentUser('id') userId: string,
    @Body() body: INotesCreateInput,
  ) {
    return this.avaturnService.createNote(userId, body);
  }

  // update
  @Put(':id/update')
  @UseGuards(RestAuthGuard)
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() body: INotesCreateInput,
  ) {
    return this.avaturnService.updateNote(userId, id, body);
  }

  // delete
  @Put(':id/delete')
  @UseGuards(RestAuthGuard)
  async delete(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.avaturnService.deleteNote(userId, id);
  }
}
