import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
  Req,
  Query,
  Delete,
} from '@nestjs/common';

import { AdrsService } from './adrs.service';
import { CreateAdrDto } from './dto/create-adr.dto';
import { UpdateAdrDto } from './dto/update-adr.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateAdrStatusDto } from './dto/update-adr-status.dto';
import { AdrQueryDto } from './dto/adr-query.dto';
import { AddDependencyDto } from './dto/add-dependency.dto';

@Controller("adrs")
@ApiBearerAuth("JWT-auth")
export class AdrsController {
  constructor(private readonly adrsService: AdrsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateAdrDto, @Req() req: RequestWithUser) {
    return this.adrsService.create(dto, req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() query: AdrQueryDto) {
    return this.adrsService.findAll(query);
  }

  @Get("graph")
  @UseGuards(JwtAuthGuard)
  getGraph() {
    return this.adrsService.getGraph();
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  findOne(@Param("id") id: string) {
    return this.adrsService.findOne(id);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  update(
    @Param("id") id: string,
    @Body() dto: UpdateAdrDto,
    @Req() req: RequestWithUser,
  ) {
    return this.adrsService.update(id, dto, req.user);
  }

  @Patch(":id/archive")
  @UseGuards(JwtAuthGuard)
  archive(@Param("id") id: string, @Req() req: RequestWithUser) {
    return this.adrsService.archive(id, req.user);
  }

  @Patch(":id/status")
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateAdrStatusDto,
    @Req() req: RequestWithUser,
  ) {
    return this.adrsService.updateStatus(id, dto, req.user);
  }

  @Patch(":id/dependencies")
  @UseGuards(JwtAuthGuard)
  addDependency(
    @Param("id") id: string,
    @Body() dto: AddDependencyDto,
    @Req() req: RequestWithUser,
  ) {
    return this.adrsService.addDependency(id, dto.dependencyId, req.user);
  }

  @Delete(":id/dependencies/:dependencyId")
  @UseGuards(JwtAuthGuard)
  removeDependency(
    @Param("id") id: string,
    @Param("dependencyId") dependencyId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.adrsService.removeDependency(id, dependencyId, req.user);
  }

  @Get(":id/dependencies")
  @UseGuards(JwtAuthGuard)
  getDependencies(@Param("id") id: string) {
    return this.adrsService.getDependencies(id);
  }
}