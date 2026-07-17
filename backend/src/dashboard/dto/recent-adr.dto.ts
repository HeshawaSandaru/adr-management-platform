import { ApiProperty } from '@nestjs/swagger';


export class RecentAdrDto {


  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
  })
  id!: string;


  @ApiProperty({
    example: 'Migrate to Microservices',
  })
  title!: string;


  @ApiProperty({
    example: 'Accepted',
  })
  status!: string;


  @ApiProperty({
    example: '2026-07-10T10:30:00Z',
  })
  createdAt!: Date;
}