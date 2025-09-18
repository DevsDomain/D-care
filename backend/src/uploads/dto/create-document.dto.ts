import { IsUUID, IsString, IsOptional } from 'class-validator';

export class CreateDocumentDto {
  @IsUUID()
  caregiverId: string;

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsString()
  @IsOptional()
  type?: string;
}
