import {
  IsString,
  IsOptional,
  IsArray,
} from 'class-validator';

export class AlternativeAnalysisDto {
  @IsString()
  alternative!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pros?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cons?: string[];
}