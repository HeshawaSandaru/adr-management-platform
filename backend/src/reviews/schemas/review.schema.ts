import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { ReviewDecision } from '../../common/enums/review-decision.enum';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({
    type: Types.ObjectId,
    ref: 'Adr',
    required: true,
  })
  adrId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  reviewerId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: ReviewDecision,
    required: true,
  })
  decision!: ReviewDecision;

  @Prop({ required: true })
  comment!: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

ReviewSchema.index({ adrId: 1 });
ReviewSchema.index({ reviewerId: 1 });