import {
  IsString,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateAdrDto {
  @IsString()
  title!: string;

  @IsString()
  problemStatement!: string;

  @IsString()
  proposedSolution!: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsArray()
  alternatives?: string[];

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