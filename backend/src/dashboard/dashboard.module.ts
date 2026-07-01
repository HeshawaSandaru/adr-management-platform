import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import {
  Adr,
  AdrSchema,
} from "../adrs/schemas/adr.schema";

import {
  Review,
  ReviewSchema,
} from "../reviews/schemas/review.schema";

import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";

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
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}