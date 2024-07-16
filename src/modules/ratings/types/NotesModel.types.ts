export interface ISurveyModel {
  id: string;
  userID: string;
  field: string;
  data: string;
  createdAt: Date;
}

export interface ISurveyCreateInput {
  field: string;
  data: string;
}
