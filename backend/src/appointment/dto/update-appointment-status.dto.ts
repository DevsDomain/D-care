// backend/src/appointment/dto/update-appointment-status.dto.ts
import { IsIn, IsString } from 'class-validator';

export class UpdateAppointmentStatusDto {
  @IsString()
  @IsIn(['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED'])
  status!: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
}
