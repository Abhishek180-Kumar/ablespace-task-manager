const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  isGuest: boolean;
  username?: string;
  position?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'to-do' | 'doing' | 'on-hold' | 'completed';
  priority: 'none' | 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  tags: string[];
  members: string[];
  reporter?: string;
  owner: User;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  projectId?: string;
  subtasks?: { title: string; completed: boolean; priority?: Task['priority']; assignee?: string; dueDate?: string }[];
  comments?: { userId: string; text: string; createdAt: string }[];
  resources?: { title: string; url: string; description?: string }[];
}

export interface PaginatedTasks {
  data: Task[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  tags?: string[];
  members?: string[];
  reporter?: string;
  projectId?: string;
}

export type UpdateTaskDto = Partial<CreateTaskDto> & {
  subtasks?: { title: string; completed: boolean }[];
  comments?: { userId: string; text: string; createdAt: string }[];
};

export interface QueryTaskDto {
  status?: string;
  priority?: string;
  search?: string;
  projectId?: string;
  page?: number;
  limit?: number;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  status: string;
  priority: 'none' | 'low' | 'medium' | 'high' | 'urgent';
  lead?: string;
  dueDate?: string;
  labels?: string[];
  members?: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  status?: string;
  priority?: string;
  lead?: string;
  dueDate?: string;
  labels?: string[];
  members?: string[];
}

export type UpdateProjectDto = Partial<CreateProjectDto>;

export interface QueryProjectDto {
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedProjects {
  data: Project[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function apiClient(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const raw = await response.text();
  const data = raw ? JSON.parse(raw) : null;

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const message =
      (data && typeof data === 'object' && 'message' in data && data.message) ||
      'An error occurred';
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return data;
}

export const api = {
  auth: {
    register: (data: { name: string; email: string; password: string }) =>
      apiClient('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) =>
      apiClient('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    guestLogin: () => apiClient('/auth/guest-login', { method: 'POST' }),
  },
  users: {
    getMe: () => apiClient('/users/me'),
    updateProfile: (data: { name?: string; email?: string; username?: string; position?: string }) =>
      apiClient('/users/me', { method: 'PATCH', body: JSON.stringify(data) }),
    changePassword: (data: { currentPassword: string; newPassword:string }) =>
      apiClient('/users/me/password', { method: 'PATCH', body: JSON.stringify(data) }),
  },
  projects: {
    create: (data: CreateProjectDto) =>
      apiClient('/projects', { method: 'POST', body: JSON.stringify(data) }),
    findAll: (params?: QueryProjectDto) => {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query.append(key, String(value));
          }
        });
      }
      const qs = query.toString();
      return apiClient(`/projects${qs ? `?${qs}` : ''}`) as Promise<PaginatedProjects>;
    },
    findOne: (id: string) => apiClient(`/projects/${id}`) as Promise<Project>,
    update: (id: string, data: UpdateProjectDto) =>
      apiClient(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) => apiClient(`/projects/${id}`, { method:'DELETE' }),
  },
  tasks: {
    create: (data: CreateTaskDto) => apiClient('/tasks', { method:'POST', body: JSON.stringify(data) }),
    findAll: (params?: QueryTaskDto) => {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query.append(key, String(value));
          }
        });
      }
      const qs = query.toString();
      return apiClient(`/tasks${qs ? `?${qs}` : ''}`);
    },
    findOne: (id: string) => apiClient(`/tasks/${id}`),
    update: (id: string, data: UpdateTaskDto) =>
      apiClient(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) => apiClient(`/tasks/${id}`, { method: 'DELETE' }),
    restore: (id: string) => apiClient(`/tasks/${id}/restore`, { method: 'POST' }),
    findDeleted: (params?: QueryTaskDto) => {
      const query = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query.append(key, String(value));
          }
        });
      }
      const qs = query.toString();
      return apiClient(`/tasks/deleted${qs ? `?${qs}` : ''}`);
    },
  },
};
