/**
 * TaskForm Component
 * ==================
 * Form để tạo/chỉnh sửa task trong Dialog
 *
 * @author NyNus Development Team
 * @version 1.0.0 - Phase 3.1
 * @created 2025-02-01
 */

'use client';

import React, { useState, useEffect } from 'react';
import { FocusTask, TaskPriority, CreateTaskInput, UpdateTaskInput } from '@/types/focus-task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

// ===== INTERFACES =====

interface TaskFormProps {
  task?: FocusTask; // If provided, edit mode
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateTaskInput | UpdateTaskInput) => Promise<void>;
}

// ===== COMPONENT =====

export function TaskForm({ task, open, onOpenChange, onSubmit }: TaskFormProps) {
  const [formData, setFormData] = useState<CreateTaskInput>({
    title: '',
    priority: TaskPriority.MEDIUM,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form khi edit task
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        subjectTag: task.subjectTag,
        priority: task.priority,
        dueDate: task.dueDate,
        estimatedPomodoros: task.estimatedPomodoros,
      });
    } else {
      // Reset form khi tạo mới
      setFormData({
        title: '',
        priority: TaskPriority.MEDIUM,
      });
    }
  }, [task, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to submit task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof CreateTaskInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{task ? 'Chỉnh sửa Task' : 'Tạo Task Mới'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Tiêu đề <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Ví dụ: Hoàn thành bài tập Toán"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              maxLength={500}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Thêm mô tả chi tiết..."
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* Row: Priority + Subject */}
          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Độ ưu tiên</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleChange('priority', value as TaskPriority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TaskPriority.LOW}>Thấp</SelectItem>
                  <SelectItem value={TaskPriority.MEDIUM}>Trung bình</SelectItem>
                  <SelectItem value={TaskPriority.HIGH}>Cao</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subject Tag */}
            <div className="space-y-2">
              <Label htmlFor="subjectTag">Môn học</Label>
              <Input
                id="subjectTag"
                placeholder="Toán, Lý, Hóa..."
                value={formData.subjectTag || ''}
                onChange={(e) => handleChange('subjectTag', e.target.value)}
              />
            </div>
          </div>

          {/* Row: Due Date + Pomodoros */}
          <div className="grid grid-cols-2 gap-4">
            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="dueDate">Hạn hoàn thành</Label>
              <Input
                id="dueDate"
                type="date"
                value={
                  formData.dueDate
                    ? new Date(formData.dueDate).toISOString().split('T')[0]
                    : ''
                }
                onChange={(e) =>
                  handleChange('dueDate', e.target.value ? new Date(e.target.value) : undefined)
                }
              />
            </div>

            {/* Estimated Pomodoros */}
            <div className="space-y-2">
              <Label htmlFor="estimatedPomodoros">Số Pomodoros dự kiến</Label>
              <Input
                id="estimatedPomodoros"
                type="number"
                min="0"
                max="50"
                placeholder="0"
                value={formData.estimatedPomodoros || ''}
                onChange={(e) =>
                  handleChange(
                    'estimatedPomodoros',
                    e.target.value ? parseInt(e.target.value, 10) : undefined
                  )
                }
              />
            </div>
          </div>

          {/* Footer */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.title.trim()}>
              {isSubmitting ? 'Đang lưu...' : task ? 'Cập nhật' : 'Tạo Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default TaskForm;

