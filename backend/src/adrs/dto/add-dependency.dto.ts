import { IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddDependencyDto {
   @ApiProperty({
    description: 'ADR ID that this ADR depends on',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  dependencyId!: string;
}