import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SearchCaregiversDto {
  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxDistance?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minRating?: number;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  availableForEmergency?: boolean;
}
