import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

import {
  Review,
  ReviewSchema,
} from './schemas/review.schema';

import { AdrsModule } from '../adrs/adrs.module';

@Module({
  imports: [
    AdrsModule,
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