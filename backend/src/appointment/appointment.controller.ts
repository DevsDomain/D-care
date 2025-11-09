import { Controller, Post, Body, Get, Query, BadRequestException } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-book.dto';

@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentService.createAppointment(dto);
  }

  /**
   * GET /appointments?familyId=<uuid>
   * GET /appointments?caregiverId=<uuid>
   * (Um dos dois é obrigatório)
   */
  @Get()
  async list(
    @Query('familyId') familyId?: string,
    @Query('caregiverId') caregiverId?: string,
  ) {
    if (!familyId && !caregiverId) {
      throw new BadRequestException('Informe familyId OU caregiverId na query string.');
    }
    return this.appointmentService.listAppointments({ familyId, caregiverId });
  }
}
