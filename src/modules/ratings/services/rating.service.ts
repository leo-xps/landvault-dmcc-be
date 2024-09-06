import { DbService } from '@modules/db/db.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { z } from 'zod';
import { ISurveyCreateInput, ISurveyModel } from '../types/NotesModel.types';

@Injectable()
export class RatingService {
  constructor(
    private readonly db: DbService,
    private readonly i18n: I18nService,
  ) {}

  // get all notes
  async getAllNotes(userID: string): Promise<ISurveyModel[]> {
    const notes = await this.db.survey.findMany({
      where: {
        userID,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return notes;
  }

  createNoteInput = z.object({
    field: z.string(),
    data: z.string(),
  });

  async getNoteByID(userID: string, noteID: string): Promise<ISurveyModel> {
    const note = await this.db.survey.findFirst({
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
  async submitNote(
    userID: string,
    note: ISurveyCreateInput,
  ): Promise<ISurveyModel> {
    const parseInput = this.createNoteInput.safeParse(note);
    if (!parseInput.success) {
      throw new BadRequestException(this.i18n.translate('RPM.INVALID_INPUT'));
    }

    const data = parseInput.data;

    // check if the given field already exists, if it is, update it
    const existingNote = await this.db.survey.findFirst({
      where: {
        field: parseInput.data.field,
        userID,
      },
    });

    if (existingNote) {
      const updatedNote = await this.db.survey.update({
        where: {
          id: existingNote.id,
        },
        data: {
          data: data.data,
        },
      });

      return updatedNote;
    } else {
      const newNote = await this.db.survey.create({
        data: {
          data: data.data,
          field: data.field,
          userID,
        },
      });

      return newNote;
    }
  }

  // delete note
  async deleteNote(userID: string, noteID: string): Promise<ISurveyModel> {
    const note = await this.db.survey.delete({
      where: {
        id: noteID,
        userID,
      },
    });

    return note;
  }

  async reset() {
    return await this.db.survey.deleteMany();
  }
}
