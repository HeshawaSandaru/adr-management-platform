import {
  IsString,
  IsOptional,
  IsArray,
  IsNotEmpty,
} from 'class-validator';

export class AlternativeAnalysisDto {
  @IsString()
  @IsNotEmpty()
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