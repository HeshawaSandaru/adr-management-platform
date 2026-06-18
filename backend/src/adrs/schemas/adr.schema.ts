import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document , Types } from 'mongoose';

export type AdrDocument = Adr & Document;

@Schema({ timestamps: true })
export class Adr {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  problemStatement!: string;

  @Prop({ required: true })
  proposedSolution!: string;

  @Prop({ default: 'Draft' })
  status!: string;

  // ✅ IMPORTANT: comes from JWT
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId!: Types.ObjectId

  @Prop({ type: [String], default: [] })
  alternatives!: string[];

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop()
  expectedBenefits!: string;

  @Prop()
  actualBenefits!: string;

  @Prop()
  lessonsLearned!: string;

  @Prop({ type: [String], default: [] })
  dependencies!: string[];
}

export const AdrSchema = SchemaFactory.createForClass(Adr);