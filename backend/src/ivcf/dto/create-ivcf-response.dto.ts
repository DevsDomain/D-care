import { IsUUID, IsJSON, IsInt, IsString, IsOptional } from 'class-validator';

export class CreateIvcfResponseDto {
  @IsUUID()
  elderId: string;

  @IsJSON()
  @IsOptional()
  answers?: string;

  @IsInt()
  @IsOptional()
  score?: number;

  @IsString()
  @IsOptional()
  result?: string;
}
