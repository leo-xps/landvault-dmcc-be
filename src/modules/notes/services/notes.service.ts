import { DbService } from '@modules/db/db.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { z } from 'zod';
import { INotesCreateInput, INotesModel } from '../types/NotesModel.types';

@Injectable()
export class NotesService {
  constructor(
    private readonly db: DbService,
    private readonly i18n: I18nService,
  ) {}

  // get all notes
  async getAllNotes(userID: string): Promise<INotesModel[]> {
    const notes = await this.db.notes.findMany({
      where: {
        userID,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return notes;
  }

  createNoteInput = z.object({
    title: z.string().optional(),
    data: z.string().optional(),
    metadata: z.string().optional(),
  });

  async getNoteByID(userID: string, noteID: string): Promise<INotesModel> {
    const note = await this.db.notes.findFirst({
      where: {
        id: noteID,
        userID,
      },
    });

    if (!note) {
      throw new BadRequestException(this.i18n.translate('RPM.NOT_FOUND'));
    }

    return note;
  }

  // create note
  async createNote(
    userID: string,
    note: INotesCreateInput,
  ): Promise<INotesModel> {
    const parseInput = this.createNoteInput.safeParse(note);
    if (!parseInput.success) {
      throw new BadRequestException(this.i18n.translate('RPM.INVALID_INPUT'));
    }

    const data = parseInput.data;

    const newNote = await this.db.notes.create({
      data: {
        title: data.title,
        data: data.data,
        metadata: data.metadata,
        userID,
      },
    });

    return newNote;
  }

  // update note
  async updateNote(
    userID: string,
    noteID: string,
    note: INotesCreateInput,
  ): Promise<INotesModel> {
    const parseInput = this.createNoteInput.safeParse(note);

    if (!parseInput.success) {
      throw new BadRequestException(this.i18n.translate('RPM.INVALID_INPUT'));
    }

    const data = parseInput.data;

    const updatedNote = await this.db.notes.update({
      where: {
        id: noteID,
        userID,
      },
      data: {
        title: data.title,
        data: data.data,
        metadata: data.metadata,
      },
    });

    return updatedNote;
  }

  // delete note
  async deleteNote(userID: string, noteID: string): Promise<INotesModel> {
    const note = await this.db.notes.delete({
      where: {
        id: noteID,
        userID,
      },
    });

    return note;
  }
}
