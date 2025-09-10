import { IsString, IsOptional, IsDateString, IsJSON } from 'class-validator';

export class UpdateElderDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsDateString()
  @IsOptional()
  birthdate?: string;

  @IsJSON()
  @IsOptional()
  medicalConditions?: string;

  @IsJSON()
  @IsOptional()
  medications?: string;
}
