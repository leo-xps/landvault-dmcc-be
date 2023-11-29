import { DbService } from '@modules/db/db.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { z } from 'zod';
import { IRPMModel, IRPMModelCreateInput } from '../types/RPMModel.types';

@Injectable()
export class RpmService {
  constructor(
    private readonly db: DbService,
    private readonly i18n: I18nService,
  ) {}

  // get default model
  async getDefaultModel(userID: string): Promise<IRPMModel> {
    const model = await this.db.rPMModels.findFirst({
      where: {
        userID,
        isDefault: true,
      },
    });

    if (!model) {
      throw new BadRequestException(
        this.i18n.translate('RPM.RPM.NO_DEFAULT_MODEL'),
      );
    }

    return model;
  }

  // get all models
  async getAllModels(userID: string): Promise<IRPMModel[]> {
    const models = await this.db.rPMModels.findMany({
      where: {
        userID,
      },
    });

    return models;
  }

  createModelInput = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    modelID: z.string(),
  });

  // create model
  async createModel(
    userID: string,
    model: IRPMModelCreateInput,
  ): Promise<IRPMModel> {
    const parseInput = this.createModelInput.safeParse(model);

    if (!parseInput.success) {
      throw new BadRequestException(this.i18n.translate('RPM.INVALID_INPUT'));
    }

    const data = parseInput.data;

    const currentModelCount = await this.db.rPMModels.count({
      where: {
        userID,
      },
    });

    const newModel = await this.db.rPMModels.create({
      data: {
        name: data.name,
        description: data.description,
        modelID: data.modelID,
        isDefault: currentModelCount === 0 ? true : false, // set as default if no models exist
        userID,
      },
    });

    return newModel;
  }

  // set model as default
  async setModelAsDefault(userID: string, modelID: string): Promise<IRPMModel> {
    // check if model exists
    const check = await this.db.rPMModels.findFirst({
      where: {
        id: modelID,
        userID,
      },
    });

    if (!check) {
      throw new BadRequestException(this.i18n.translate('RPM.INVALID_DEFAULT'));
    }

    // Set current model as not default
    await this.db.rPMModels.updateMany({
      where: {
        userID,
      },
      data: {
        isDefault: false,
      },
    });

    const model = await this.db.rPMModels.update({
      where: {
        id: modelID,
        userID,
      },
      data: {
        isDefault: true,
      },
    });

    return model;
  }

  // update model
  async updateModel(
    userID: string,
    modelID: string,
    model: IRPMModelCreateInput,
  ): Promise<IRPMModel> {
    const parseInput = this.createModelInput.safeParse(model);

    if (!parseInput.success) {
      throw new BadRequestException(this.i18n.translate('RPM.INVALID_INPUT'));
    }

    const data = parseInput.data;

    const updatedModel = await this.db.rPMModels.update({
      where: {
        id: modelID,
        userID,
      },
      data: {
        name: data.name,
        description: data.description,
        modelID: data.modelID,
      },
    });

    return updatedModel;
  }

  // delete model
  async deleteModel(userID: string, modelID: string): Promise<IRPMModel> {
    const model = await this.db.rPMModels.findFirst({
      where: {
        id: modelID,
        userID,
      },
    });

    // check if model is default
    if (!model || model.isDefault) {
      throw new BadRequestException(this.i18n.translate('RPM.INVALID_DELETE'));
    }

    await this.db.rPMModels.delete({
      where: {
        id: modelID,
        userID,
      },
    });

    return model;
  }
}
