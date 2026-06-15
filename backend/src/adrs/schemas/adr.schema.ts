import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdrDocument = Adr & Document;

@Schema({
  timestamps: true,
})
export class Adr {
  @Prop({
    required: true,
    trim: true,
  })
  title!: string;

  @Prop({
    required: true,
  })
  problem!: string;

  @Prop({
    required: true,
  })
  solution!: string;

  @Prop({
    enum: [
      'Proposed',
      'Under Review',
      'Approved',
      'Rejected',
      'Archived',
    ],
    default: 'Proposed',
  })
  status!: string;

  @Prop()
  authorId!: string;

  @Prop({
    type: [String],
    default: [],
  })
  tags: string[] = [];

  @Prop({
    type: [String],
    default: [],
  })
  alternatives: string[] = [];
}

export const AdrSchema = SchemaFactory.createForClass(Adr);