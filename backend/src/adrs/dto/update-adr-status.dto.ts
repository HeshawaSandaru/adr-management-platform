import { IsEnum } from 'class-validator';
import { AdrStatus } from '../../common/enums/adr-status.enum';

export class UpdateAdrStatusDto {
  @IsEnum(AdrStatus)
  status!: AdrStatus;
}