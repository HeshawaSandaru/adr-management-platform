import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateAdrDto {
  @ApiProperty({
    example: 'Use MongoDB',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    example: 'Need flexible schema for system',
  })
  @IsString()
  @IsNotEmpty()
  problemStatement!: string;

  @ApiProperty({
    example: 'Adopt MongoDB as database',
  })
  @IsString()
  @IsNotEmpty()
  proposedSolution!: string;

  @ApiProperty({
    example: 'Heshawa',
  })
  @IsString()
  @IsNotEmpty()
  author!: string;

  @ApiPropertyOptional({
    example: ['PostgreSQL', 'MySQL'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  alternatives?: string[];

  @ApiPropertyOptional({
    example: ['database', 'backend'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  expectedBenefits?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  actualBenefits?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lessonsLearned?: string;

  @ApiPropertyOptional({
    example: [],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dependencies?: string[];
}