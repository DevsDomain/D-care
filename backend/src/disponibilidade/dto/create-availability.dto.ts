// backend/src/disponibilidade/dto/create-availability.dto.ts
import {
  IsString,
  Matches,
  IsBoolean,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { AvailabilityStatus } from '../../../generated/prisma';

export class CreateAvailabilityDto {
  @IsDateString()
  date: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}:\d{2}$/, {
    message: 'timeStart must be in HH:mm:ss format',
  })
  timeStart: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}:\d{2}$/, {
    message: 'timeEnd must be in HH:mm:ss format',
  })
  timeEnd: string;

  @IsBoolean()
  emergency: boolean;

  @IsEnum(AvailabilityStatus)
  status: AvailabilityStatus;
}
