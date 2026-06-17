import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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

  @Prop({ required: true })
  author!: string;

  // ✅ Alternatives (array of strings for now)
  @Prop({ type: [String], default: [] })
  alternatives!: string[];

  // ✅ Tags for filtering/searching
  @Prop({ type: [String], default: [] })
  tags!: string[];

  // ✅ Impact tracking fields
  @Prop()
  expectedBenefits!: string;

  @Prop()
  actualBenefits!: string;

  @Prop()
  lessonsLearned!: string;

  // ✅ Dependency mapping (store related ADR IDs)
  @Prop({ type: [String], default: [] })
  dependencies!: string[];

  // timestamps automatically added:
  // createdAt, updatedAt
}

export const AdrSchema = SchemaFactory.createForClass(Adr);