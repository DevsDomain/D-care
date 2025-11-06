// src/idosos/idosos.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateAppointmentDto } from './dto/create-book.dto';

@Injectable()
export class AppointmentService {
  constructor(private prisma: PrismaService) {}

  async createAppointment(dto: CreateAppointmentDto) {
    console.log('DTO VALUES:', dto);
    // 1. Combine the "YYYY-MM-DD" date and "HH:MM" time directly
    const startDateTimeISO = `${dto.date}T${dto.startTime}`;

    // 2. Create the Date object
    const datetimeStart = new Date(startDateTimeISO);

    // 3. !! ADD THIS VALIDATION !!
    // Check if the date is invalid. This happens if startTime is "" or "invalid"
    if (isNaN(datetimeStart.getTime())) {
      throw new BadRequestException(
        `Invalid date/time. Check format: date must be 'YYYY-MM-DD' and startTime 'HH:MM'. Received: ${startDateTimeISO}`,
      );
    }

    // 4. Calculate the end time (assuming dto.duration is in minutes)
    const datetimeEnd = new Date(
      datetimeStart.getTime() + dto.duration * 60000,
    );

    return this.prisma.appointments.create({
      data: {
        familyId: dto.familyId,
        elderId: dto.elderId,
        caregiverId: dto.caregiverId,
        datetimeStart: datetimeStart,
        datetimeEnd: datetimeEnd,
        emergency: dto.emergency || false,
        notes: dto.notes || '',
        totalPrice: dto.totalPrice || 0,
      },
    });
  }
}
