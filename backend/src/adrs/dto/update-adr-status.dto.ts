import { IsEnum } from 'class-validator';
import { AdrStatus } from '../../common/enums/adr-status.enum';
import { ApiProperty } from '@nestjs/swagger';


export class UpdateAdrStatusDto {
  @ApiProperty({
    description: 'New ADR status',
    enum: AdrStatus,
    example: AdrStatus.Accepted,
  })
  @IsEnum(AdrStatus)
  status!: AdrStatus;
}