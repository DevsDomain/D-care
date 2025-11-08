// src/idosos/idosos.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-book.dto';

@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentService.createAppointment(dto);
  }
}
