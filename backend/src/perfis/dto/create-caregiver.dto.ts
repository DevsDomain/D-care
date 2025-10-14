import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCareGiverDto {
  @IsOptional()
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  crm_coren?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsString()
  @IsOptional()
  avatarPath?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  zipCode?: string;
}
