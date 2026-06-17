import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import {
  Model,
  Types,
} from 'mongoose';

import {
  Adr,
  AdrDocument,
} from './schemas/adr.schema';

import { CreateAdrDto } from './dto/create-adr.dto';
import { UpdateAdrDto } from './dto/update-adr.dto';

@Injectable()
export class AdrsService {
  constructor(
    @InjectModel(Adr.name)
    private readonly adrModel: Model<AdrDocument>,
  ) {}

  async create(dto: CreateAdrDto) {
    return this.adrModel.create(dto);
  }

  async findAll() {
    return this.adrModel.find().exec();
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(
        'Invalid ADR ID',
      );
    }

    const adr =
      await this.adrModel.findById(id).exec();

    if (!adr) {
      throw new NotFoundException(
        'ADR not found',
      );
    }

    return adr;
  }

  async update(
    id: string,
    dto: UpdateAdrDto,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(
        'Invalid ADR ID',
      );
    }

    const updated =
      await this.adrModel.findByIdAndUpdate(
        id,
        dto,
        {
          new: true,
          runValidators: true,
        },
      );

    if (!updated) {
      throw new NotFoundException(
        'ADR not found',
      );
    }

    return updated;
  }

  async archive(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(
        'Invalid ADR ID',
      );
    }

    const updated =
      await this.adrModel.findByIdAndUpdate(
        id,
        { status: 'Archived' },
        {
          new: true,
        },
      );

    if (!updated) {
      throw new NotFoundException(
        'ADR not found',
      );
    }

    return updated;
  }
}