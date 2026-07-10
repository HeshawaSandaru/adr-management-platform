import {
  Controller,
  Get,
  Req,
  UseGuards,
} from "@nestjs/common";

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RequestWithUser } from "../auth/interfaces/request-with-user.interface";

import { DashboardService } from "./dashboard.service";

@ApiTags("Dashboard")
@ApiBearerAuth("JWT-auth")
@Controller("dashboard")
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get dashboard overview',
    description:
      'Returns ADR statistics, status distribution, and user metrics.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Dashboard data retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description:
      'Unauthorized.',
  })
  getDashboard(
    @Req() req: RequestWithUser,
  ) {
    return this.dashboardService.getDashboard(
      req.user,
    );
  }


  @Get("recent")
  @ApiOperation({
    summary: 'Get recent ADRs',
    description:
      'Returns recently created or updated ADRs.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Recent ADRs retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description:
      'Unauthorized.',
  })
  getRecentAdrs(
    @Req() req: RequestWithUser,
  ) {
    return this.dashboardService.getRecentAdrs(
      req.user,
    );
  }
}