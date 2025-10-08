import { Transform } from 'class-transformer';
import {
  IsString,
  IsUUID,
  IsOptional,
  IsDateString,
  IsArray,
} from 'class-validator';
import safeParseArray from '../../common/pipes/safe-parse-array.pipe';

export class CreateElderDto {
  @IsUUID()
  @IsOptional()
  familyId: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  avatarPath?: string;

  @IsDateString()
  @IsOptional()
  birthdate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => safeParseArray(value))
  conditions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => safeParseArray(value))
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
