import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateAppointmentDto } from './dto/create-book.dto';

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
      throw new BadRequestException(`'duration' deve ser um número (minutos) > 0`);
    }

    const datetimeEnd = new Date(datetimeStart.getTime() + durationMinutes * 60000);

    return this.prisma.appointments.create({
      data: {
        familyId: dto.familyId,
        elderId: dto.elderId,
        caregiverId: dto.caregiverId,
        datetimeStart,
        datetimeEnd,
        status: (dto.status as any) ?? 'PENDING',
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

    // Incluímos elder e caregiver para facilitar a renderização no front.
    // (O nome do cuidador costuma vir via Users -> UserProfiles; se quiser,
    //  pode expandir mais um nível depois.)
    const rows = await this.prisma.appointments.findMany({
      where,
      orderBy: { datetimeStart: 'asc' },
      include: {
        elder: true,
        caregiver: {
          include: {
            user: {
              include: {
                userProfile: true, // é uma lista; pegue o [0] no front, se existir
              },
            },
          },
        },
      },
    });

    return rows;
  }
}
