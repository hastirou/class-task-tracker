import { prisma } from '../../db/prisma.js';
import { ForbiddenError, NotFoundError, UnauthorizedError, ValidationError } from '../../utils/errors.js';
import type { AuthUser } from '../../middleware/auth.js';

export interface TaskInput {
  title: string;
  description?: string;
  dueDate: Date;
  className: string;
}

export interface TaskUpdateInput {
  title?: string;
  description?: string;
  dueDate?: Date;
  className?: string;
}

export interface TaskQuery {
  search?: string;
  status?: 'done' | 'pending';
  className?: string;
  page: number;
  pageSize: number;
}

export interface PaginatedTasks {
  tasks: TaskWithStatus[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface TaskWithStatus {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date;
  className: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  completed: boolean;
  completedAt: Date | null;
}

const getStudentClass = (user: AuthUser): string => {
  if (!user.className) {
    throw ValidationError('Student class not set');
  }
  return user.className;
};

const buildTitleFilter = (search?: string) =>
  search ? { title: { contains: search.trim(), mode: 'insensitive' as const } } : {};

interface RawTask {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date;
  className: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  completions: { completedAt: Date | null }[];
}

const mapTaskWithCompletion = (task: RawTask, status?: 'done' | 'pending'): TaskWithStatus | null => {
  const completion = task.completions[0];
  const completed = Boolean(completion);
  const completedAt = completion?.completedAt ?? null;

  if (status === 'done' && !completed) return null;
  if (status === 'pending' && completed) return null;

  return { ...task, completed, completedAt };
};

export const create = async (input: TaskInput, user: AuthUser): Promise<TaskWithStatus> => {
  if (user.role !== 'TEACHER') {
    throw UnauthorizedError();
  }

  const task = await prisma.task.create({
    data: {
      title: input.title.trim(),
      description: input.description?.trim() ?? null,
      dueDate: input.dueDate,
      className: input.className.trim(),
      createdById: user.userId,
    },
  });

  return { ...task, completed: false, completedAt: null };
};

export const list = async (query: TaskQuery, user: AuthUser): Promise<PaginatedTasks> => {
  const skip = (query.page - 1) * query.pageSize;

  if (user.role === 'STUDENT') {
    const className = getStudentClass(user);

    const where = {
      className,
      ...buildTitleFilter(query.search),
    };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: { dueDate: 'asc' },
        skip,
        take: query.pageSize,
        include: {
          completions: {
            where: { studentId: user.userId },
            select: { completedAt: true },
          },
        },
      }),
      prisma.task.count({ where }),
    ]);

    const mapped = tasks
      .map((task) => mapTaskWithCompletion(task, query.status))
      .filter((t): t is TaskWithStatus => t !== null);

    return {
      tasks: mapped,
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize),
      },
    };
  }

  // Teacher view
  const where = {
    createdById: user.userId,
    ...(query.className ? { className: query.className.trim() } : {}),
    ...buildTitleFilter(query.search),
  };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy: { dueDate: 'asc' },
      skip,
      take: query.pageSize,
    }),
    prisma.task.count({ where }),
  ]);

  return {
    tasks: tasks.map((task) => ({ ...task, completed: false, completedAt: null })),
    meta: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.ceil(total / query.pageSize),
    },
  };
};

export const getById = async (id: string, user: AuthUser): Promise<TaskWithStatus> => {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      completions: {
        where: user.role === 'STUDENT' ? { studentId: user.userId } : undefined,
        select: { completedAt: true },
      },
    },
  });

  if (!task) {
    throw NotFoundError('Task');
  }

  if (user.role === 'STUDENT') {
    if (task.className !== getStudentClass(user)) {
      throw NotFoundError('Task');
    }
  } else if (task.createdById !== user.userId) {
    throw ForbiddenError();
  }

  const completion = task.completions[0];
  return { ...task, completed: Boolean(completion), completedAt: completion?.completedAt ?? null };
};

export const update = async (id: string, input: TaskUpdateInput, user: AuthUser): Promise<TaskWithStatus> => {
  if (user.role !== 'TEACHER') {
    throw UnauthorizedError();
  }

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      completions: {
        select: { completedAt: true },
      },
    },
  });

  if (!task) {
    throw NotFoundError('Task');
  }

  if (task.createdById !== user.userId) {
    throw ForbiddenError();
  }

  const updated = await prisma.task.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: input.title.trim() }),
      ...(input.description !== undefined && { description: input.description?.trim() ?? null }),
      ...(input.dueDate !== undefined && { dueDate: input.dueDate }),
      ...(input.className !== undefined && { className: input.className.trim() }),
    },
    include: {
      completions: {
        select: { completedAt: true },
      },
    },
  });

  const completion = updated.completions[0];
  return {
    ...updated,
    completed: Boolean(completion),
    completedAt: completion?.completedAt ?? null,
  };
};

export const remove = async (id: string, user: AuthUser): Promise<void> => {
  if (user.role !== 'TEACHER') {
    throw UnauthorizedError();
  }

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) {
    throw NotFoundError('Task');
  }

  if (task.createdById !== user.userId) {
    throw ForbiddenError();
  }

  await prisma.task.delete({ where: { id } });
};

export const complete = async (id: string, user: AuthUser): Promise<void> => {
  if (user.role !== 'STUDENT') {
    throw UnauthorizedError('Only students can complete tasks');
  }

  const className = getStudentClass(user);
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.className !== className) {
    throw NotFoundError('Task');
  }

  await prisma.taskCompletion.upsert({
    where: {
      taskId_studentId: {
        taskId: id,
        studentId: user.userId,
      },
    },
    create: {
      taskId: id,
      studentId: user.userId,
    },
    update: {},
  });
};

export const uncomplete = async (id: string, user: AuthUser): Promise<void> => {
  if (user.role !== 'STUDENT') {
    throw UnauthorizedError('Only students can uncomplete tasks');
  }

  const className = getStudentClass(user);
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.className !== className) {
    throw NotFoundError('Task');
  }

  await prisma.taskCompletion.deleteMany({
    where: {
      taskId: id,
      studentId: user.userId,
    },
  });
};
