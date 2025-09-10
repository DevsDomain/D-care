import { IsString, IsOptional } from 'class-validator';

export class UpdateFaqQueryDto {
  @IsString()
  @IsOptional()
  question?: string;

  @IsString()
  @IsOptional()
  answer?: string;
}
