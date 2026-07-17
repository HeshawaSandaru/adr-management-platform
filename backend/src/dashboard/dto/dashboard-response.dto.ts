import { ApiProperty } from '@nestjs/swagger';


export class DashboardResponseDto {


  @ApiProperty({
    example: 25,
    description: 'Total number of ADRs',
  })
  totalAdrs!: number;


  @ApiProperty({
    example: 5,
    description: 'Number of draft ADRs',
  })
  draft!: number;


  @ApiProperty({
    example: 10,
    description: 'Number of proposed ADRs',
  })
  proposed!: number;


  @ApiProperty({
    example: 6,
    description: 'Number of accepted ADRs',
  })
  accepted!: number;


  @ApiProperty({
    example: 2,
    description: 'Number of rejected ADRs',
  })
  rejected!: number;


  @ApiProperty({
    example: 2,
    description: 'Number of archived ADRs',
  })
  archived!: number;


  @ApiProperty({
    example: 50,
    description: 'Total reviews count',
  })
  totalReviews!: number;


  @ApiProperty({
    example: 30,
    description: 'Approved reviews',
  })
  approvedReviews!: number;


  @ApiProperty({
    example: 10,
    description: 'Rejected reviews',
  })
  rejectedReviews!: number;


  @ApiProperty({
    example: 10,
    description: 'Changes requested reviews',
  })
  changesRequestedReviews!: number;
}