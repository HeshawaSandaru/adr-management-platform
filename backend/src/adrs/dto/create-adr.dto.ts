import { IsString, IsOptional, IsArray, ValidateNested} from "class-validator";

import { Type } from 'class-transformer';
import { AlternativeAnalysisDto } from './alternative-analysis.dto';

export class CreateAdrDto {
  @IsString()
  title!: string;

  @IsString()
  problemStatement!: string;

  @IsString()
  proposedSolution!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AlternativeAnalysisDto)
  alternativeAnalysis?: AlternativeAnalysisDto[];

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  expectedBenefits?: string;

  @IsOptional()
  @IsString()
  actualBenefits?: string;

  @IsOptional()
  @IsString()
  lessonsLearned?: string;

  @IsOptional()
  @IsArray()
  dependencies?: string[];
}
