import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateIvcfResponseDto } from './dto/create-ivcf-response.dto';
import { UpdateIvcfResponseDto } from './dto/update-ivcf-response.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class IvcfService {
  constructor(private prisma: PrismaService) {}

  async createIvcfResponse(dto: CreateIvcfResponseDto) {
    return this.prisma.iVCF20Responses.create({
      data: {
        elderId: dto.elderId,
        answers: dto.answers
          ? (JSON.parse(dto.answers) as Prisma.InputJsonValue[])
          : undefined,
        score: dto.score,
        result: dto.result,
      },
      include: { elder: true },
    });
  }

  async findAllIvcfResponses() {
    return this.prisma.iVCF20Responses.findMany({
      include: { elder: true },
    });
  }

  async findIvcfResponseById(id: string) {
    const response = await this.prisma.iVCF20Responses.findUnique({
      where: { id },
      include: { elder: true },
    });
    if (!response) {
      throw new NotFoundException(`IVCF Response with ID ${id} not found`);
    }
    return response;
  }

  async updateIvcfResponse(id: string, dto: UpdateIvcfResponseDto) {
    return this.prisma.iVCF20Responses.update({
      where: { id },
      data: {
        answers: dto.answers
          ? (JSON.parse(dto.answers) as Record<string, unknown>[])
          : undefined,
        score: dto.score,
        result: dto.result,
      },
      include: { elder: true },
    });
  }

  async deleteIvcfResponse(id: string) {
    return this.prisma.iVCF20Responses.delete({
      where: { id },
    });
  }
}
