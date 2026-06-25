import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { ReviewsService } from './reviews.service';

import { CreateReviewDto } from './dto/create-review.dto';

import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('adrs/:adrId/reviews')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
  ) {}

  @Post()
  create(
    @Param('adrId') adrId: string,
    @Body() dto: CreateReviewDto,
    @Req() req: RequestWithUser,
  ) {
    return this.reviewsService.create(
      adrId,
      dto,
      req.user,
    );
  }

  @Get()
  findByAdr(
    @Param('adrId') adrId: string,
  ) {
    return this.reviewsService.findByAdr(adrId);
  }
}