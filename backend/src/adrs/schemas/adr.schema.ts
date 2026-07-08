import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document ,Schema as MongooseSchema, Types } from 'mongoose';

import { AdrStatus } from '../../common/enums/adr-status.enum';
import { User } from '../../users/schemas/user.schema';

export type AdrDocument = Adr & Document;

@Schema({ timestamps: true })
export class Adr {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  problemStatement!: string;

  @Prop({ required: true })
  proposedSolution!: string;

  @Prop({
    type: String,
    enum: AdrStatus,
    default: AdrStatus.Draft,
  })
  status!: AdrStatus;

  // ✅ IMPORTANT: comes from JWT
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  authorId!: Types.ObjectId;

  @Prop({
    type: [
      {
        alternative: { type: String, required: true },
        pros: { type: [String], default: [] },
        cons: { type: [String], default: [] },
      },
    ],
    default: [],
  })
  alternativeAnalysis!: {
    alternative: string;
    pros: string[];
    cons: string[];
  }[];

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop()
  expectedBenefits!: string;

  @Prop()
  actualBenefits!: string;

  @Prop()
  lessonsLearned!: string;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: "Adr" }],
    default: [],
  })
  dependencies!: Types.ObjectId[];
}

export const AdrSchema = SchemaFactory.createForClass(Adr);

AdrSchema.index({ status: 1 });
AdrSchema.index({ authorId: 1 });
AdrSchema.index({ tags: 1 });
AdrSchema.index({ dependencies: 1 });