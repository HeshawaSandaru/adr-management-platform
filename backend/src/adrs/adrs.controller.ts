import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';

import { AdrsService } from './adrs.service';
import { CreateAdrDto } from './dto/create-adr.dto';
import { UpdateAdrDto } from './dto/update-adr.dto';

import {
  ApiTags,
  ApiResponse,
  ApiOperation,
} from '@nestjs/swagger';

@ApiTags('ADRs')
@Controller('adrs')
export class AdrsController {
  constructor(
    private readonly adrsService: AdrsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new ADR',
  })
  @ApiResponse({
    status: 201,
    description: 'ADR created successfully',
  })
  create(@Body() dto: CreateAdrDto) {
    return this.adrsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all ADRs',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all ADRs',
  })
  findAll() {
    return this.adrsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get ADR by ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Single ADR details',
  })
  findOne(@Param('id') id: string) {
    return this.adrsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update ADR',
  })
  @ApiResponse({
    status: 200,
    description: 'ADR updated successfully',
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAdrDto,
  ) {
    return this.adrsService.update(id, dto);
  }

  @Patch(':id/archive')
  @ApiOperation({
    summary: 'Archive ADR',
  })
  @ApiResponse({
    status: 200,
    description: 'ADR archived successfully',
  })
  archive(@Param('id') id: string) {
    return this.adrsService.archive(id);
  }
}