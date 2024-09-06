interface Token {
  email: string;
  name: string;
  code: string;
  roomType: string;
  roomMode: string;
  roomEnvironment: string;
  validOn: string;
  expiredOn: string;
  isGuest: string;
  iat: number;
  exp: number;
  guestAppointment?: boolean;
}
