import { IsString, IsOptional } from 'class-validator';

export class UpdateLegalTermsDto {
  @IsString()
  @IsOptional()
  version?: string;

  @IsString()
  @IsOptional()
  content?: string;
}
