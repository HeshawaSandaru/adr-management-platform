import {
  IsString,
  IsOptional,
  IsArray,
  IsNotEmpty,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AlternativeAnalysisDto {
   @ApiProperty({
    description: 'Alternative solution considered',
    example: 'Use serverless architecture',
  })
  @IsString()
  @IsNotEmpty()
  alternative!: string;

  @ApiPropertyOptional({
    description: 'Advantages of this alternative',
    example: [
      'Lower infrastructure cost',
      'Automatic scaling',
    ],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pros?: string[];

  @ApiPropertyOptional({
    description: 'Disadvantages of this alternative',
    example: [
      'Vendor lock-in',
      'Cold start issues',
    ],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cons?: string[];
}