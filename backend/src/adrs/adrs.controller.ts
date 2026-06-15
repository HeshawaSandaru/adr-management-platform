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

@Controller('adrs')
export class AdrsController {
  constructor(
    private readonly adrsService: AdrsService,
  ) {}

  @Post()
  create(
    @Body() dto: CreateAdrDto,
  ) {
    return this.adrsService.create(dto);
  }

  @Get()
  findAll() {
    return this.adrsService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.adrsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateAdrDto>,
  ) {
    return this.adrsService.update(id, dto);
  }

  @Patch(':id/archive')
  archive(
    @Param('id') id: string,
  ) {
    return this.adrsService.archive(id);
  }
}