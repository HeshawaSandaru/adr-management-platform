import {
  IsString,
  IsOptional,
  IsArray,
  IsIn,
  IsEnum,
} from 'class-validator';


import { AdrStatus } from '../../common/enums/adr-status.enum';

export class CreateAdrDto {
  @IsString()
  title!: string;

  @IsString()
  problemStatement!: string;

  @IsString()
  proposedSolution!: string;

  @IsOptional()
  @IsEnum(AdrStatus)
  status?: AdrStatus;

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