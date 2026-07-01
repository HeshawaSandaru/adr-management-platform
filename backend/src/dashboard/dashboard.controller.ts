import {
  Controller,
  Get,
  Req,
  UseGuards,
} from "@nestjs/common";

import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

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
  getDashboard(
    @Req() req: RequestWithUser,
  ) {
    return this.dashboardService.getDashboard(
      req.user,
    );
  }

  @Get("recent")
  getRecentAdrs(
    @Req() req: RequestWithUser,
  ) {
    return this.dashboardService.getRecentAdrs(
      req.user,
    );
  }
}