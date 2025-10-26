import { IsBoolean, IsNumber, IsOptional, IsPostalCode } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchCaregiversDto {
  @IsOptional()
  @IsPostalCode('BR')
  zipCode?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxDistance?: number; // metros

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  availableForEmergency?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minRating?: number;
}
