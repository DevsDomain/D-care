import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class PerfisService {
  constructor(private prisma: PrismaService) {}

  async createProfile(dto: CreateProfileDto, userId: string) {
    return this.prisma.userProfiles.create({
      data: {
        userId,
        name: dto.name,
        phone: dto.phone,
        birthdate: dto.birthdate ? new Date(dto.birthdate) : undefined,
        gender: dto.gender,
      },
    });
  }

  async findAllProfiles() {
    return this.prisma.userProfiles.findMany({
      include: { user: true },
    });
  }

  async findProfileById(id: string) {
    const profile = await this.prisma.userProfiles.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }
    return profile;
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    return this.prisma.userProfiles.update({
      where: { id },
      data: {
        name: dto.name,
        phone: dto.phone,
        birthdate: dto.birthdate ? new Date(dto.birthdate) : undefined,
        gender: dto.gender,
      },
    });
  }

  async deleteProfile(id: string) {
    return this.prisma.userProfiles.delete({
      where: { id },
    });
  }
}
