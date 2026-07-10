import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { RequestWithUser } from "../auth/interfaces/request-with-user.interface";

@Controller('adrs/:adrId/reviews')
@ApiTags("Reviews")
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
  ) {}

  @Post()
   @ApiOperation({
    summary:
      'Create a review for an ADR',
  })
  @ApiParam({
    name: 'adrId',
    description: 'ADR ID',
  })
  @ApiBody({
    type: CreateReviewDto,
  })
  @ApiResponse({
    status: 201,
    description:
      'Review created successfully.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid request or review already exists.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Authors cannot review their own ADR.',
  })
  @ApiResponse({
    status: 404,
    description:
      'ADR not found.',
  })
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
  @ApiOperation({
    summary:
      'Get all reviews for an ADR',
  })
  @ApiParam({
    name: 'adrId',
    description: 'ADR ID',
  })
  @ApiResponse({
    status: 200,
    description:
      'Reviews retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description:
      'ADR not found.',
  })
  findByAdr(
    @Param('adrId') adrId: string,
  ) {
    return this.reviewsService.findByAdr(adrId);
  }
}