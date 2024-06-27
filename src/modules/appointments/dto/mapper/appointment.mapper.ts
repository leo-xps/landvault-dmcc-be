import { AppointmentOutput } from '../output/appointment.output';

export class AppointmentMapper {
  static displayOne(appointment: any): AppointmentOutput {
    if (!appointment) {
      return undefined;
    }
    return {
      id: appointment.id,
      title: appointment.title,
      description: appointment.description,
      location: appointment.location,
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      code: appointment.code,
      roomType: appointment.roomType,
      roomMode: appointment.roomMode,
      roomEnvironment: appointment.roomEnvironment,
      participants: appointment.participants,
      guestList: appointment.guestList,
    };
  }
  static displayAll(appointment: any[]): AppointmentOutput[] {
    if (!appointment || appointment.length <= 0) {
      return [];
    }
    return appointment.map((appointment) => this.displayOne(appointment));
  }
}
