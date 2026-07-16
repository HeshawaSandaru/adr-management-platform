import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsString,
  Max,
  IsInt,
  Min,
  IsDateString,
} from "class-validator";
import { AdrStatus } from "../../common/enums/adr-status.enum";
import { Type } from 'class-transformer';

export class AdrQueryDto {
  // adr-query.dto.ts
  @IsOptional()
  @IsString()
  search?: string;

   @ApiPropertyOptional({ 
    enum: AdrStatus,
    description: 'Filter by ADR status',
    example: AdrStatus.Proposed
  })
  @IsOptional()
  @IsEnum(AdrStatus)
  status?: AdrStatus;

  @ApiPropertyOptional({
    description: 'Filter by reviewer name (partial match)',
    example: 'Jane Smith'
  })
  @IsOptional()
  @IsString()
  reviewerName?: string;

  @ApiPropertyOptional({
    description: 'Filter by tags (comma-separated)',
    example: 'architecture,microservices'
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

   @ApiPropertyOptional({
    description: 'Filter by title (partial match)',
    example: 'Migrate to Microservices'
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by creation date (from)',
    example: '2024-01-01',
    format: 'date'
  }) 

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    default: 1
  })
  @IsOptional()
  @Type(() => Number) // transforms query string "1" → number 1
  @IsInt()
  @Min(1)
  page?: number = 1;

   @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20
  })
  @IsOptional()
  @Type(() => Number) // transforms query string "20" → number 20
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
