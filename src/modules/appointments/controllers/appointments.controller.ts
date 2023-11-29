import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { CreateAppointmentInput } from '../dto/input/create-appointment.input';
import { UpdateAppointmentInput } from '../dto/input/update-appointment.input';
import { AppointmentMapper } from '../dto/mapper/appointment.mapper';
import { AppointmentsService } from '../services/appointments.service';

@Controller('appointment')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post('create')
  async create(@Body() createAppointmentInput: CreateAppointmentInput) {
    const response = await this.appointmentsService.createAppointment(
      createAppointmentInput,
    );

    return { data: AppointmentMapper.displayOne(response) };
  }

  @Post('update')
  async update(@Body() updateAppointmentInput: UpdateAppointmentInput) {
    const response = await this.appointmentsService.updateAppointment(
      updateAppointmentInput,
    );
    return { data: AppointmentMapper.displayOne(response) };
  }

  @Get()
  async findAppointment(@Body('id') id?: string) {
    const response = await this.appointmentsService.findAppointment(id);
    return { data: AppointmentMapper.displayAll(response) };
  }

  @Post('delete')
  async delete(@Body('ids') ids: string[]) {
    return await this.appointmentsService.deleteAppointments(ids);
  }

  @Get('hubspot')
  async hubspotAppointment(@Res() res) {
    return res.redirect(
      process.env.HUBSPOT_BOOKING_LINK ??
        `https://meetings.hubspot.com/dev-landvaultbe?embed=true`,
    );
  }
}
