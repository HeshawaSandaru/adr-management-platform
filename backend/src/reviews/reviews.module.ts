import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

import {
  Review,
  ReviewSchema,
} from './schemas/review.schema';

import {
  Adr,
  AdrSchema,
} from '../adrs/schemas/adr.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Review.name,
        schema: ReviewSchema,
      },
      {
        name: Adr.name,
        schema: AdrSchema,
      },
    ]),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}