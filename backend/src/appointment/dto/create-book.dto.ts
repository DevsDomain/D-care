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

  // 'YYYY-MM-DD'
  @IsISO8601({ strict: true })
  date: string;

  // 'HH:MM'
  @IsString()
  startTime: string;

  // Duração em MINUTOS
  @IsNumber()
  duration: number;

  @IsString()
  @IsOptional()
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

  @IsBoolean()
  @IsOptional()
  emergency?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  totalPrice: number;
}
