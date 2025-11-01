/**
 * Focus Task Types
 * TypeScript interfaces cho task management trong Focus Room
 * 
 * @created 2025-02-01 (Phase 3.1)
 */

// ===== ENUMS =====

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

// ===== INTERFACES =====

/**
 * FocusTask - Main task interface
 * Aligned với backend entity/focus_task.go
 */
export interface FocusTask {
  id: string;
  userId: string;
  title: string;
  description?: string;
  subjectTag?: string;
  priority: TaskPriority;
  isCompleted: boolean;
  dueDate?: Date;
  estimatedPomodoros?: number;
  actualPomodoros: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * TaskFilter - Filter options for listing tasks
 */
export interface TaskFilter {
  completedOnly?: boolean;
  activeOnly?: boolean;
  subjectTag?: string;
  page?: number;
  pageSize?: number;
}

/**
 * CreateTaskInput - Input for creating new task
 */
export interface CreateTaskInput {
  title: string;
  description?: string;
  subjectTag?: string;
  priority: TaskPriority;
  dueDate?: Date;
  estimatedPomodoros?: number;
}

/**
 * UpdateTaskInput - Input for updating task
 */
export interface UpdateTaskInput {
  title?: string;
  description?: string;
  subjectTag?: string;
  priority?: TaskPriority;
  dueDate?: Date;
  estimatedPomodoros?: number;
}

/**
 * TaskListResponse - Response from list tasks API
 */
export interface TaskListResponse {
  tasks: FocusTask[];
  total: number;
}

