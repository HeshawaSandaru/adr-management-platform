import {
  IsString,
  IsOptional,
  IsArray,
  IsIn,
} from 'class-validator';

export class CreateAdrDto {
  @IsString()
  title!: string;

  @IsString()
  problemStatement!: string;

  @IsString()
  proposedSolution!: string;

  @IsOptional()
  @IsIn(['Draft', 'Proposed', 'Accepted', 'Deprecated', 'Archived'])
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