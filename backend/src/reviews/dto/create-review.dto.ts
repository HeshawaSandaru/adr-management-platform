import { IsEnum, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


import { ReviewDecision } from '../../common/enums/review-decision.enum';

export class CreateReviewDto {
  @ApiProperty({
    description: 'Review decision',
    enum: ReviewDecision,
    example: ReviewDecision.APPROVED,
  })
  @IsEnum(ReviewDecision)
  decision!: ReviewDecision;

  @ApiProperty({
    description: 'Reviewer comment',
    example: 'The proposed architecture looks scalable.',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  comment!: string;
}