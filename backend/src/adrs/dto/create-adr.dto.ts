import { IsString, IsOptional, IsArray, ValidateNested} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { AlternativeAnalysisDto } from './alternative-analysis.dto';

export class CreateAdrDto {
   @ApiProperty({ 
    description: 'Title of the ADR',
    example: 'Migrate from Monolith to Microservices',
    maxLength: 255
  })
  @IsString()
  title!: string;

  @ApiProperty({
    description: 'Problem statement describing why this decision is needed',
    example: 'Current monolith is becoming too large to maintain effectively'
  })
  @IsString()
  problemStatement!: string;

  @ApiProperty({
    description: 'Proposed solution to the problem',
    example: 'Gradually split into microservices using domain-driven design'
  })
  @IsString()
  proposedSolution!: string;

  @ApiPropertyOptional({
    description: 'Array of alternative solutions analyzed',
    type: [AlternativeAnalysisDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AlternativeAnalysisDto)
  alternativeAnalysis?: AlternativeAnalysisDto[];

  @ApiPropertyOptional({
    description: 'Tags for categorizing the ADR',
    example: ['architecture', 'microservices', 'migration'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Expected benefits of implementing this decision',
    example: 'Improved scalability and team autonomy'
  })
  @IsOptional()
  @IsString()
  expectedBenefits?: string;

   @ApiPropertyOptional({
    description: 'Actual benefits realized after implementation',
    example: 'Deployment time reduced by 50%'
  })
  @IsOptional()
  @IsString()
  actualBenefits?: string;

  @ApiPropertyOptional({
    description: 'Lessons learned from this decision',
    example: 'Need better monitoring in distributed systems'
  })
  @IsOptional()
  @IsString()
  lessonsLearned?: string;

  @ApiPropertyOptional({
    description: 'IDs of dependent ADRs',
    example: ['507f1f77bcf86cd799439011'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  dependencies?: string[];
}
