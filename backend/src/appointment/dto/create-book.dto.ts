import {
  IsString,
  IsUUID,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsISO8601,
} from 'class-validator';

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

  // Expect a date string like 'YYYY-MM-DD'
  @IsISO8601({ strict: true })
  date: string;

  // Expect a time string like 'HH:MM'
  @IsString() // You can use @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/) for stricter validation
  startTime: string;

  @IsNumber()
  duration: number; // Assuming this is in minutes

  @IsString()
  @IsOptional()
  status?: 'PENDING';

  @IsBoolean()
  @IsOptional()
  emergency?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  totalPrice: number;
}
