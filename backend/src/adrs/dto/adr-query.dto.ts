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

  @IsOptional()
  @IsEnum(AdrStatus)
  status?: AdrStatus;

  @IsOptional()
  @IsString()
  reviewerName?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @Type(() => Number) // transforms query string "1" → number 1
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number) // transforms query string "20" → number 20
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
