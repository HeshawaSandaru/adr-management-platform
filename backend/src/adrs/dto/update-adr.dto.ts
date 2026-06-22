import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateAdrDto } from './create-adr.dto';

export class UpdateAdrDto extends PartialType(
  OmitType(CreateAdrDto, ['status'] as const),
) {}