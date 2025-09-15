import { IsUUID, IsInt, IsString, IsOptional } from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  appointmentId: string;

  @IsUUID()
  @IsOptional()
  familyId?: string;

  @IsUUID()
  @IsOptional()
  caregiverId?: string;

  @IsInt()
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;
}
