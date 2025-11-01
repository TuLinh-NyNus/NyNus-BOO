/**
 * Focus Tasks Store (Zustand)
 * ============================
 * State management cho task list trong Focus Room
 *
 * @author NyNus Development Team
 * @version 1.0.0 - Phase 3.1
 * @created 2025-02-01
 */

import { create } from 'zustand';
import { FocusTask, TaskFilter } from '@/types/focus-task';

// ===== STATE INTERFACE =====

interface FocusTasksState {
  // State
  tasks: FocusTask[];
  filter: TaskFilter;
  selectedTask: FocusTask | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setTasks: (tasks: FocusTask[]) => void;
  addTask: (task: FocusTask) => void;
  updateTask: (taskId: string, updates: Partial<FocusTask>) => void;
  removeTask: (taskId: string) => void;
  toggleComplete: (taskId: string) => void;
  setFilter: (filter: Partial<TaskFilter>) => void;
  setSelectedTask: (task: FocusTask | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearTasks: () => void;
}

// ===== STORE IMPLEMENTATION =====

export const useFocusTasksStore = create<FocusTasksState>((set, get) => ({
  // Initial state
  tasks: [],
  filter: {
    activeOnly: true,
    page: 1,
    pageSize: 50,
  },
  selectedTask: null,
  isLoading: false,
  error: null,

  // Actions
  setTasks: (tasks) => set({ tasks }),

  addTask: (task) =>
    set((state) => ({
      tasks: [task, ...state.tasks],
    })),

  updateTask: (taskId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      ),
      selectedTask:
        state.selectedTask?.id === taskId
          ? { ...state.selectedTask, ...updates }
          : state.selectedTask,
    })),

  removeTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
      selectedTask: state.selectedTask?.id === taskId ? null : state.selectedTask,
    })),

  toggleComplete: (taskId) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              isCompleted: !task.isCompleted,
              completedAt: !task.isCompleted ? new Date() : undefined,
            }
          : task
      ),
    })),

  setFilter: (filter) =>
    set((state) => ({
      filter: { ...state.filter, ...filter },
    })),

  setSelectedTask: (task) => set({ selectedTask: task }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearTasks: () =>
    set({
      tasks: [],
      selectedTask: null,
      error: null,
    }),
}));

// ===== SELECTORS =====

/**
 * Get active tasks (not completed)
 */
export const useActiveTasks = () => {
  return useFocusTasksStore((state) => state.tasks.filter((task) => !task.isCompleted));
};

/**
 * Get completed tasks
 */
export const useCompletedTasks = () => {
  return useFocusTasksStore((state) => state.tasks.filter((task) => task.isCompleted));
};

/**
 * Get tasks by subject
 */
export const useTasksBySubject = (subject: string) => {
  return useFocusTasksStore((state) =>
    state.tasks.filter((task) => task.subjectTag === subject)
  );
};

/**
 * Get overdue tasks
 */
export const useOverdueTasks = () => {
  const now = new Date();
  return useFocusTasksStore((state) =>
    state.tasks.filter(
      (task) => !task.isCompleted && task.dueDate && new Date(task.dueDate) < now
    )
  );
};

export default useFocusTasksStore;

