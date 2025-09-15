import { IsUUID, IsEnum, IsOptional } from 'class-validator';
import { RequestStatus } from '../../../generated/prisma';

export class CreateAppointmentRequestDto {
  @IsUUID()
  appointmentId: string;

  @IsUUID()
  caregiverId: string;

  @IsEnum(RequestStatus)
  @IsOptional()
  status?: RequestStatus;
}
