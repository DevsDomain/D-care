import { IsJSON, IsInt, IsString, IsOptional } from 'class-validator';

export class UpdateIvcfResponseDto {
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
