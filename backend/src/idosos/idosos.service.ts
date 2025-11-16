// src/idosos/idosos.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateElderDto } from './dto/create-elder.dto';
import { UpdateElderDto } from './dto/update-elder.dto';
import { StorageService } from '../storage/storage.service';
import { getCoordinatesFromZipCode } from '../common/helper/getCoordinatesFromCep';
import { AppointmentStatus } from '@prisma/client';

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
    return s
      .split(/[;,]/)
      .map((x) => x.trim())
      .filter(Boolean);
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

  async findAllByFamily(familyId: string) {
    console.log('FAMILY ID RECEBIDO:', familyId);
    return this.prisma.elders.findMany({
      where: { familyId },
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

  async updateElder(
    id: string,
    dto: UpdateElderDto,
    file?: Express.Multer.File,
  ) {
    // upload opcional (nova foto)
    let avatarUrl: string | undefined;
    if (file) {
      avatarUrl = await this.storageService.uploadFile(file, 'dcare/elders');
    }

    // flag para remover avatar (vem do DTO)
    const shouldRemoveAvatar =
      dto.removeAvatar === true ||
      (dto.removeAvatar as any) === 'true' ||
      (dto.removeAvatar as any) === '1';

    // normalizações
    const medicalConditions = toArrayAny(dto.medicalConditions);
    const medications = toArrayAny(dto.medications);

    // monta o objeto de update
    const data: any = {
      name: dto.name ?? undefined,
      birthdate: dto.birthdate ? new Date(dto.birthdate) : undefined,
      medicalConditions,
      medications,
      address: dto.address ?? undefined,
      city: dto.city ?? undefined,
      state: dto.state ?? undefined,
      zipCode: dto.zipCode ?? undefined,
    };

    // se veio uma nova foto, atualiza o avatarPath
    if (avatarUrl) {
      data.avatarPath = avatarUrl;
    } else if (shouldRemoveAvatar) {
      // se não veio foto nova, mas mandou remover, zera o avatarPath
      data.avatarPath = null;
    }

    const updated = await this.prisma.elders.update({
      where: { id },
      data,
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
    return this.prisma.$transaction(async (tx) => {
      // (opcional) bloqueia exclusão se houver agendamento já aceito/ativo
      const hasActive = await tx.appointments.count({
        where: {
          elderId: id,
          status: { in: [AppointmentStatus.ACCEPTED] },
        },
      });

      if (hasActive > 0) {
        throw new BadRequestException(
          'Não é possível excluir: existem agendamentos ACEITOS para este idoso.',
        );
      }

      // 1) Cancela pedidos ainda pendentes (sem aceite) e zera o vínculo
      await tx.appointments.updateMany({
        where: {
          elderId: id,
          status: AppointmentStatus.PENDING,
        },
        data: {
          status: AppointmentStatus.CANCELLED,
          elderId: null, // evita violação de FK ao apagar o idoso
          updatedAt: new Date(),
        },
      });

      // 2) Exclui o idoso
      return tx.elders.delete({ where: { id } });
    });
  }
}
