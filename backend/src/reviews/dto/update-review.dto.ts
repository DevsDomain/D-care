import { IsInt, IsString, IsOptional } from 'class-validator';

export class UpdateReviewDto {
  @IsInt()
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  comment?: string;
}
