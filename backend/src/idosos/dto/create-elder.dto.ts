import {
  IsString,
  IsUUID,
  IsOptional,
  IsDateString,
  IsArray,
} from 'class-validator';

export class CreateElderDto {
  @IsUUID()
  @IsOptional()
  familyId: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsDateString()
  @IsOptional()
  birthdate?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  conditions?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  medications?: string[];

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
