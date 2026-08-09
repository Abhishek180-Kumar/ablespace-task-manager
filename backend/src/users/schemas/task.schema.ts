import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TaskDocument = Task & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
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

  @Prop({ type: [String], default: [] })
  members!: string[];

  @Prop({ trim: true })
  reporter?: string;

  @Prop({ type: String })
  projectId?: string;

  @Prop({
    type: [
      {
        title: { type: String, required: true },
        completed: { type: Boolean, default: false },
        priority: { type: String, default: 'none' },
        assignee: { type: String },
        dueDate: { type: Date },
      },
    ],
    default: [],
  })
  subtasks!: Array<{
    title: string;
    completed: boolean;
    priority?: string;
    assignee?: string;
    dueDate?: Date;
  }>;

  @Prop({
    type: [
      {
        userId: { type: String },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  comments!: Array<{ userId?: string; text: string; createdAt: Date }>;

  @Prop({
    type: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
        description: { type: String },
      },
    ],
    default: [],
  })
  resources!: Array<{ title: string; url: string; description?: string }>;

  @Prop({ type: Boolean, default: false })
  isDeleted!: boolean;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

TaskSchema.index({ userId: 1, createdAt: -1 });
TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ userId: 1, priority: 1 });
TaskSchema.index({ userId: 1, projectId: 1 });
