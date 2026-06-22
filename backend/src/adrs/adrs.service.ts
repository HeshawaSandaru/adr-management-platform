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
      authorId: user.userId,
      status: AdrStatus.Draft,
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

    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, query.limit ?? 20); // cap at 100
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.adrModel
        .find(filter)
        .populate('authorId', 'name email')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.adrModel.countDocuments(filter).exec(),
    ]);

    return { data, total, page, limit };
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

    const isAdmin = user.role === Role.ADMIN;

    const filter = isAdmin
      ? { _id: id }
      : { _id: id, authorId: user.userId };

    const updated = await this.adrModel.findOneAndUpdate(
      filter,
      { $set: dto },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updated) {
      throw new ForbiddenException(
        'Not allowed or ADR not found',
      );
    }

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

    //  enforce workflow rules
    this.validateStatusTransition(adr.status, dto.status);

    adr.status = dto.status;
    await adr.save();

    return adr;
  }
}