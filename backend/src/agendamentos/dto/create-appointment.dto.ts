import {
  IsUUID,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { AppointmentStatus } from '../../../generated/prisma';

export class CreateAppointmentDto {
  @IsUUID()
  @IsOptional()
  familyId?: string;

  @IsUUID()
  @IsOptional()
  elderId?: string;

  @IsUUID()
  @IsOptional()
  caregiverId?: string;

  @IsDateString()
  datetimeStart: string;

  @IsDateString()
  datetimeEnd: string;

  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @IsBoolean()
  @IsOptional()
  emergency?: boolean;
}
