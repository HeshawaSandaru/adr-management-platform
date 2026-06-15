import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Adr } from './schemas/adr.schema';
import { CreateAdrDto } from './dto/create-adr.dto';

@Injectable()
export class AdrsService {
  constructor(
    @InjectModel(Adr.name)
    private readonly adrModel: Model<Adr>,
  ) {}

  create(dto: CreateAdrDto) {
    return this.adrModel.create(dto);
  }

  findAll() {
    return this.adrModel.find().exec();
  }

  findOne(id: string) {
    return this.adrModel.findById(id).exec();
  }

  update(id: string, dto: Partial<CreateAdrDto>) {
    return this.adrModel.findByIdAndUpdate(
      id,
      dto,
      { new: true },
    ).exec();
  }

  archive(id: string) {
    return this.adrModel.findByIdAndUpdate(
      id,
      { status: 'Archived' },
      { new: true },
    ).exec();
  }
}