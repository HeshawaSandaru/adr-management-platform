import { IsOptional, IsEnum, IsString } from 'class-validator';
import { AdrStatus } from '../../common/enums/adr-status.enum';

export class AdrQueryDto {
  @IsOptional()
  @IsEnum(AdrStatus)
  status?: AdrStatus;

  @IsOptional()
  @IsString()
  authorId?: string;

  @IsOptional()
  @IsString()
  tags?: string;
}