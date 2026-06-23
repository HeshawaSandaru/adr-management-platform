import { IsEnum, IsString } from 'class-validator';

import { ReviewDecision } from '../../common/enums/review-decision.enum';

export class CreateReviewDto {
  @IsEnum(ReviewDecision)
  decision!: ReviewDecision;

  @IsString()
  comment!: string;
}