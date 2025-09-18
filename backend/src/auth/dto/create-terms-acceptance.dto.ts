import { IsUUID } from 'class-validator';

export class CreateTermsAcceptanceDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  termId: string;
}
