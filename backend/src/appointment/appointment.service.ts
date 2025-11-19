// backend/src/appointment/appointment.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateAppointmentDto } from './dto/create-book.dto';
import { CreateReviewDto } from './dto/create-review.dto';

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

  // 🔥 Criação de review + atualização da média do cuidador
  async createReview(appointmentId: string, dto: CreateReviewDto) {
    // 1) Verifica se o agendamento existe
    const appointment = await this.prisma.appointments.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    if (!appointment.caregiverId) {
      throw new BadRequestException(
        'Agendamento não possui cuidador associado',
      );
    }

    // 2) Garante que o cuidador passado é o mesmo do agendamento
    if (appointment.caregiverId !== dto.caregiverId) {
      throw new BadRequestException(
        'Cuidador informado não é o mesmo deste agendamento',
      );
    }

    // 3) (Opcional) garantir 1 review por agendamento + família
    const existing = await this.prisma.reviews.findFirst({
      where: {
        appointmentId: appointmentId,
        familyId: appointment.familyId ?? undefined,
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Já existe uma avaliação para este atendimento.',
      );
    }

    // 4) Cria a review na tabela "reviews"."reviews"
    const review = await this.prisma.reviews.create({
      data: {
        appointmentId: appointmentId,
        caregiverId: dto.caregiverId,
        familyId: appointment.familyId,
        rating: dto.rating,
        comment: dto.comment ?? null,
      },
    });

    // 5) Recalcula média e quantidade de avaliações do cuidador
    const agg = await this.prisma.reviews.aggregate({
      where: {
        caregiverId: dto.caregiverId,
        rating: { not: null },
      },
      _avg: { rating: true },
      _count: { _all: true },
    });

    await this.prisma.caregivers.update({
      where: { id: dto.caregiverId },
      data: {
        rating: agg._avg.rating ?? 0,
        reviewCount: agg._count._all,
      },
    });

    return review;
  }

  // ✅ NOVO: listar avaliações por cuidador
  async listReviewsByCaregiver(caregiverId: string) {
    const caregiver = await this.prisma.caregivers.findUnique({
      where: { id: caregiverId },
    });

    if (!caregiver) {
      throw new NotFoundException('Cuidador não encontrado');
    }

    const reviews = await this.prisma.reviews.findMany({
      where: { caregiverId },
      orderBy: { createdAt: 'desc' },
      include: {
        appointment: {
          include: {
            elder: true,
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
        },
      },
    });

    // Mapeia para um formato mais enxuto para o front
    return reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      appointmentDate: r.appointment?.datetimeStart ?? null,
      elderName: r.appointment?.elder?.name ?? null,
      familyName:
        r.appointment?.family?.user?.userProfile?.[0]?.name ?? null,
    }));
  }
}
