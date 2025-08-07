'use client';

import { BookOpen, Save, X } from 'lucide-react';
import React from 'react';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea
} from '@/components/ui';
import logger from '@/lib/utils/logger';


/**
 * Course Form Component
 * 
 * Component form để tạo/chỉnh sửa khóa học
 * Placeholder component - cần implement đầy đủ functionality
 */

interface CourseFormProps {
  courseId?: string;
  onSave?: (data: unknown) => void;
  onCancel?: () => void;
}

function CourseForm({ courseId, onSave, onCancel }: CourseFormProps): JSX.Element {
  const isEditing = !!courseId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission logic
    logger.info('Course form submitted');
    onSave?.({});
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>
                {isEditing ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}
              </CardTitle>
              <CardDescription>
                {isEditing 
                  ? 'Cập nhật thông tin khóa học' 
                  : 'Điền thông tin để tạo khóa học mới'
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tên khóa học */}
            <div className="space-y-2">
              <Label htmlFor="title">Tên khóa học *</Label>
              <Input
                id="title"
                placeholder="Nhập tên khóa học..."
                required
              />
            </div>

            {/* Mô tả */}
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả khóa học</Label>
              <Textarea
                id="description"
                placeholder="Mô tả chi tiết về khóa học..."
                rows={4}
              />
            </div>

            {/* Giảng viên */}
            <div className="space-y-2">
              <Label htmlFor="instructor">Giảng viên *</Label>
              <Input
                id="instructor"
                placeholder="Tên giảng viên..."
                required
              />
            </div>

            {/* Thời lượng */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Thời lượng (phút)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="120"
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Giá (VNĐ)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            {/* Danh mục */}
            <div className="space-y-2">
              <Label htmlFor="category">Danh mục</Label>
              <Input
                id="category"
                placeholder="Toán học, Vật lý, Hóa học..."
              />
            </div>

            {/* Mức độ */}
            <div className="space-y-2">
              <Label htmlFor="level">Mức độ</Label>
              <select 
                id="level"
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="">Chọn mức độ</option>
                <option value="beginner">Cơ bản</option>
                <option value="intermediate">Trung bình</option>
                <option value="advanced">Nâng cao</option>
              </select>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                <X className="h-4 w-4 mr-2" />
                Hủy
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Cập nhật' : 'Tạo khóa học'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Default export for lazy loading
export default CourseForm;

