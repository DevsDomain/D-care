import {
  IsString,
  IsUUID,
  IsOptional,
  IsDateString,
  IsJSON,
} from 'class-validator';

export class CreateElderDto {
  @IsUUID()
  familyId: string;

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
