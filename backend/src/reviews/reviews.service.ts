import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async createReview(dto: CreateReviewDto) {
    return this.prisma.reviews.create({
      data: {
        appointmentId: dto.appointmentId,
        familyId: dto.familyId,
        caregiverId: dto.caregiverId,
        rating: dto.rating,
        comment: dto.comment,
      },
      include: { appointment: true, family: true, caregiver: true },
    });
  }

  async findAllReviews() {
    return this.prisma.reviews.findMany({
      include: { appointment: true, family: true, caregiver: true },
    });
  }

  async findReviewById(id: string) {
    const review = await this.prisma.reviews.findUnique({
      where: { id },
      include: { appointment: true, family: true, caregiver: true },
    });
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    return review;
  }

  async updateReview(id: string, dto: UpdateReviewDto) {
    return this.prisma.reviews.update({
      where: { id },
      data: {
        rating: dto.rating,
        comment: dto.comment,
      },
      include: { appointment: true, family: true, caregiver: true },
    });
  }

  async deleteReview(id: string) {
    return this.prisma.reviews.delete({
      where: { id },
    });
  }
}
