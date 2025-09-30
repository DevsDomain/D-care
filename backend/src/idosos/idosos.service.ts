import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateElderDto } from './dto/create-elder.dto';
import { UpdateElderDto } from './dto/update-elder.dto';

@Injectable()
export class IdososService {
  constructor(private prisma: PrismaService) {}

  async createElder(dto: CreateElderDto) {
    return this.prisma.elders.create({
      data: {
        familyId: dto.familyId,
        name: dto.name,
        birthdate: dto.birthdate ? new Date(dto.birthdate) : undefined,
        medicalConditions: dto.conditions
          ? JSON.stringify(dto.conditions)
          : undefined,
        medications: dto.medications
          ? JSON.stringify(dto.medications)
          : undefined,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        zipCode: dto.zipCode,
      },
    });
  }

  async findAllElders() {
    return this.prisma.elders.findMany({
      include: { family: true, ivcfResponses: true, appointments: true },
    });
  }

  async findElderById(id: string) {
    const elder = await this.prisma.elders.findUnique({
      where: { id },
      include: { family: true, ivcfResponses: true, appointments: true },
    });
    if (!elder) {
      throw new NotFoundException(`Elder with ID ${id} not found`);
    }
    return elder;
  }

  async updateElder(id: string, dto: UpdateElderDto) {
    return this.prisma.elders.update({
      where: { id },
      data: {
        name: dto.name,
        birthdate: dto.birthdate ? new Date(dto.birthdate) : undefined,
        medicalConditions: dto.medicalConditions
          ? (JSON.parse(dto.medicalConditions) as string[])
          : undefined,
        medications: dto.medications
          ? (JSON.parse(dto.medications) as string[])
          : undefined,
      },
    });
  }

  async deleteElder(id: string) {
    return this.prisma.elders.delete({
      where: { id },
    });
  }
}
