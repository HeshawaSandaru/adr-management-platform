import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";

import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { Adr, AdrDocument } from "./schemas/adr.schema";
import { CreateAdrDto } from "./dto/create-adr.dto";
import { UpdateAdrDto } from "./dto/update-adr.dto";
import { RequestWithUser } from "../auth/interfaces/request-with-user.interface";

import { Role } from "../common/enums/role.enum";
import { AdrStatus } from "../common/enums/adr-status.enum";
import { AdrQueryDto } from "./dto/adr-query.dto";
import { UpdateAdrStatusDto } from "./dto/update-adr-status.dto";

@Injectable()
export class AdrsService {
  constructor(
    @InjectModel(Adr.name)
    private readonly adrModel: Model<AdrDocument>,
  ) {}

  // ✅ CREATE ADR (WITH JWT USER)
  async create(dto: CreateAdrDto, user: RequestWithUser["user"]) {
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
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean),
      };
    }

    if (query.title) {
      const escaped = query.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.title = { $regex: escaped, $options: "i" };
    }

    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, query.limit ?? 20); // cap at 100
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.adrModel
        .find(filter)
        .populate("authorId", "name email")
        .skip(skip)
        .limit(limit)
        .exec(),
      this.adrModel.countDocuments(filter).exec(),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid ADR ID");
    }

    const adr = await this.adrModel
      .findById(id)
      .populate("authorId", "name email")
      .populate("dependencies", "title status")
      .exec();

    if (!adr) {
      throw new NotFoundException("ADR not found");
    }

    return adr;
  }

  async update(id: string, dto: UpdateAdrDto, user: RequestWithUser["user"]) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid ADR ID");
    }

    const isAdmin = user.role === Role.ADMIN;

    if (isAdmin) {
      const updated = await this.adrModel.findOneAndUpdate(
        { _id: id },
        { $set: dto },
        {
          new: true,
          runValidators: true,
        },
      );

      if (!updated) {
        throw new ForbiddenException("Not allowed or ADR not found");
      }

      return updated;
    }

    const existing = await this.adrModel.findById(id).select("authorId alternativeAnalysis").exec();
    if (!existing) {
      throw new ForbiddenException("Not allowed or ADR not found");
    }

    const isOwner = existing.authorId.toString() === user.userId;

    if (isOwner) {
      const updated = await this.adrModel.findOneAndUpdate(
        { _id: id, authorId: user.userId },
        { $set: dto },
        {
          new: true,
          runValidators: true,
        },
      );

      if (!updated) {
        throw new ForbiddenException("Not allowed or ADR not found");
      }

      return updated;
    }

    const allowedKeys = ["alternativeAnalysis"];
    const extraKeys = Object.keys(dto).filter((key) => !allowedKeys.includes(key));
    if (extraKeys.length > 0) {
      throw new ForbiddenException(
        "You are only allowed to update alternative analysis on ADRs you do not own",
      );
    }

    const updated = await this.adrModel.findByIdAndUpdate(
      id,
      { $set: { alternativeAnalysis: dto.alternativeAnalysis } },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updated) {
      throw new ForbiddenException("Not allowed or ADR not found");
    }

    return updated;
  }

  async archive(id: string, user: RequestWithUser["user"]) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid ADR ID");
    }

    const isAdmin = user.role === Role.ADMIN;

    const filter = isAdmin ? { _id: id } : { _id: id, authorId: user.userId };

    const updated = await this.adrModel.findOneAndUpdate(
      {
        ...filter,
        status: { $in: [AdrStatus.Accepted, AdrStatus.Rejected] },
      },
      {
        $set: { status: AdrStatus.Archived },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updated) {
      throw new ForbiddenException(
        "Not allowed, ADR not found, or invalid status transition",
      );
    }

    return updated;
  }

  private validateStatusTransition(current: AdrStatus, next: AdrStatus) {
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
    dto: UpdateAdrStatusDto,
    user: RequestWithUser["user"],
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid ADR ID");
    }

    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException("Only admins can change ADR status");
    }

    const current = await this.adrModel
      .findById(id)
      .select("status")
      .exec();

    if (!current) {
      throw new ForbiddenException("Not allowed or ADR not found");
    }

    // Validate transition before writing
    this.validateStatusTransition(current.status, dto.status);

    // Atomic update with optimistic concurrency guard
    const updated = await this.adrModel.findOneAndUpdate(
      {
        _id: id,
        status: current.status, // ensures no concurrent modification happened
      },
      {
        $set: { status: dto.status },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updated) {
      throw new BadRequestException(
        "Status changed concurrently, please retry",
      );
    }

    return updated;
  }

  //dependencies

  async addDependency(
    id: string,
    dependencyId: string,
    user: RequestWithUser["user"],
  ) {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(dependencyId)) {
      throw new BadRequestException("Invalid ADR ID");
    }

    if (id === dependencyId) {
      throw new BadRequestException("ADR cannot depend on itself");
    }

    const dependency = await this.adrModel.findById(dependencyId);

    if (!dependency) {
      throw new NotFoundException("Dependency not found");
    }

    const isAdmin = user.role === Role.ADMIN;

    const updated = await this.adrModel.findOneAndUpdate(
      {
        _id: id,
        ...(isAdmin ? {} : { authorId: user.userId }),
      },
      {
        $addToSet: { dependencies: new Types.ObjectId(dependencyId) },
      },
      {
        new: true,
      },
    );
    if (!updated) {
      throw new ForbiddenException("Not allowed or ADR not found");
    }

    return updated;
  }

  async removeDependency(
    id: string,
    dependencyId: string,
    user: RequestWithUser["user"],
  ) {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(dependencyId)) {
      throw new BadRequestException("Invalid ADR ID");
    }

    const isAdmin = user.role === Role.ADMIN;

    const updated = await this.adrModel.findOneAndUpdate(
      {
        _id: id,
        ...(isAdmin ? {} : { authorId: user.userId }),
      },
      {
        $pull: { dependencies: new Types.ObjectId(dependencyId) },
      },
      { new: true },
    );
    if (!updated) {
      throw new ForbiddenException("Not allowed or ADR not found");
    }

    return updated;
  }

  async getDependencies(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid ADR ID");
    }
    const adr = await this.adrModel
      .findById(id)
      .populate("dependencies", "title status")
      .exec();

    if (!adr) {
      throw new NotFoundException("ADR not found");
    }

    return adr.dependencies;
  }
}
