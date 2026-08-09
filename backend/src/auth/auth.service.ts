import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model, Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserDocument } from '../users/schemas/user.schema';
import { Task } from '../users/schemas/task.schema';
import { Project } from '../users/schemas/project.schema';

export interface AuthPayload {
  sub: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    isGuest: boolean;
    username?: string;
    position?: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      isGuest: false,
    });
    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.buildAuthResponse(user);
  }

  async guestLogin(): Promise<AuthResponse> {
    const guestNumber = Math.floor(Math.random() * 100000);
    const user = await this.usersService.create({
      name: `Guest_${guestNumber}`,
      email: `guest_${Date.now()}_${guestNumber}@guest.local`,
      isGuest: true,
    });
    await this.seedGuestWorkspace(user._id.toString(), user.name);
    return this.buildAuthResponse(user);
  }

  async googleLogin(profile: { email: string; name: string }): Promise<AuthResponse> {
    let user = await this.usersService.findByEmail(profile.email);
    if (!user) {
      user = await this.usersService.create({
        name: profile.name,
        email: profile.email,
        isGuest: false,
      });
    }
    return this.buildAuthResponse(user);
  }

  private async seedGuestWorkspace(userId: string, userName: string) {
    const ownerId = new Types.ObjectId(userId);
    const project = await this.projectModel.create({
      userId: ownerId,
      name: 'Design Homepage',
      description: 'Example project for exploring the workspace.',
      priority: 'high',
      lead: userName,
      dueDate: new Date('2026-09-12'),
      labels: ['Design'],
    });

    await this.projectModel.create([
      {
        userId: ownerId,
        name: 'Develop Login Feature',
        description: 'Authentication and onboarding improvements.',
        priority: 'low',
        lead: userName,
        dueDate: new Date('2026-09-15'),
        labels: ['Authentication'],
      },
      {
        userId: ownerId,
        name: 'Test Payment Gateway',
        description: 'QA pass for payment workflows.',
        priority: 'medium',
        lead: userName,
        dueDate: new Date('2026-09-18'),
        labels: ['Testing'],
      },
    ]);

    await this.taskModel.create([
      {
        userId: ownerId,
        projectId: project._id.toString(),
        title: 'Write API Documentation',
        description: 'Create clear API notes for inventory and sales metrics.',
        status: 'to-do',
        priority: 'high',
        dueDate: new Date('2026-07-29'),
        tags: ['Deployment', 'Documentation'],
        subtasks: [
          {
            title: 'List endpoints',
            completed: false,
            priority: 'high',
            assignee: userName,
            dueDate: new Date('2026-09-12'),
          },
          {
            title: 'Add examples',
            completed: false,
            priority: 'low',
            assignee: userName,
            dueDate: new Date('2026-09-15'),
          },
        ],
        comments: [
          {
            userId,
            text: 'Guest workspace is ready to explore.',
            createdAt: new Date(),
          },
        ],
        resources: [
          {
            title: 'AbleSpace brief',
            url: 'https://ablespace-task-manager-beta.vercel.app',
          },
        ],
      },
      {
        userId: ownerId,
        projectId: project._id.toString(),
        title: 'Implement Search Function',
        description: 'Filter visible task data from the toolbar.',
        status: 'to-do',
        priority: 'medium',
        dueDate: new Date('2026-07-29'),
        tags: ['Search'],
      },
      {
        userId: ownerId,
        title: 'Code Review Completed',
        description: 'Resolve review feedback and verify builds.',
        status: 'doing',
        priority: 'high',
        dueDate: new Date('2026-07-29'),
        tags: ['Review'],
      },
      {
        userId: ownerId,
        title: 'Feature Testing Passed',
        description: 'Validate the core task flows.',
        status: 'completed',
        priority: 'medium',
        dueDate: new Date('2026-07-30'),
        tags: ['Testing', 'Passed'],
      },
      {
        userId: ownerId,
        title: 'UI Review',
        description: 'Hold pending final screenshots.',
        status: 'on-hold',
        priority: 'low',
        tags: ['Design'],
      },
    ]);
  }

  private buildAuthResponse(user: UserDocument): AuthResponse {
    const payload: AuthPayload = {
      sub: user._id.toString(),
      email: user.email,
    };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        isGuest: user.isGuest,
        username: user.username,
        position: user.position,
      },
    };
  }
}
