import { IsEnum, IsString, MinLength } from 'class-validator';

import { ReviewDecision } from '../../common/enums/review-decision.enum';

export class CreateReviewDto {
  @IsEnum(ReviewDecision)
  decision!: ReviewDecision;

  @IsString()
  @MinLength(1)
  comment!: string;
}