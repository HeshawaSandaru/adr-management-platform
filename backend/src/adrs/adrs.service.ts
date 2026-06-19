import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Adr, AdrDocument } from './schemas/adr.schema';
import { CreateAdrDto } from './dto/create-adr.dto';
import { UpdateAdrDto } from './dto/update-adr.dto';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { ForbiddenException } from '@nestjs/common';
import { Role } from '../common/enums/role.enum';
import { AdrStatus } from '../common/enums/adr-status.enum';

@Injectable()
export class AdrsService {
  constructor(
    @InjectModel(Adr.name)
    private readonly adrModel: Model<AdrDocument>,
  ) {}

  // ✅ CREATE ADR (WITH JWT USER)
  async create(dto: CreateAdrDto, user: RequestWithUser['user']) {
    return this.adrModel.create({
      ...dto,
      authorId: user.userId,
    });
  }

  async findAll() {
    return this.adrModel.find().exec();
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ADR ID');
    }

    const adr = await this.adrModel.findById(id).exec();

    if (!adr) {
      throw new NotFoundException('ADR not found');
    }

    return adr;
  }
  
    async update(
    id: string,
    dto: UpdateAdrDto,
    user: RequestWithUser['user'],
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ADR ID');
    }

    const adr = await this.adrModel.findById(id).exec();

    if (!adr) {
      throw new NotFoundException('ADR not found');
    }

    // ✅ ownership + admin bypass
    const isOwner = adr.authorId.toString() === user.userId;
    const isAdmin = user.role === Role.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'You are not allowed to update this ADR',
      );
    }

    const updated = await this.adrModel.findByIdAndUpdate(
     id,
     dto,
      { new: true, runValidators: true },
    );

    return updated;
  }

  async archive(
    id: string,
    user: RequestWithUser['user'],
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ADR ID');
    }

    const adr = await this.adrModel.findById(id).exec();

    if (!adr) {
      throw new NotFoundException('ADR not found');
    }

    const isOwner = adr.authorId.toString() === user.userId;
    const isAdmin = user.role === Role.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'You are not allowed to archive this ADR',
      );
    }

    const updated = await this.adrModel.findByIdAndUpdate(
      id,
      { status: AdrStatus.Archived },
      { new: true },
    );

    return updated;
  }
}