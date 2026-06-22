import {
  Injectable,
  NotFoundException,
  BadRequestException,
   ForbiddenException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Adr, AdrDocument } from './schemas/adr.schema';
import { CreateAdrDto } from './dto/create-adr.dto';
import { UpdateAdrDto } from './dto/update-adr.dto';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

import { Role } from '../common/enums/role.enum';
import { AdrStatus } from '../common/enums/adr-status.enum';
import { AdrQueryDto } from './dto/adr-query.dto';

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
      status: AdrStatus.Draft,
      authorId: user.userId,
    });
  }

  async findAll(query: AdrQueryDto) {
  const filter: any = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.authorId) {
    filter.authorId = query.authorId;
  }

  if (query.tags) {
    filter.tags = {
      $in: query.tags
        .split(',')
        .map((t: string) => t.trim())
        .filter(Boolean),
    };
  }

  return this.adrModel
  .find(filter)
  .populate('authorId', 'name email')
  .exec();
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

    Object.assign(adr, dto);
    await adr.save();

    return adr;
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

    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'Only administrators can archive ADRs',
      );
    }

    adr.status = AdrStatus.Archived;
    await adr.save();

    return adr; 
  }

  private validateStatusTransition(
    current: AdrStatus,
    next: AdrStatus,
  ) {
    const allowedTransitions: Record<AdrStatus, AdrStatus[]> = {
      Draft: [AdrStatus.Proposed],
      Proposed: [AdrStatus.Accepted, AdrStatus.Rejected],
      Accepted: [AdrStatus.Archived],
      Rejected: [AdrStatus.Archived],
      Archived: [],
    };

    if (!allowedTransitions[current].includes(next)) {
      throw new BadRequestException(
        `Invalid status transition from ${current} to ${next}`,
      );
    }
  }

  async updateStatus(
    id: string,
    dto: { status: AdrStatus },
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
        'You are not allowed to change ADR status',
      );
    }

    // 🔥 enforce workflow rules
    this.validateStatusTransition(adr.status, dto.status);

    adr.status = dto.status;
    await adr.save();

    return adr;
  }
}