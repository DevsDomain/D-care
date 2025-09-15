import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // TODO: Add JwtAuthGuard
  @Post()
  async create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.createReview(createReviewDto);
  }

  @Get()
  async findAll() {
    return this.reviewsService.findAllReviews();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.reviewsService.findReviewById(id);
  }

  // TODO: Add JwtAuthGuard
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.updateReview(id, updateReviewDto);
  }

  // TODO: Add JwtAuthGuard
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.reviewsService.deleteReview(id);
  }
}
