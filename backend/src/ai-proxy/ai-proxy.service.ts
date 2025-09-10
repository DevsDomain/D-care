import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateFaqQueryDto } from './dto/create-faq-query.dto';
import { UpdateFaqQueryDto } from './dto/update-faq-query.dto';

@Injectable()
export class AiProxyService {
  constructor(private prisma: PrismaService) {}

  async createFaqQuery(dto: CreateFaqQueryDto) {
    return this.prisma.fAQAIQueries.create({
      data: {
        userId: dto.userId,
        question: dto.question,
        answer: dto.answer,
      },
      include: { user: true },
    });
  }

  async findAllFaqQueries() {
    return this.prisma.fAQAIQueries.findMany({
      include: { user: true },
    });
  }

  async findFaqQueryById(id: string) {
    const query = await this.prisma.fAQAIQueries.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!query) {
      throw new NotFoundException(`FAQ Query with ID ${id} not found`);
    }
    return query;
  }

  async updateFaqQuery(id: string, dto: UpdateFaqQueryDto) {
    return this.prisma.fAQAIQueries.update({
      where: { id },
      data: {
        question: dto.question,
        answer: dto.answer,
      },
      include: { user: true },
    });
  }

  async deleteFaqQuery(id: string) {
    return this.prisma.fAQAIQueries.delete({
      where: { id },
    });
  }
}
