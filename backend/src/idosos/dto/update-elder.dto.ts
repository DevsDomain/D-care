import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

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

  // 👇 NOVO: flag para remover o avatar
  @IsOptional()
  @Transform(({ value }) => {
    // aceita true, 'true', '1'
    if (value === true) return true;
    if (value === 'true') return true;
    if (value === '1') return true;
    return false;
  })
  @IsBoolean()
  removeAvatar?: boolean;
}
