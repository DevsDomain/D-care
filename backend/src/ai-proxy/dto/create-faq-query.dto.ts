import { IsUUID, IsString, IsOptional } from 'class-validator';

export class CreateFaqQueryDto {
  @IsUUID()
  userId: string;

  @IsString()
  question: string;

  @IsString()
  @IsOptional()
  answer?: string;
}
