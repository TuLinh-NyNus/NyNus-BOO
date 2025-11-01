/**
 * TaskList Component
 * ==================
 * Main container cho task management với filters và CRUD operations
 *
 * @author NyNus Development Team
 * @version 1.0.0 - Phase 3.1
 * @created 2025-02-01
 */

'use client';

import React, { useState, useEffect } from 'react';
import { FocusTask, CreateTaskInput, UpdateTaskInput, TaskFilter } from '@/types/focus-task';
import { useFocusTasksStore } from '@/stores/focus-tasks.store';
import { FocusTaskService } from '@/services/grpc/focus-task.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { TaskItem } from './TaskItem';
import { TaskForm } from './TaskForm';
import { useToast } from '@/hooks/ui/use-toast';

// ===== INTERFACES =====

interface TaskListProps {
  className?: string;
}

// ===== COMPONENT =====

export function TaskList({ className }: TaskListProps) {
  const {
    tasks,
    filter,
    isLoading,
    error,
    setTasks,
    addTask,
    updateTask: updateTaskInStore,
    removeTask,
    toggleComplete: toggleCompleteInStore,
    setFilter,
    setLoading,
    setError,
  } = useFocusTasksStore();

  const { toast } = useToast();

  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<FocusTask | undefined>();

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, [filter]);

  // Load tasks từ API
  const loadTasks = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await FocusTaskService.listTasks(filter);
      setTasks(response.tasks);
    } catch (err: any) {
      console.error('Failed to load tasks:', err);
      setError(err.message || 'Không thể tải danh sách task');
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tải danh sách task. Vui lòng thử lại.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Create hoặc Update task
  const handleSubmitTask = async (data: CreateTaskInput | UpdateTaskInput) => {
    try {
      if (editingTask) {
        // Update existing task
        const updated = await FocusTaskService.updateTask(editingTask.id, data as UpdateTaskInput);
        updateTaskInStore(editingTask.id, updated);
        toast({
          title: 'Thành công',
          description: 'Task đã được cập nhật',
        });
      } else {
        // Create new task
        const created = await FocusTaskService.createTask(data as CreateTaskInput);
        addTask(created);
        toast({
          title: 'Thành công',
          description: 'Task đã được tạo',
        });
      }
    } catch (err: any) {
      console.error('Failed to submit task:', err);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: err.message || 'Không thể lưu task',
      });
      throw err; // Re-throw để TaskForm xử lý
    }
  };

  // Toggle task completion
  const handleToggleComplete = async (taskId: string) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      if (!task.isCompleted) {
        // Mark as complete
        await FocusTaskService.completeTask(taskId);
        toggleCompleteInStore(taskId);
        toast({
          title: 'Hoàn thành!',
          description: 'Task đã được đánh dấu hoàn thành 🎉',
        });
      } else {
        // Uncomplete (would need backend support)
        toggleCompleteInStore(taskId);
      }
    } catch (err: any) {
      console.error('Failed to toggle task:', err);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể cập nhật task',
      });
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Bạn có chắc muốn xóa task này?')) return;

    try {
      await FocusTaskService.deleteTask(taskId);
      removeTask(taskId);
      toast({
        title: 'Đã xóa',
        description: 'Task đã được xóa',
      });
    } catch (err: any) {
      console.error('Failed to delete task:', err);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể xóa task',
      });
    }
  };

  // Open create form
  const handleCreateTask = () => {
    setEditingTask(undefined);
    setTaskFormOpen(true);
  };

  // Open edit form
  const handleEditTask = (task: FocusTask) => {
    setEditingTask(task);
    setTaskFormOpen(true);
  };

  // Filter tasks locally
  const activeTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Tasks</CardTitle>
        <Button size="sm" onClick={handleCreateTask}>
          <Plus className="mr-1 h-4 w-4" />
          Thêm Task
        </Button>
      </CardHeader>

      <CardContent>
        {/* Tabs: All / Active / Completed */}
        <Tabs defaultValue="active" onValueChange={(value) => {
          if (value === 'active') {
            setFilter({ activeOnly: true, completedOnly: false });
          } else if (value === 'completed') {
            setFilter({ activeOnly: false, completedOnly: true });
          } else {
            setFilter({ activeOnly: false, completedOnly: false });
          }
        }}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Tất cả ({tasks.length})</TabsTrigger>
            <TabsTrigger value="active">Đang làm ({activeTasks.length})</TabsTrigger>
            <TabsTrigger value="completed">Hoàn thành ({completedTasks.length})</TabsTrigger>
          </TabsList>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center justify-center gap-2 py-12 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Task List */}
          {!isLoading && !error && (
            <>
              <TabsContent value="all" className="space-y-2">
                {tasks.length === 0 ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    Chưa có task nào. Tạo task đầu tiên!
                  </div>
                ) : (
                  tasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggleComplete={handleToggleComplete}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="active" className="space-y-2">
                {activeTasks.length === 0 ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    Không có task đang làm
                  </div>
                ) : (
                  activeTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggleComplete={handleToggleComplete}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-2">
                {completedTasks.length === 0 ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    Chưa có task nào hoàn thành
                  </div>
                ) : (
                  completedTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggleComplete={handleToggleComplete}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                    />
                  ))
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </CardContent>

      {/* Task Form Dialog */}
      <TaskForm
        task={editingTask}
        open={taskFormOpen}
        onOpenChange={(open) => {
          setTaskFormOpen(open);
          if (!open) setEditingTask(undefined);
        }}
        onSubmit={handleSubmitTask}
      />
    </Card>
  );
}

export default TaskList;

