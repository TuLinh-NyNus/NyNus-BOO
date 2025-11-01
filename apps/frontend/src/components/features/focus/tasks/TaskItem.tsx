/**
 * TaskItem Component
 * ==================
 * Individual task display với checkbox, priority, due date
 *
 * @author NyNus Development Team
 * @version 1.0.0 - Phase 3.1
 * @created 2025-02-01
 */

'use client';

import React from 'react';
import { FocusTask, TaskPriority } from '@/types/focus-task';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Clock, Target } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

// ===== INTERFACES =====

interface TaskItemProps {
  task: FocusTask;
  onToggleComplete?: (taskId: string) => void;
  onEdit?: (task: FocusTask) => void;
  onDelete?: (taskId: string) => void;
}

// ===== COMPONENT =====

export function TaskItem({ task, onToggleComplete, onEdit, onDelete }: TaskItemProps) {
  // Priority color mapping
  const priorityColors = {
    [TaskPriority.LOW]: 'bg-gray-500',
    [TaskPriority.MEDIUM]: 'bg-yellow-500',
    [TaskPriority.HIGH]: 'bg-red-500',
  };

  const priorityLabels = {
    [TaskPriority.LOW]: 'Thấp',
    [TaskPriority.MEDIUM]: 'Trung bình',
    [TaskPriority.HIGH]: 'Cao',
  };

  // Check if overdue
  const isOverdue =
    !task.isCompleted && task.dueDate && new Date(task.dueDate) < new Date();

  // Format due date
  const formatDueDate = (date: Date) => {
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return 'Không xác định';
    }
  };

  return (
    <div
      className={`group flex items-start gap-3 rounded-lg border p-4 transition-colors hover:border-primary/50 ${
        task.isCompleted ? 'bg-muted/30' : 'bg-card'
      }`}
    >
      {/* Checkbox */}
      <Checkbox
        checked={task.isCompleted}
        onCheckedChange={() => onToggleComplete?.(task.id)}
        className="mt-1"
      />

      {/* Content */}
      <div className="flex-1 space-y-2">
        {/* Title */}
        <div className="flex items-start justify-between gap-2">
          <h3
            className={`text-sm font-medium ${
              task.isCompleted ? 'text-muted-foreground line-through' : ''
            }`}
          >
            {task.title}
          </h3>

          {/* Actions (visible on hover) */}
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onEdit?.(task)}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive"
              onClick={() => onDelete?.(task.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Description */}
        {task.description && !task.isCompleted && (
          <p className="text-xs text-muted-foreground">{task.description}</p>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Priority Badge */}
          <Badge variant="secondary" className="gap-1">
            <div className={`h-2 w-2 rounded-full ${priorityColors[task.priority]}`} />
            {priorityLabels[task.priority]}
          </Badge>

          {/* Subject Tag */}
          {task.subjectTag && (
            <Badge variant="outline" className="text-xs">
              {task.subjectTag}
            </Badge>
          )}

          {/* Due Date */}
          {task.dueDate && !task.isCompleted && (
            <span
              className={`flex items-center gap-1 ${
                isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'
              }`}
            >
              <Clock className="h-3 w-3" />
              {formatDueDate(task.dueDate)}
            </span>
          )}

          {/* Pomodoros */}
          {task.estimatedPomodoros && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Target className="h-3 w-3" />
              {task.actualPomodoros}/{task.estimatedPomodoros} 🍅
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskItem;

