import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TaskDocument = Task & Document;

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true })
  title!: string;

  @Prop()
  description?: string;

  @Prop({ default: 'pending', enum: ['pending', 'in-progress', 'completed'] })
  status!: string;

  @Prop({ default: 'medium', enum: ['low', 'medium', 'high'] })
  priority!: string;

  @Prop()
  dueDate?: Date;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner!: Types.ObjectId;

  @Prop({ default: false })
  isDeleted!: boolean;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
