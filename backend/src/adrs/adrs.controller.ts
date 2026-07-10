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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { AdrsService } from './adrs.service';
import { CreateAdrDto } from './dto/create-adr.dto';
import { UpdateAdrDto } from './dto/update-adr.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { UpdateAdrStatusDto } from './dto/update-adr-status.dto';
import { AdrQueryDto } from './dto/adr-query.dto';
import { AddDependencyDto } from './dto/add-dependency.dto';

@Controller("adrs")
@ApiBearerAuth("JWT-auth")
@ApiTags('ADRs')
@UseGuards(JwtAuthGuard)
export class AdrsController {
  constructor(private readonly adrsService: AdrsService) {}

  @Post()
   @ApiOperation({
    summary: 'Create a new ADR',
  })
  @ApiBody({
    type: CreateAdrDto,
  })
  @ApiResponse({
    status: 201,
    description: 'ADR created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  create(@Body() dto: CreateAdrDto, @Req() req: RequestWithUser) {
    return this.adrsService.create(dto, req.user);
  }

  @Get()
   @ApiOperation({
    summary: 'Get all ADRs',
  })
  @ApiQuery({
    name: 'status',
    required: false,
  })
  @ApiQuery({
    name: 'authorId',
    required: false,
  })
  @ApiQuery({
    name: 'tags',
    required: false,
    description: 'Comma-separated tags',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'List of ADRs.',
  })
  findAll(@Query() query: AdrQueryDto) {
    return this.adrsService.findAll(query);
  }

  @Get("graph")
  @ApiOperation({
    summary: 'Get ADR dependency graph',
  })
  @ApiResponse({
    status: 200,
    description: 'Dependency graph returned successfully.',
  })
  getGraph() {
    return this.adrsService.getGraph();
  }

  @Get(":id")
   @ApiOperation({
    summary: 'Get ADR by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ADR ID',
  })
  @ApiResponse({
    status: 200,
    description: 'ADR found.',
  })
  @ApiResponse({
    status: 404,
    description: 'ADR not found.',
  })
  findOne(@Param("id") id: string) {
    return this.adrsService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({
    summary: 'Update an ADR',
  })
  @ApiParam({
    name: 'id',
    description: 'ADR ID',
  })
  @ApiBody({
    type: UpdateAdrDto,
  })
  @ApiResponse({
    status: 200,
    description: 'ADR updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'ADR not found.',
  })
  update(
    @Param("id") id: string,
    @Body() dto: UpdateAdrDto,
    @Req() req: RequestWithUser,
  ) {
    return this.adrsService.update(id, dto, req.user);
  }

  @Patch(":id/archive")
  @ApiOperation({
    summary: 'Archive an ADR',
  })
  @ApiParam({
    name: 'id',
    description: 'ADR ID',
  })
  @ApiResponse({
    status: 200,
    description: 'ADR archived successfully.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Only accepted or rejected ADRs can be archived.',
  })
  archive(@Param("id") id: string, @Req() req: RequestWithUser) {
    return this.adrsService.archive(id, req.user);
  }

  @Patch(":id/status")
  @ApiOperation({
    summary: 'Update ADR status',
  })
  @ApiParam({
    name: 'id',
    description: 'ADR ID',
  })
  @ApiBody({
    type: UpdateAdrStatusDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Status updated successfully.',
  })
  updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateAdrStatusDto,
    @Req() req: RequestWithUser,
  ) {
    return this.adrsService.updateStatus(id, dto, req.user);
  }

  @Patch(":id/dependencies")
  @ApiOperation({
    summary: 'Add ADR dependency',
  })
  @ApiParam({
    name: 'id',
    description: 'ADR ID',
  })
  @ApiBody({
    type: AddDependencyDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Dependency added successfully.',
  })
  addDependency(
    @Param("id") id: string,
    @Body() dto: AddDependencyDto,
    @Req() req: RequestWithUser,
  ) {
    return this.adrsService.addDependency(id, dto.dependencyId, req.user);
  }

  @Delete(":id/dependencies/:dependencyId")
  @ApiOperation({
    summary: 'Remove ADR dependency',
  })
  @ApiParam({
    name: 'id',
    description: 'ADR ID',
  })
  @ApiParam({
    name: 'dependencyId',
    description: 'Dependency ADR ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Dependency removed successfully.',
  })
  removeDependency(
    @Param("id") id: string,
    @Param("dependencyId") dependencyId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.adrsService.removeDependency(id, dependencyId, req.user);
  }

  @Get(":id/dependencies")
  @ApiOperation({
    summary: 'Get ADR dependencies',
  })
  @ApiParam({
    name: 'id',
    description: 'ADR ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Dependencies retrieved successfully.',
  })
  getDependencies(@Param("id") id: string) {
    return this.adrsService.getDependencies(id);
  }
}