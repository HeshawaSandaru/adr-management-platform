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
} from '@nestjs/common';

import { AdrsService } from './adrs.service';
import { CreateAdrDto } from './dto/create-adr.dto';
import { UpdateAdrDto } from './dto/update-adr.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RequestWithUser } from '../auth/request-with-user.interface';

@Controller('adrs')
export class AdrsController {
  constructor(private readonly adrsService: AdrsService) {}

  // CREATE ADR (USER OR ADMIN)
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateAdrDto, @Req() req: RequestWithUser) {
    return this.adrsService.create(dto, req.user);
  }

  // GET ALL
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.adrsService.findAll();
  }

  // GET ONE
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.adrsService.findOne(id);
  }

  // UPDATE
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAdrDto,
  ) {
    return this.adrsService.update(id, dto);
  }

  // ARCHIVE (ADMIN ONLY 🔥 RBAC)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/archive')
  archive(@Param('id') id: string) {
    return this.adrsService.archive(id);
  }
}