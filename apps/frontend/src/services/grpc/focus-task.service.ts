/**
 * Focus Task Service Client (gRPC-Web)
 * =====================================
 * gRPC client implementation for Task CRUD operations
 *
 * @author NyNus Development Team
 * @version 1.0.0 - Phase 3.1
 * @created 2025-02-01
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// gRPC-Web imports
import { FocusRoomServiceClient } from '@/generated/v1/Focus_roomServiceClientPb';
import {
  Task as PbTask,
  CreateTaskRequest,
  UpdateTaskRequest,
  DeleteTaskRequest,
  ListTasksRequest,
  CompleteTaskRequest,
  ListTasksResponse,
  TaskPriority as PbTaskPriority,
} from '@/generated/v1/focus_room_pb';
import { RpcError } from 'grpc-web';

// Frontend types
import {
  FocusTask,
  TaskPriority,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilter,
  TaskListResponse,
} from '@/types/focus-task';

// gRPC client utilities
import { getAuthMetadata } from './client';
import { createGrpcClient } from './client-factory';

// ===== gRPC CLIENT INITIALIZATION =====

const getFocusRoomServiceClient = createGrpcClient(FocusRoomServiceClient, 'FocusRoomService');

// ===== MAPPERS =====

/**
 * Map protobuf Task to frontend FocusTask
 */
function mapTaskFromPb(pbTask: PbTask): FocusTask {
  const priorityValue = pbTask.getPriority();
  let priority: TaskPriority = TaskPriority.MEDIUM;
  if (priorityValue === PbTaskPriority.TASK_PRIORITY_LOW) {
    priority = TaskPriority.LOW;
  } else if (priorityValue === PbTaskPriority.TASK_PRIORITY_HIGH) {
    priority = TaskPriority.HIGH;
  }

  const task: FocusTask = {
    id: pbTask.getId(),
    userId: pbTask.getUserId(),
    title: pbTask.getTitle(),
    priority,
    isCompleted: pbTask.getIsCompleted(),
    actualPomodoros: pbTask.getActualPomodoros(),
    createdAt: pbTask.getCreatedAt()?.toDate() || new Date(),
    updatedAt: pbTask.getUpdatedAt()?.toDate() || new Date(),
  };

  // Optional fields
  if (pbTask.getDescription()) {
    task.description = pbTask.getDescription();
  }

  if (pbTask.getSubjectTag()) {
    task.subjectTag = pbTask.getSubjectTag();
  }

  if (pbTask.getDueDate()) {
    task.dueDate = new Date(pbTask.getDueDate());
  }

  if (pbTask.getEstimatedPomodoros() > 0) {
    task.estimatedPomodoros = pbTask.getEstimatedPomodoros();
  }

  if (pbTask.getCompletedAt()) {
    task.completedAt = pbTask.getCompletedAt()?.toDate();
  }

  return task;
}

/**
 * Map frontend TaskPriority to protobuf enum
 */
function mapTaskPriorityToPb(priority: TaskPriority): PbTaskPriority {
  switch (priority) {
    case TaskPriority.LOW:
      return PbTaskPriority.TASK_PRIORITY_LOW;
    case TaskPriority.HIGH:
      return PbTaskPriority.TASK_PRIORITY_HIGH;
    default:
      return PbTaskPriority.TASK_PRIORITY_MEDIUM;
  }
}

// ===== SERVICE METHODS =====

/**
 * Create a new task
 */
export async function createTask(input: CreateTaskInput): Promise<FocusTask> {
  const client = getFocusRoomServiceClient();
  const metadata = await getAuthMetadata();

  const request = new CreateTaskRequest();
  request.setTitle(input.title);
  request.setPriority(mapTaskPriorityToPb(input.priority));

  if (input.description) {
    request.setDescription(input.description);
  }

  if (input.subjectTag) {
    request.setSubjectTag(input.subjectTag);
  }

  if (input.dueDate) {
    request.setDueDate(input.dueDate.toISOString().split('T')[0]); // YYYY-MM-DD
  }

  if (input.estimatedPomodoros) {
    request.setEstimatedPomodoros(input.estimatedPomodoros);
  }

  return new Promise((resolve, reject) => {
    client.createTask(request, metadata, (err: RpcError | null, response: PbTask | null) => {
      if (err) {
        console.error('[FocusTaskService] createTask error:', err);
        reject(new Error(err.message));
        return;
      }

      if (!response) {
        reject(new Error('No response from server'));
        return;
      }

      resolve(mapTaskFromPb(response));
    });
  });
}

/**
 * Update an existing task
 */
export async function updateTask(
  taskId: string,
  input: UpdateTaskInput
): Promise<FocusTask> {
  const client = getFocusRoomServiceClient();
  const metadata = await getAuthMetadata();

  const request = new UpdateTaskRequest();
  request.setTaskId(taskId);

  if (input.title) {
    request.setTitle(input.title);
  }

  if (input.description !== undefined) {
    request.setDescription(input.description);
  }

  if (input.subjectTag !== undefined) {
    request.setSubjectTag(input.subjectTag);
  }

  if (input.priority) {
    request.setPriority(mapTaskPriorityToPb(input.priority));
  }

  if (input.dueDate) {
    request.setDueDate(input.dueDate.toISOString().split('T')[0]);
  }

  if (input.estimatedPomodoros !== undefined) {
    request.setEstimatedPomodoros(input.estimatedPomodoros);
  }

  return new Promise((resolve, reject) => {
    client.updateTask(request, metadata, (err: RpcError | null, response: PbTask | null) => {
      if (err) {
        console.error('[FocusTaskService] updateTask error:', err);
        reject(new Error(err.message));
        return;
      }

      if (!response) {
        reject(new Error('No response from server'));
        return;
      }

      resolve(mapTaskFromPb(response));
    });
  });
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string): Promise<void> {
  const client = getFocusRoomServiceClient();
  const metadata = await getAuthMetadata();

  const request = new DeleteTaskRequest();
  request.setTaskId(taskId);

  return new Promise((resolve, reject) => {
    client.deleteTask(request, metadata, (err: RpcError | null) => {
      if (err) {
        console.error('[FocusTaskService] deleteTask error:', err);
        reject(new Error(err.message));
        return;
      }

      resolve();
    });
  });
}

/**
 * List tasks with filters
 */
export async function listTasks(filter: TaskFilter = {}): Promise<TaskListResponse> {
  const client = getFocusRoomServiceClient();
  const metadata = await getAuthMetadata();

  const request = new ListTasksRequest();

  if (filter.completedOnly) {
    request.setCompletedOnly(true);
  }

  if (filter.activeOnly) {
    request.setActiveOnly(true);
  }

  if (filter.subjectTag) {
    request.setSubjectTag(filter.subjectTag);
  }

  if (filter.page) {
    request.setPage(filter.page);
  }

  if (filter.pageSize) {
    request.setPageSize(filter.pageSize);
  }

  return new Promise((resolve, reject) => {
    client.listTasks(
      request,
      metadata,
      (err: RpcError | null, response: ListTasksResponse | null) => {
        if (err) {
          console.error('[FocusTaskService] listTasks error:', err);
          reject(new Error(err.message));
          return;
        }

        if (!response) {
          reject(new Error('No response from server'));
          return;
        }

        const tasks = response.getTasksList().map(mapTaskFromPb);

        resolve({
          tasks,
          total: response.getTotal(),
        });
      }
    );
  });
}

/**
 * Mark a task as completed
 */
export async function completeTask(taskId: string): Promise<FocusTask> {
  const client = getFocusRoomServiceClient();
  const metadata = await getAuthMetadata();

  const request = new CompleteTaskRequest();
  request.setTaskId(taskId);

  return new Promise((resolve, reject) => {
    client.completeTask(request, metadata, (err: RpcError | null, response: PbTask | null) => {
      if (err) {
        console.error('[FocusTaskService] completeTask error:', err);
        reject(new Error(err.message));
        return;
      }

      if (!response) {
        reject(new Error('No response from server'));
        return;
      }

      resolve(mapTaskFromPb(response));
    });
  });
}

/**
 * Export all task service functions
 */
export const FocusTaskService = {
  createTask,
  updateTask,
  deleteTask,
  listTasks,
  completeTask,
};

export default FocusTaskService;

