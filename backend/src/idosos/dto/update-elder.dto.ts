// src/idosos/dto/update-elder.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class UpdateElderDto {
  @IsOptional()
  @IsString()
  name?: string;

  // aceita string ISO, mas não valida formato (evita 400 por formatação)
  @IsOptional()
  @IsString()
  birthdate?: string;

  // podem vir como array, JSON string ou CSV — o service normaliza
  @IsOptional()
  medicalConditions?: any;

  @IsOptional()
  medications?: any;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;
}
