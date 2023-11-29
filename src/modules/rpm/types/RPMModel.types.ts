export interface IRPMModel {
  id: string;
  name: string;
  description: string;
  modelID: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  deleted: boolean;
  userID: string;
}

export interface IRPMModelCreateInput {
  name?: string;
  description?: string;
  modelID: string;
}
