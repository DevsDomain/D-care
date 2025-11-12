import {
  IsString,
  IsUUID,
  IsOptional,
  IsNumber,
  IsJSON,
} from 'class-validator';

export class IvcfResultDto {
  @IsUUID()
  elderId: string;

  @IsJSON()
  answers: string;

  @IsString()
  @IsOptional()
  result?: string;

  @IsNumber()
  score: number;
}
