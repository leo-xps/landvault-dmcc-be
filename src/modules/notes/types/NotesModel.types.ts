export interface INotesModel {
  id: string;
  title: string;
  data: string;
  metadata: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  deleted: boolean;
  userID: string;
}

export interface INotesCreateInput {
  title?: string;
  data?: string;
  metadata?: string;
}
