import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model, Types } from 'mongoose';

import {
  Review,
  ReviewDocument,
} from './schemas/review.schema';

import {
  Adr,
  AdrDocument,
} from '../adrs/schemas/adr.schema';

import { CreateReviewDto } from './dto/create-review.dto';

import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,

    @InjectModel(Adr.name)
    private readonly adrModel: Model<AdrDocument>,
  ) {}

  async create(
    adrId: string,
    dto: CreateReviewDto,
    user: RequestWithUser['user'],
  ) {
    if (!Types.ObjectId.isValid(adrId)) {
      throw new BadRequestException('Invalid ADR ID');
    }

    const adr = await this.adrModel.findById(adrId);

    if (!adr) {
      throw new NotFoundException('ADR not found');
    }

    if (adr.authorId.toString() === user.userId) {
      throw new ForbiddenException(
        'ADR author cannot review their own ADR',
      );
    }

    const existing = await this.reviewModel.findOne({
      adrId,
      reviewerId: user.userId,
    });
    if (existing) {
      throw new ConflictException("You have already reviewed this ADR");
    }

    return this.reviewModel.create({
      adrId,
      reviewerId: user.userId,
      decision: dto.decision,
      comment: dto.comment,
    });
  }

  async findByAdr(adrId: string) {
    if (!Types.ObjectId.isValid(adrId)) {
      throw new BadRequestException('Invalid ADR ID');
    }

    return this.reviewModel
      .find({ adrId })
      .populate('reviewerId', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }
}