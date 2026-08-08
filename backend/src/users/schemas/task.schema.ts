import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TaskDocument = Task & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Task {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ trim: true })
  description!: string;

  @Prop({
    type: String,
    enum: ['to-do', 'doing', 'completed', 'on-hold'],
    default: 'to-do',
  })
  status!: string;

  @Prop({
    type: String,
    enum: ['none', 'low', 'medium', 'high', 'urgent'],
    default: 'none',
  })
  priority!: string;

  @Prop({ type: Date })
  dueDate!: Date;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ type: Boolean, default: false })
  isDeleted!: boolean;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
