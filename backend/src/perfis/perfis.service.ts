import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateCareGiverDto } from './dto/create-caregiver.dto';
import { getCoordinatesFromZipCode } from '../common/helper/getCoordinatesFromCep';
import { StorageService } from '../storage/storage.service';
import safeParseArray from '../common/pipes/safe-parse-array.pipe';
import { SearchCaregiversDto } from './dto/search-caregivers.dto';

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

  async searchCaregivers(userId: string, query: SearchCaregiversDto) {
    try {
      // Busca o endereço do familiar pelo userId
      const family = await this.prisma.families.findFirst({
        where: { userId },
        select: { zipCode: true },
      });

      const userZip =
        query.zipCode ?? (family?.zipCode ? family.zipCode : undefined);

      if (!userZip) {
        throw new Error(
          'Nenhum CEP foi informado e não foi possível localizar o CEP do usuário familiar.',
        );
      }

      const geoData = await getCoordinatesFromZipCode(userZip);

      if (!geoData?.lat || !geoData?.lng) {
        throw new Error(
          `Não foi possível obter coordenadas para o CEP ${userZip}`,
        );
      }

      const lat = parseFloat(geoData.lat);
      const lng = parseFloat(geoData.lng);
      const maxDistance = query.maxDistance ?? 10000; // 10km padrão

      // Monta filtros opcionais
      const filters: string[] = [];
      if (query.isVerified) filters.push(`c.validated = true`);
      if (query.minRating) filters.push(`c.rating >= ${query.minRating}`);
      if (query.availableForEmergency) filters.push(`c.emergency = true`);
      const whereClause = filters.length ? `AND ${filters.join(' AND ')}` : '';

      // Consulta cuidadores próximos com PostGIS
      const caregivers = await this.prisma.$queryRawUnsafe(`
        SELECT 
          c.id,
          c.bio,
          c.crm_coren AS "crmCoren",
          c.validated,
          ST_AsText(c.location) AS location_wkt,
          ST_Distance(
            c.location, 
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
          ) AS distance_meters
        FROM "caregiver"."caregivers" c
        WHERE c.location IS NOT NULL
          AND ST_DWithin(
            c.location, 
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, 
            ${maxDistance}
          )
          ${whereClause}
        ORDER BY distance_meters ASC;
      `);

      return caregivers;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Erro ao buscar cuidadores: ${error.message}`);
      }
      throw new Error('Erro desconhecido ao buscar cuidadores');
    }
  }
}
