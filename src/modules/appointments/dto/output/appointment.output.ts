export class AppointmentOutput {
  id: string;
  title?: string;
  description?: string;
  location?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  code?: string;
  roomType?: string;
  roomMode?: string;
  roomEnvironment?: string;
  participants?: string[];
  guestList?: string[];
}
