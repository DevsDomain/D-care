import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateAppointmentRequestDto } from './dto/create-appointment-request.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentRequestDto } from './dto/update-appointment-request.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AgendamentosService {
  constructor(private prisma: PrismaService) {}

  async createAppointment(dto: CreateAppointmentDto) {
    return this.prisma.appointments.create({
      data: {
        familyId: dto.familyId,
        elderId: dto.elderId,
        caregiverId: dto.caregiverId,
        datetimeStart: new Date(dto.datetimeStart),
        datetimeEnd: new Date(dto.datetimeEnd),
        status: dto.status,
        emergency: dto.emergency,
      },
      include: { family: true, elder: true, caregiver: true, review: true },
    });
  }

  async findAllAppointments() {
    return this.prisma.appointments.findMany({
      include: { family: true, elder: true, caregiver: true, review: true },
    });
  }

  async findAppointmentById(id: string) {
    const appointment = await this.prisma.appointments.findUnique({
      where: { id },
      include: { family: true, elder: true, caregiver: true, review: true },
    });
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    return appointment;
  }

  async updateAppointment(id: string, dto: UpdateAppointmentDto) {
    return this.prisma.appointments.update({
      where: { id },
      data: {
        familyId: dto.familyId,
        elderId: dto.elderId,
        caregiverId: dto.caregiverId,
        datetimeStart: dto.datetimeStart
          ? new Date(dto.datetimeStart)
          : undefined,
        datetimeEnd: dto.datetimeEnd ? new Date(dto.datetimeEnd) : undefined,
        status: dto.status,
        emergency: dto.emergency,
      },
      include: { family: true, elder: true, caregiver: true, review: true },
    });
  }

  async deleteAppointment(id: string) {
    return this.prisma.appointments.delete({
      where: { id },
    });
  }

  async createAppointmentRequest(dto: CreateAppointmentRequestDto) {
    return this.prisma.appointmentRequests.create({
      data: {
        appointmentId: dto.appointmentId,
        caregiverId: dto.caregiverId,
        status: dto.status,
      },
    });
  }

  async updateAppointmentRequest(id: string, dto: UpdateAppointmentRequestDto) {
    return this.prisma.appointmentRequests.update({
      where: { id },
      data: {
        status: dto.status,
      },
    });
  }
}
