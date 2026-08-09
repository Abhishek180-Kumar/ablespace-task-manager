import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project } from '../users/schemas/project.schema';
import {
  CreateProjectDto,
  QueryProjectDto,
  UpdateProjectDto,
} from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto, userId: string) {
    return this.projectModel.create({
      ...createProjectDto,
      userId: new Types.ObjectId(userId),
    });
  }

  async findAll(query: QueryProjectDto, userId: string) {
    const filter: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
    };
    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;
    if (query.search) filter.name = { $regex: query.search, $options: 'i' };

    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    const skip = (page - 1) * limit;
    const data = await this.projectModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
    const total = await this.projectModel.countDocuments(filter);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, userId: string) {
    const project = await this.projectModel
      .findOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string) {
    const project = await this.projectModel
      .findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        updateProjectDto,
        { new: true },
      )
      .exec();
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async remove(id: string, userId: string) {
    const project = await this.projectModel
      .findOneAndDelete({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (!project) throw new NotFoundException('Project not found');
    return { deleted: true };
  }
}
