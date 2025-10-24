import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateCareGiverDto } from './dto/create-caregiver.dto';
import { getCoordinatesFromZipCode } from '../common/helper/getCoordinatesFromCep';
import { StorageService } from '../storage/storage.service';
import safeParseArray from '../common/pipes/safe-parse-array.pipe';

@Injectable()
export class PerfisService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

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

  async createCaregiver(dto: CreateCareGiverDto, userId: string) {
    return this.prisma.caregivers.create({
      data: {
        userId,
        crmCoren: dto.crm_coren,
        bio: dto.bio,
        validated: false,
      },
    });
  }

  async updateCaregiver(
    id: string,
    dto: CreateCareGiverDto,
    file?: Express.Multer.File,
  ) {
    let avatarUrl: string | null = null;

    if (file) {
      avatarUrl = await this.storageService.uploadFile(
        file,
        'dcare/caregivers',
      );
    }

    const geoData = await getCoordinatesFromZipCode(dto.zipCode);

    const updateCare = await this.prisma.caregivers.update({
      where: { id },
      data: {
        crmCoren: dto.crm_coren,
        bio: dto.bio,
        avatarPath: avatarUrl ? avatarUrl : undefined,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        zipCode: dto.zipCode,
        specializations: safeParseArray(dto.specializations),
        skills: safeParseArray(dto.skills),
        priceRange: dto.priceRange,
        experience: dto.experience,
      },
    });

    if (geoData?.lat && geoData?.lng) {
      const lat = parseFloat(geoData.lat);
      const lgn = parseFloat(geoData.lng);

      await this.prisma.$executeRaw`
      UPDATE caredb.caregiver.caregivers 
      SET location = ST_SetSRID(ST_MakePoint(${lgn}, ${lat}), 4326)
      WHERE id = ${updateCare.id}::uuid`;
    }
    return updateCare;
  }

  async findAllProfiles() {
    return this.prisma.userProfiles.findMany({
      include: { user: true },
    });
  }

  async findProfileById(id: string) {
    const profile = await this.prisma.users.findUnique({
      where: { id },
      include: { userProfile: true, caregiver: true, family: true },
      omit: { passwordHash: true },
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
