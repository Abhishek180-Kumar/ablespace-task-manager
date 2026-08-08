import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task } from '../users/schemas/task.schema';
import { CreateTaskDto, UpdateTaskDto, QueryTaskDto } from './dto/create-task.dto';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

  async create(createTaskDto: CreateTaskDto, userId: string) {
    const createdTask = new this.taskModel({
      ...createTaskDto,
      userId: new Types.ObjectId(userId),
    });
    return createdTask.save();
  }

  async findAll(query: QueryTaskDto, userId: string) {
    const filter: any = { userId: new Types.ObjectId(userId), isDeleted: false };

    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;
    if (query.search) filter.title = { $regex: query.search, $options: 'i' };

    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const data = await this.taskModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).exec();
    const total = await this.taskModel.countDocuments(filter);

    return { data, meta: { total, page, totalPages: Math.ceil(total / limit) } };
  }

  async findDeleted(userId: string) {
    return this.taskModel.find({ userId: new Types.ObjectId(userId), isDeleted: true }).exec();
  }

  async findOne(id: string, userId: string) {
    const task = await this.taskModel.findOne({ _id: id, userId: new Types.ObjectId(userId) }).exec();
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string) {
    const task = await this.taskModel.findOneAndUpdate(
      { _id: id, userId: new Types.ObjectId(userId) },
      updateTaskDto,
      { new: true }
    ).exec();
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async remove(id: string, userId: string) {
    const task = await this.taskModel.findOneAndUpdate(
      { _id: id, userId: new Types.ObjectId(userId) },
      { isDeleted: true },
      { new: true }
    ).exec();
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async restore(id: string, userId: string) {
    const task = await this.taskModel.findOneAndUpdate(
      { _id: id, userId: new Types.ObjectId(userId) },
      { isDeleted: false },
      { new: true }
    ).exec();
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }
}
