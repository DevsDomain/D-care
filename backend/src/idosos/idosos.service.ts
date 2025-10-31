// src/idosos/idosos.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateElderDto } from './dto/create-elder.dto';
import { UpdateElderDto } from './dto/update-elder.dto';
import { StorageService } from '../storage/storage.service';
import { getCoordinatesFromZipCode } from '../common/helper/getCoordinatesFromCep';

function toArrayAny(val: any): string[] | undefined {
  if (val == null) return undefined;
  if (Array.isArray(val)) return val as string[];
  if (typeof val === 'string') {
    const s = val.trim();
    if (!s) return [];
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) return parsed as string[];
    } catch {
      // não era JSON; tenta CSV
    }
    return s.split(/[;,]/).map(x => x.trim()).filter(Boolean);
  }
  return [String(val)];
}

@Injectable()
export class IdososService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  async createElder(dto: CreateElderDto, file?: Express.Multer.File) {
    let avatarUrl: string | null = null;
    if (file) {
      avatarUrl = await this.storageService.uploadFile(file, 'dcare/elders');
    }

    const geoData = await getCoordinatesFromZipCode(dto.zipCode);

    const newElder = await this.prisma.elders.create({
      data: {
        familyId: dto.familyId,
        name: dto.name,
        birthdate: dto.birthdate ? new Date(dto.birthdate) : undefined,
        medicalConditions: toArrayAny(dto.conditions),
        medications: toArrayAny(dto.medications),
        address: dto.address,
        city: dto.city,
        state: dto.state,
        zipCode: dto.zipCode,
        avatarPath: avatarUrl,
      },
    });

    if (geoData?.lat && geoData?.lng) {
      const lat = parseFloat(geoData.lat);
      const lgn = parseFloat(geoData.lng);
      await this.prisma.$executeRaw`
        UPDATE caredb."family".elders
        SET location = ST_SetSRID(ST_MakePoint(${lgn}, ${lat}), 4326)
        WHERE id = ${newElder.id}::uuid`;
    }

    return newElder;
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
    if (!elder) throw new NotFoundException(`Elder with ID ${id} not found`);
    return elder;
  }

  async updateElder(id: string, dto: UpdateElderDto, file?: Express.Multer.File) {
    // upload opcional
    let avatarUrl: string | undefined;
    if (file) {
      avatarUrl = await this.storageService.uploadFile(file, 'dcare/elders');
    }

    // normalizações
    const medicalConditions = toArrayAny(dto.medicalConditions);
    const medications = toArrayAny(dto.medications);

    // update único
    const updated = await this.prisma.elders.update({
      where: { id },
      data: {
        name: dto.name ?? undefined,
        birthdate: dto.birthdate ? new Date(dto.birthdate) : undefined,
        medicalConditions,
        medications,
        address: dto.address ?? undefined,
        city: dto.city ?? undefined,
        state: dto.state ?? undefined,
        zipCode: dto.zipCode ?? undefined,
        ...(avatarUrl ? { avatarPath: avatarUrl } : {}),
      },
    });

    // recalcula coordenadas se trocou CEP
    if (dto.zipCode) {
      const geoData = await getCoordinatesFromZipCode(dto.zipCode);
      if (geoData?.lat && geoData?.lng) {
        const lat = parseFloat(geoData.lat);
        const lgn = parseFloat(geoData.lng);
        await this.prisma.$executeRaw`
          UPDATE caredb."family".elders
          SET location = ST_SetSRID(ST_MakePoint(${lgn}, ${lat}), 4326)
          WHERE id = ${id}::uuid`;
      }
    }

    return updated;
  }

  async deleteElder(id: string) {
    return this.prisma.elders.delete({ where: { id } });
  }
}
