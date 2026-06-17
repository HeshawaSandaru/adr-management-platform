import { PartialType } from '@nestjs/mapped-types';
import { CreateAdrDto } from './create-adr.dto';

export class UpdateAdrDto extends PartialType(CreateAdrDto) {}