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

      // 4️⃣ Query principal
      const caregiversRaw = await this.prisma.$queryRawUnsafe<any[]>(`
        SELECT 
          c.id,
          c.user_id AS "userId",
          up.name AS caregiver_name,
          c.bio,
          c.crm_coren AS "crmCoren",
          c.validated,
          c.availability,
          c.emergency,
          ST_AsText(c.location) AS location_wkt,
          COALESCE(AVG(r.rating), 0) AS rating,
          COUNT(r.id) AS review_count,
          ST_Distance(
            c.location, 
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
          ) AS distance_meters
        FROM caregiver.caregivers c
        JOIN auth.user_profiles up ON up.user_id = c.user_id
        LEFT JOIN reviews.reviews r ON r.caregiver_id = c.id
        WHERE c.location IS NOT NULL
          AND ST_DWithin(
            c.location, 
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, 
            ${maxDistance}
          )
          ${whereClause}
        GROUP BY c.id, up.name
        ORDER BY distance_meters ASC;
      `);

      console.log(
        `🏁 Total de cuidadores encontrados: ${caregiversRaw.length}`,
      );

      // 5️⃣ Formatar resposta
      return caregiversRaw.map((c) => ({
        id: c.id,
        userId: c.userId,
        name: c.caregiver_name,
        photo: `https://randomuser.me/api/portraits/${
          Math.random() > 0.5 ? 'women' : 'men'
        }/${Math.floor(Math.random() * 90) + 1}.jpg`,
        verified: c.validated,
        crmCorem: c.crmCoren || 'N/A',
        rating: Number(c.rating),
        reviewCount: Number(c.review_count),
        distanceKm: parseFloat((Number(c.distance_meters) / 1000).toFixed(2)),
        availability: c.availability,
        emergency: c.emergency,
        skills: ['Elderly Care', 'Medication Management'],
        experience: `${Math.floor(Math.random() * 10) + 1}+ years`,
        priceRange: 'R$ 30-40/hora',
        bio: c.bio,
        phone: '+55 12 99999-0000',
        languages: ['Portuguese'],
        specializations: ['Elderly Care', 'Rehabilitation'],
        verificationBadges: ['Background Check', 'First Aid Certified'],
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
