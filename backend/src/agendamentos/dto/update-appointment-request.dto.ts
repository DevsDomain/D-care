import { IsEnum, IsOptional } from 'class-validator';
import { RequestStatus } from '../../../generated/prisma';

export class UpdateAppointmentRequestDto {
  @IsEnum(RequestStatus)
  @IsOptional()
  status?: RequestStatus;
}
