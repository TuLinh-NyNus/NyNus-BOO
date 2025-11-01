/**
 * TaskSelector Component
 * ======================
 * Compact dropdown để chọn task trước khi bắt đầu focus session
 *
 * @author NyNus Development Team
 * @version 1.0.0 - Phase 3.1
 * @created 2025-02-01
 */

'use client';

import React, { useEffect, useState } from 'react';
import { FocusTask } from '@/types/focus-task';
import { useActiveTasks, useFocusTasksStore } from '@/stores/focus-tasks.store';
import { FocusTaskService } from '@/services/grpc/focus-task.service';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

// ===== INTERFACES =====

interface TaskSelectorProps {
  selectedTaskId?: string;
  onSelectTask: (taskId: string | undefined) => void;
  onCreateTask?: () => void;
  className?: string;
}

// ===== COMPONENT =====

export function TaskSelector({
  selectedTaskId,
  onSelectTask,
  onCreateTask,
  className,
}: TaskSelectorProps) {
  const { setTasks, setLoading } = useFocusTasksStore();
  const activeTasks = useActiveTasks();
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load active tasks on mount
  useEffect(() => {
    if (!hasLoaded) {
      loadActiveTasks();
    }
  }, [hasLoaded]);

  const loadActiveTasks = async () => {
    setLoading(true);
    try {
      const response = await FocusTaskService.listTasks({
        activeOnly: true,
        pageSize: 20,
      });
      setTasks(response.tasks);
      setHasLoaded(true);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      {/* Task Selector */}
      <Select
        value={selectedTaskId || 'none'}
        onValueChange={(value) => {
          if (value === 'none') {
            onSelectTask(undefined);
          } else {
            onSelectTask(value);
          }
        }}
      >
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Chọn task để làm..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Không chọn task</SelectItem>
          {activeTasks.length > 0 && (
            <>
              {activeTasks.map((task) => (
                <SelectItem key={task.id} value={task.id}>
                  <div className="flex items-center gap-2">
                    <span className="truncate">{task.title}</span>
                    {task.estimatedPomodoros && (
                      <span className="text-xs text-muted-foreground">
                        ({task.actualPomodoros}/{task.estimatedPomodoros} 🍅)
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>

      {/* Quick Add Task Button */}
      {onCreateTask && (
        <Button variant="outline" size="icon" onClick={onCreateTask}>
          <Plus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export default TaskSelector;

