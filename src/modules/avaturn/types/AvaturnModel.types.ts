export interface IAvaturnModel {
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

export interface IAvaturnModelCreateInput {
  name?: string;
  description?: string;
  modelID: string;
}
