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
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Controller('adrs')
export class AdrsController {
  constructor(private readonly adrsService: AdrsService) {}

  // CREATE ADR (AUTH REQUIRED)
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateAdrDto, @Req() req: RequestWithUser) {
    return this.adrsService.create(dto, req.user);
  }

  // GET ALL (AUTH REQUIRED)
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.adrsService.findAll();
  }

  // GET ONE (AUTH REQUIRED)
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.adrsService.findOne(id);
  }

  // UPDATE (OWNER + ADMIN CHECK DONE IN SERVICE)
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAdrDto,
    @Req() req: RequestWithUser,
  ) {
    return this.adrsService.update(id, dto, req.user);
  }

  // ARCHIVE (ADMIN ONLY via guard, but service still validates ownership safety)
  @Patch(':id/archive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  archive(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ) {
    return this.adrsService.archive(id, req.user);
  }
}