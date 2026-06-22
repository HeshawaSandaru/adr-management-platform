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
} from '@nestjs/common';

import { AdrsService } from './adrs.service';
import { CreateAdrDto } from './dto/create-adr.dto';
import { UpdateAdrDto } from './dto/update-adr.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateAdrStatusDto } from './dto/update-adr-status.dto';
import { AdrQueryDto } from './dto/adr-query.dto';

@Controller('adrs')
@ApiBearerAuth('JWT-auth')
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

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.adrsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAdrDto,
    @Req() req: RequestWithUser,
  ) {
    return this.adrsService.update(id, dto, req.user);
  }

  @Patch(':id/archive')
  @UseGuards(JwtAuthGuard)
  archive(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ) {
    return this.adrsService.archive(id, req.user);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAdrStatusDto,
    @Req() req: RequestWithUser,
  ) {
    return this.adrsService.updateStatus(id, dto, req.user);
  }
}