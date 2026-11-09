export interface ApiError {
  code: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'TEACHER' | 'STUDENT';
  className?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  className: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  completed: boolean;
  completedAt: string | null;
}

export interface TaskInput {
  title: string;
  description?: string;
  dueDate: string;
  className: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface TaskListResponse {
  data: Task[];
  meta: PaginationMeta;
}
