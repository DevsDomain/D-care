import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { IvcfResultDto } from './dto/ivcf20.dto';

@Injectable()
export class Ivcf20Service {
  constructor(private prisma: PrismaService) {}

  async createIVCF20(dto: IvcfResultDto) {
    console.log('DTO VALUES IVCF20:', dto);

    return this.prisma.iVCF20Responses.create({
      data: {
        elderId: dto.elderId,
        score: dto.score,
        result: dto.result,
        answers: dto.answers,
      },
    });
  }

  async getIVCF20ByElderId(elderId: string) {
    return this.prisma.iVCF20Responses.findFirst({
      where: { elderId },
      orderBy: { updatedAt: 'desc' },
    });
  }
}
