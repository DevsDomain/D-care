import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateCareGiverDto } from './dto/create-caregiver.dto';
import { getCoordinatesFromZipCode } from '../common/helper/getCoordinatesFromCep';
import { StorageService } from '../storage/storage.service';
import safeParseArray from '../common/pipes/safe-parse-array.pipe';
import { SearchCaregiversDto } from './dto/search-caregivers.dto';
import { CaregiverRaw } from 'src/common/types/caregiver-input-type';

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

  async toggleCaregiverAvailabilityService(id: string, available: boolean) {
    const caregiver = await this.prisma.caregivers.findUnique({
      where: { id },
    });

    if (!caregiver) {
      throw new NotFoundException(`Caregiver with ID ${id} not found`);
    }

    return this.prisma.caregivers.update({
      where: { id },
      data: { availability: available },
    });
  }

  async toggleCaregiverEmergencyAvailabilityService(
    id: string,
    available: boolean,
  ) {
    const caregiver = await this.prisma.caregivers.findUnique({
      where: { id },
    });

    if (!caregiver) {
      throw new NotFoundException(`Caregiver with ID ${id} not found`);
    }

    return this.prisma.caregivers.update({
      where: { id },
      data: { emergency: available },
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

    console.log('ID DO CAREGIVER', id);
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
      console.log('🔍 [DEBUG] Iniciando busca de cuidadores...');
      console.log('Usuário:', userId);
      console.log('Query recebida:', query);

      // 1️⃣ Buscar CEP da família
      const family = await this.prisma.families.findFirst({
        where: { userId },
        select: { zipCode: true },
      });

      const userZip = query.zipCode ?? family?.zipCode;
      if (!userZip) throw new Error('CEP do usuário não encontrado.');

      // 2️⃣ Buscar coordenadas
      const geoData = await getCoordinatesFromZipCode(userZip);
      if (!geoData?.lat || !geoData?.lng)
        throw new Error(`Coordenadas não encontradas para o CEP ${userZip}`);

      const lat = parseFloat(geoData.lat);
      const lng = parseFloat(geoData.lng);
      const maxDistance = query.maxDistance ?? 10000; // default 10km

      // 3️⃣ Filtros SQL dinâmicos
      let whereClause = '';

      if (query.minRating) {
        whereClause += ` AND c.id IN (
          SELECT caregiver_id FROM reviews.reviews
          GROUP BY caregiver_id
          HAVING AVG(rating) >= ${query.minRating}
        )`;
      }

      if (query.availableForEmergency) {
        whereClause += ` AND c.emergency = true`;
      }

      if (query.availableForEmergency === false) {
        whereClause += ` AND c.emergency = false`;
      }

      if (query.specialization) {
        whereClause += ` AND (
          LOWER(c.bio) LIKE LOWER('%${query.specialization}%')
          OR c.specializations::text ILIKE '%${query.specialization}%'
        )`;
      }

      // 🆕 filtro de disponibilidade geral
      if (query.available === true) {
        whereClause += ` AND c.availability = true`;
      }

      if (query.available === false) {
        whereClause += ` AND c.availability = false`;
      }

      console.log('🔍 [DEBUG] Filtros SQL aplicados:', whereClause);

      // 4️⃣ Query principal
      const caregiversRaw = await this.prisma.$queryRawUnsafe<CaregiverRaw[]>(`
      select
	c.id,
	c.user_id as "userId",
	up.name,
	c.crm_coren,
	c."avatarPath",
	c.validated,
	c.bio,
	c.address,
	c.city,
	c.state,
	c.zip_code,
	c.experience,
	c.price_range,
	c.availability,
	c.emergency,
	c.skills,
	c.languages,
	c.specializations,
  c."verificationBadges",
	ST_Distance(
            c.location,
	ST_SetSRID(ST_MakePoint(${lng},
	${lat}),
	4326)::geography
          ) as distance_meters,
	ST_AsText(c.location) as location_wkt,
	coalesce(AVG(r.rating),
	0) as rating,
	up.name as caregiver_name
from
	caregiver.caregivers c
join auth.user_profiles up on
	up.user_id = c.user_id
left join reviews.reviews r on
	r.caregiver_id = c.id
where
	c.location is not null
	and ST_DWithin(
            c.location,
	ST_SetSRID(ST_MakePoint(${lng},
	${lat}),
	4326)::geography,
	${maxDistance}
          )
          ${whereClause}
group by
	c.id,
	up.name
order by
	distance_meters asc
      `);

      // 5️⃣ Formatar resposta
      return caregiversRaw.map((c) => ({
        ...c,
        distanceKm: parseFloat((Number(c.distance_meters) / 1000).toFixed(2)),
      }));
    } catch (error) {
      console.error('❌ Erro ao buscar cuidadores:', error);
      throw new Error(
        error instanceof Error
          ? `Erro ao buscar cuidadores: ${error.message}`
          : 'Erro desconhecido ao buscar cuidadores',
      );
    }
  }
}
