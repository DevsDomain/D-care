// backend/src/appointment/appointment.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  BadRequestException,
  Patch,
  Param,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-book.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';

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
      throw new BadRequestException(
        'Informe familyId OU caregiverId na query string.',
      );
    }
    return this.appointmentService.listAppointments({ familyId, caregiverId });
  }

  /**
   * PATCH /appointments/:id/status
   * body: { "status": "CANCELLED" | "ACCEPTED" | ... }
   */
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentStatusDto,
  ) {
    return this.appointmentService.updateStatus(id, dto.status);
  }
}
