import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type VoteDocument = HydratedDocument<Vote>;

@Schema({ timestamps: true })
export class Vote {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  section: string;

  @Prop({ required: true, enum: [1, -1] })
  value: number;
}

export const VoteSchema = SchemaFactory.createForClass(Vote);
