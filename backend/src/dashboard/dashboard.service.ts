import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { Adr, AdrDocument } from "../adrs/schemas/adr.schema";
import {
  Review,
  ReviewDocument,
} from "../reviews/schemas/review.schema";

import { RequestWithUser } from "../auth/interfaces/request-with-user.interface";
import { Role } from "../common/enums/role.enum";
import { AdrStatus } from "../common/enums/adr-status.enum";
import { ReviewDecision } from "../common/enums/review-decision.enum";

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Adr.name)
    private readonly adrModel: Model<AdrDocument>,

    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
  ) {}

  async getDashboard(user: RequestWithUser["user"]) {
    const isAdmin = user.role === Role.ADMIN;

    const adrFilter = isAdmin
      ? {}
      : { authorId: user.userId };

    const reviewFilter = isAdmin
      ? {}
      : { reviewerId: user.userId };

    const [
      totalAdrs,
      draft,
      proposed,
      accepted,
      rejected,
      archived,
      totalReviews,
      approvedReviews,
      rejectedReviews,
      changesRequestedReviews,
    ] = await Promise.all([
      this.adrModel.countDocuments(adrFilter),

      this.adrModel.countDocuments({
        ...adrFilter,
        status: AdrStatus.Draft,
      }),

      this.adrModel.countDocuments({
        ...adrFilter,
        status: AdrStatus.Proposed,
      }),

      this.adrModel.countDocuments({
        ...adrFilter,
        status: AdrStatus.Accepted,
      }),

      this.adrModel.countDocuments({
        ...adrFilter,
        status: AdrStatus.Rejected,
      }),

      this.adrModel.countDocuments({
        ...adrFilter,
        status: AdrStatus.Archived,
      }),

      this.reviewModel.countDocuments(reviewFilter),

      this.reviewModel.countDocuments({
        ...reviewFilter,
        decision: ReviewDecision.APPROVED,
      }),

      this.reviewModel.countDocuments({
        ...reviewFilter,
        decision: ReviewDecision.REJECTED,
      }),

      this.reviewModel.countDocuments({
        ...reviewFilter,
        decision: ReviewDecision.RequestChanges,
      }),
    ]);

    return {
      totalAdrs,

      draft,
      proposed,
      accepted,
      rejected,
      archived,

      totalReviews,
      approvedReviews,
      rejectedReviews,
      changesRequestedReviews,

      
    };
  }

  async getRecentAdrs(user: RequestWithUser["user"]) {
    const filter =
      user.role === Role.ADMIN
        ? {}
        : { authorId: user.userId };

    return this.adrModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title status createdAt")
      .populate("authorId", "name email")
      .exec();
  }
}