import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  QueryTaskDto,
} from './dto/create-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(
    @Body() createTaskDto: CreateTaskDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tasksService.create(req.user.userId, createTaskDto);
  }

  @Get()
  findAll(@Query() query: QueryTaskDto, @Request() req: AuthenticatedRequest) {
    return this.tasksService.findAll(req.user.userId, query);
  }

  @Get('deleted')
  findDeleted(
    @Query() query: QueryTaskDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tasksService.findDeleted(req.user.userId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.tasksService.findOne(req.user.userId, id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tasksService.update(req.user.userId, id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.tasksService.remove(req.user.userId, id);
  }

  @Post(':id/restore')
  restore(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.tasksService.restore(req.user.userId, id);
  }
}
