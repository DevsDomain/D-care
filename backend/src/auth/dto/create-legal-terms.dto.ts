import { IsString } from 'class-validator';

export class CreateLegalTermsDto {
  @IsString()
  version: string;

  @IsString()
  content: string;
}
