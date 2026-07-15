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
import { Review, ReviewDocument } from "../reviews/schemas/review.schema";
import { User, UserDocument } from "../users/schemas/user.schema";

@Injectable()
export class AdrsService {
  constructor(
    @InjectModel(Adr.name)
    private readonly adrModel: Model<AdrDocument>,

    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  // Escapes regex special characters so user input can't break or hijack a $regex query
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // ✅ CREATE ADR (WITH JWT USER)
  async create(dto: CreateAdrDto, user: RequestWithUser["user"]) {
    const processedDependencies =
      dto.dependencies?.map((depId) => new Types.ObjectId(depId)) || [];
    return this.adrModel.create({
      ...dto,
      dependencies: processedDependencies,
      authorId: user.userId,
      status: AdrStatus.Draft,
    });
  }

  async findAll(query: AdrQueryDto) {
    const matchStage: any = {};

    if (query.status) {
      matchStage.status = query.status;
    }

    if (query.fromDate || query.toDate) {
      matchStage.createdAt = {};
      if (query.fromDate) matchStage.createdAt.$gte = new Date(query.fromDate);
      if (query.toDate) {
        const endDate = new Date(query.toDate);
        endDate.setHours(23, 59, 59, 999);
        matchStage.createdAt.$lte = endDate;
      }
    }

    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, query.limit ?? 20);
    const skip = (page - 1) * limit;

    const pipeline: any[] = [
      { $match: matchStage },

      // join author, comparing as strings so type mismatches don't silently drop matches
      {
        $lookup: {
          from: "users",
          let: { authorId: "$authorId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toString: "$_id" }, { $toString: "$$authorId" }],
                },
              },
            },
            { $project: { name: 1, email: 1 } },
          ],
          as: "author",
        },
      },
      { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },

      // join reviews, and inside that join the reviewer
      {
        $lookup: {
          from: "reviews",
          let: { adrId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toString: "$adrId" }, { $toString: "$$adrId" }],
                },
              },
            },
            {
              $lookup: {
                from: "users",
                let: { reviewerId: "$reviewerId" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: [
                          { $toString: "$_id" },
                          { $toString: "$$reviewerId" },
                        ],
                      },
                    },
                  },
                  { $project: { name: 1, email: 1 } },
                ],
                as: "reviewer",
              },
            },
            {
              $unwind: { path: "$reviewer", preserveNullAndEmptyArrays: true },
            },
          ],
          as: "reviews",
        },
      },
    ];

    if (query.search) {
      const regex = new RegExp(this.escapeRegex(query.search), "i");
      pipeline.push({
        $match: {
          $or: [
            { title: regex },
            { tags: regex },
            { "author.name": regex },
            { "reviews.reviewer.name": regex },
          ],
        },
      });
    }

    if (query.reviewerName) {
      const regex = new RegExp(this.escapeRegex(query.reviewerName), "i");
      pipeline.push({ $match: { "reviews.reviewer.name": regex } });
    }

    pipeline.push({
      $facet: {
        data: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
        ],
        totalCount: [{ $count: "count" }],
      },
    });

    const result = await this.adrModel.aggregate(pipeline).exec();
    const data: any[] = result[0]?.data ?? [];
    const total = result[0]?.totalCount?.[0]?.count ?? 0;

    const populated = (await this.adrModel.populate(data, {
      path: "dependencies",
      select: "title status",
    })) as any[];

    const shaped = populated.map((adr: any) => ({
      ...adr,
      authorId: adr.author
        ? {
            _id: adr.author._id,
            name: adr.author.name,
            email: adr.author.email,
          }
        : adr.authorId,
      reviews: (adr.reviews || []).map((r: any) => ({
        ...r,
        reviewerId: r.reviewer
          ? {
              _id: r.reviewer._id,
              name: r.reviewer.name,
              email: r.reviewer.email,
            }
          : r.reviewerId,
      })),
    }));

    return { data: shaped, total, page, limit };
  }

  async getGraph() {
    const adrs = await this.adrModel
      .find()
      .select("title status dependencies authorId")
      .lean()
      .exec();

    const nodes = adrs.map((a) => ({
      id: a._id.toString(),
      title: a.title,
      status: a.status,
      authorId: a.authorId?.toString(),
    }));

    const edges: { from: string; to: string }[] = [];

    for (const adr of adrs) {
      for (const depId of adr.dependencies || []) {
        edges.push({
          from: adr._id.toString(),
          to: depId.toString(),
        });
      }
    }

    return { nodes, edges };
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

    const existing = await this.adrModel
      .findById(id)
      .select("authorId alternativeAnalysis")
      .exec();
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
    const extraKeys = Object.keys(dto).filter(
      (key) => !allowedKeys.includes(key),
    );
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

    const current = await this.adrModel.findById(id).select("status").exec();

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
  // ✅ Checks whether adding `dependencyId` as a dependency of `id` would
  // create a cycle, by walking the dependency chain starting from
  // `dependencyId` and seeing if we ever reach `id`.
  // ==========================================
  // SAFE CYCLE CHECKER (Defensive Programming)
  // ==========================================
  private async wouldCreateCycle(
    id: string,
    dependencyId: string,
  ): Promise<boolean> {
    const visited = new Set<string>();

    const queue: string[] = [dependencyId.toString()];
    const matchIdStr = id.toString();

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current === matchIdStr) {
        return true;
      }

      if (visited.has(current)) {
        continue;
      }
      visited.add(current);

      const doc = await this.adrModel
        .findById(current)
        .select("dependencies")
        .exec();

      if (!doc || !doc.dependencies) {
        continue;
      }

      for (const dep of doc.dependencies) {
        if (dep) {
          queue.push(dep.toString());
        }
      }
    }

    return false;
  }

  // ==========================================================
  // ADD DEPENDENCY (Using Safe .save() Method)
  // ==========================================================
  async addDependency(
    id: string,
    dependencyId: string | undefined,
    user: RequestWithUser["user"],
  ) {
    if (!dependencyId) {
      throw new BadRequestException(
        'The "dependencyId" property is required in the request body.',
      );
    }

    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(dependencyId)) {
      throw new BadRequestException("Invalid ID format provided");
    }

    if (id === dependencyId) {
      throw new BadRequestException("An ADR cannot depend on itself");
    }

    // 1. Fetch target ADR document fully
    const targetAdr = await this.adrModel.findById(id).exec();
    if (!targetAdr) {
      throw new NotFoundException("Target ADR not found");
    }

    // 2. Validate target dependency exists in the DB
    const dependencyExists = await this.adrModel.exists({
      _id: new Types.ObjectId(dependencyId),
    });
    if (!dependencyExists) {
      throw new NotFoundException("Dependency ADR not found");
    }

    // 3. Authorization validation
    const isAdmin = user?.role === Role.ADMIN;
    if (!isAdmin && targetAdr.authorId.toString() !== user?.userId) {
      throw new ForbiddenException(
        "You can only manage dependencies for your own ADRs",
      );
    }

    // 4. Double check duplicate entries to simulate $addToSet safely
    const alreadyExists = targetAdr.dependencies.some(
      (depId) => depId.toString() === dependencyId.toString(),
    );
    if (alreadyExists) {
      return targetAdr; // Return gracefully if relationship is already mapped
    }

    // 5. Cycle validation check
    const introducesCycle = await this.wouldCreateCycle(id, dependencyId);
    if (introducesCycle) {
      throw new BadRequestException(
        "Circular reference detected! This dependency loop is not allowed.",
      );
    }

    // 6. Push and explicitly save using Mongoose tracking hooks
    targetAdr.dependencies.push(new Types.ObjectId(dependencyId));
    return await targetAdr.save();
  }

  // ==========================================================
  // REMOVE DEPENDENCY (Using Safe Filter + .save())
  // ==========================================================
  async removeDependency(
    id: string,
    dependencyId: string,
    user: RequestWithUser["user"],
  ) {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(dependencyId)) {
      throw new BadRequestException("Invalid ID format provided");
    }

    const targetAdr = await this.adrModel.findById(id).exec();
    if (!targetAdr) {
      throw new NotFoundException("Target ADR not found");
    }

    const isAdmin = user?.role === Role.ADMIN;
    if (!isAdmin && targetAdr.authorId.toString() !== user?.userId) {
      throw new ForbiddenException(
        "You can only manage dependencies for your own ADRs",
      );
    }

    // Filter out the requested dependency from the current instances array
    targetAdr.dependencies = targetAdr.dependencies.filter(
      (depId) => depId.toString() !== dependencyId.toString(),
    );

    return await targetAdr.save();
  }

  // ==========================================================
  // GET DEPENDENCIES
  // ==========================================================

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
