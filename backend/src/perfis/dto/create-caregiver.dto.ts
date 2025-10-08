import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCareGiverDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  crm_coren?: string;

  @IsOptional()
  @IsString()
  bio?: string;
}
