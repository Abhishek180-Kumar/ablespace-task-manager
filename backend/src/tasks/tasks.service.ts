import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import { Task, TaskDocument } from '../users/schemas/task.schema';
import {
  CreateTaskDto,
  UpdateTaskDto,
  QueryTaskDto,
} from './dto/create-task.dto';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<TaskDocument>) {}

  async create(ownerId: string, dto: CreateTaskDto): Promise<TaskDocument> {
    const task = await this.taskModel.create({ ...dto, owner: ownerId });
    return task.populate('owner', 'name email');
  }

  async findAll(ownerId: string, query: QueryTaskDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filter: QueryFilter<TaskDocument> = {
      owner: ownerId,
      isDeleted: false,
    };

    if (query.status) {
      filter.status = query.status;
    }

    if (query.priority) {
      filter.priority = query.priority;
    }

    if (query.search) {
      filter.title = { $regex: query.search, $options: 'i' };
    }

    const [tasks, total] = await Promise.all([
      this.taskModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate('owner', 'name email')
        .exec(),
      this.taskModel.countDocuments(filter),
    ]);

    return {
      data: tasks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(ownerId: string, taskId: string): Promise<TaskDocument> {
    const task = await this.taskModel
      .findOne({ _id: taskId, owner: ownerId, isDeleted: false })
      .populate('owner', 'name email')
      .exec();
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async update(
    ownerId: string,
    taskId: string,
    dto: UpdateTaskDto,
  ): Promise<TaskDocument> {
    const task = await this.taskModel
      .findOne({ _id: taskId, owner: ownerId, isDeleted: false })
      .exec();
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    Object.assign(task, dto);
    await task.save();
    return task.populate('owner', 'name email');
  }

  async remove(ownerId: string, taskId: string): Promise<void> {
    const task = await this.taskModel
      .findOne({ _id: taskId, owner: ownerId, isDeleted: false })
      .exec();
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    task.isDeleted = true;
    await task.save();
  }

  async restore(ownerId: string, taskId: string): Promise<TaskDocument> {
    const task = await this.taskModel
      .findOne({ _id: taskId, owner: ownerId, isDeleted: true })
      .exec();
    if (!task) {
      throw new NotFoundException('Task not found or not deleted');
    }

    task.isDeleted = false;
    await task.save();
    return task.populate('owner', 'name email');
  }

  async findDeleted(ownerId: string, query: QueryTaskDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filter: QueryFilter<TaskDocument> = {
      owner: ownerId,
      isDeleted: true,
    };

    if (query.search) {
      filter.title = { $regex: query.search, $options: 'i' };
    }

    const [tasks, total] = await Promise.all([
      this.taskModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate('owner', 'name email')
        .exec(),
      this.taskModel.countDocuments(filter),
    ]);

    return {
      data: tasks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
