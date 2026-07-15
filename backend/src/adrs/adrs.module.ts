import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Adr,
  AdrSchema,
} from './schemas/adr.schema';

import { AdrsController } from './adrs.controller';
import { AdrsService } from './adrs.service';
import { Review, ReviewSchema } from '../reviews/schemas/review.schema';
import { User, UserSchema } from "../users/schemas/user.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Adr.name,
        schema: AdrSchema,
      },
      {
        name: Review.name,
        schema: ReviewSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [AdrsController],
  providers: [AdrsService],
  exports: [MongooseModule],
})
export class AdrsModule {}