export interface ISendAppointmentContextInput {
  to: [
    {
      email: string;
      name?: string;
    },
  ];
  params: any;
}
