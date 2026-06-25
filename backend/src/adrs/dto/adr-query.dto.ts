import {
  IsOptional,
  IsEnum,
  IsString,
  Max,
  IsInt,
  Min,
  IsMongoId,
} from "class-validator";
import { AdrStatus } from "../../common/enums/adr-status.enum";
import { Type } from 'class-transformer';

export class AdrQueryDto {
  @IsOptional()
  @IsEnum(AdrStatus)
  status?: AdrStatus;

  @IsOptional()
  @IsMongoId()
  authorId?: string;

  @IsOptional()
  @IsString()
  tags?: string;

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
