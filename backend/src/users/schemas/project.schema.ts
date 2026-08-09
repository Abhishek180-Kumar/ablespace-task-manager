import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema({ timestamps: true })
export class Project {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({
    type: String,
    enum: ['active', 'backlog', 'completed', 'on-hold'],
    default: 'active',
  })
  status!: string;

  @Prop({
    type: String,
    enum: ['none', 'low', 'medium', 'high', 'urgent'],
    default: 'none',
  })
  priority!: string;

  @Prop({ trim: true })
  lead?: string;

  @Prop({ type: Date })
  dueDate?: Date;

  @Prop({ type: [String], default: [] })
  labels!: string[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

ProjectSchema.index({ userId: 1, createdAt: -1 });
ProjectSchema.index({ userId: 1, status: 1 });
ProjectSchema.index({ userId: 1, priority: 1 });
