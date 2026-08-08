import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, QueryTaskDto } from './dto/create-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @Req() req: AuthenticatedRequest) {
    return this.tasksService.create(createTaskDto, req.user.userId);
  }

  @Get()
  findAll(@Query() query: QueryTaskDto, @Req() req: AuthenticatedRequest) {
    return this.tasksService.findAll(query, req.user.userId);
  }

  @Get('deleted')
  findDeleted(@Req() req: AuthenticatedRequest) {
    return this.tasksService.findDeleted(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.tasksService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Req() req: AuthenticatedRequest) {
    return this.tasksService.update(id, updateTaskDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.tasksService.remove(id, req.user.userId);
  }

  @Post(':id/restore')
  restore(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.tasksService.restore(id, req.user.userId);
  }
}
