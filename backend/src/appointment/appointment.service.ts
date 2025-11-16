// backend/src/appointment/appointment.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateAppointmentDto } from './dto/create-book.dto';

export type AppointmentStatusString =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED';

@Injectable()
export class AppointmentService {
  constructor(private prisma: PrismaService) {}

  async createAppointment(dto: CreateAppointmentDto) {
    // 1) Junta 'YYYY-MM-DD' + 'HH:MM' => ISO local
    const startDateTimeISO = `${dto.date}T${dto.startTime}`;

    // 2) Converte para Date
    const datetimeStart = new Date(startDateTimeISO);

    // 3) Valida formato
    if (isNaN(datetimeStart.getTime())) {
      throw new BadRequestException(
        `Invalid date/time. Use: date 'YYYY-MM-DD' e startTime 'HH:MM'. Recebido: ${startDateTimeISO}`,
      );
    }

    // 4) Duração em MINUTOS (DTO já está em minutos)
    const durationMinutes = Number(dto.duration ?? 0);
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      throw new BadRequestException(
        `'duration' deve ser um número (minutos) > 0`,
      );
    }

    const datetimeEnd = new Date(
      datetimeStart.getTime() + durationMinutes * 60000,
    );

    return this.prisma.appointments.create({
      data: {
        familyId: dto.familyId,
        elderId: dto.elderId,
        caregiverId: dto.caregiverId,
        datetimeStart,
        datetimeEnd,
        status: (dto.status as AppointmentStatusString) ?? 'PENDING',
        emergency: dto.emergency ?? false,
        notes: dto.notes ?? '',
        totalPrice: dto.totalPrice ?? 0,
      },
    });
  }

  async listAppointments(params: { familyId?: string; caregiverId?: string }) {
    const where: any = {};
    if (params.familyId) where.familyId = params.familyId;
    if (params.caregiverId) where.caregiverId = params.caregiverId;

    const rows = await this.prisma.appointments.findMany({
      where,
      orderBy: { datetimeStart: 'asc' },
      include: {
        elder: true,

        caregiver: {
          include: {
            user: {
              include: {
                userProfile: true,
              },
            },
          },
        },

        family: {
          include: {
            user: {
              include: {
                userProfile: true,
              },
            },
          },
        },
      },
    });

    return rows;
  }

  async updateStatus(id: string, status: AppointmentStatusString) {
    const allowed: AppointmentStatusString[] = [
      'PENDING',
      'ACCEPTED',
      'REJECTED',
      'CANCELLED',
      'COMPLETED',
    ];

    if (!allowed.includes(status)) {
      throw new BadRequestException('Status inválido');
    }

    const appointment = await this.prisma.appointments.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new BadRequestException('Agendamento não encontrado');
    }

    return this.prisma.appointments.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
    });
  }
}
