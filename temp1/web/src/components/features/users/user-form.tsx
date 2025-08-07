'use client';

import { 
  User, 
  Save, 
  X, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Shield
} from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/display/avatar";
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/form/label";
import logger from '@/lib/utils/logger';

/**
 * User Form Component
 * 
 * Component form để tạo/chỉnh sửa thông tin người dùng
 * Placeholder component - cần implement đầy đủ functionality
 */

interface UserFormProps {
  userId?: string;
  onSave?: (data: unknown) => void;
  onCancel?: () => void;
}

function UserForm({ userId, onSave, onCancel }: UserFormProps): JSX.Element {
  const isEditing = !!userId;

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    // TODO: Implement form submission logic
    logger.info('User form submitted');
    onSave?.({});
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <User className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>
                {isEditing ? 'Chỉnh sửa người dùng' : 'Tạo người dùng mới'}
              </CardTitle>
              <CardDescription>
                {isEditing 
                  ? 'Cập nhật thông tin người dùng' 
                  : 'Điền thông tin để tạo tài khoản mới'
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="" />
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <Button type="button" variant="outline" size="sm">
                  Thay đổi ảnh
                </Button>
                <p className="text-sm text-muted-foreground mt-1">
                  JPG, PNG tối đa 2MB
                </p>
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Tên *</Label>
                <Input
                  id="firstName"
                  placeholder="Nhập tên..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Họ *</Label>
                <Input
                  id="lastName"
                  placeholder="Nhập họ..."
                  required
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0123456789"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Role and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Vai trò *</Label>
                <select 
                  id="role"
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  required
                >
                  <option value="">Chọn vai trò</option>
                  <option value="STUDENT">Học viên</option>
                  <option value="INSTRUCTOR">Giảng viên</option>
                  <option value="TEACHER">Giáo viên</option>
                  <option value="ADMIN">Quản trị viên</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <select 
                  id="status"
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                >
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Không hoạt động</option>
                  <option value="SUSPENDED">Tạm khóa</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="address"
                  placeholder="Nhập địa chỉ..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Ngày sinh</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dateOfBirth"
                  type="date"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Password Section (for new users) */}
            {!isEditing && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Nhập mật khẩu..."
                    required={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Xác nhận mật khẩu..."
                    required={!isEditing}
                  />
                </div>
              </div>
            )}

            {/* Permissions (for admin users) */}
            <div className="space-y-2">
              <Label>Quyền hạn</Label>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                  <Shield className="h-3 w-3 mr-1" />
                  Quản lý khóa học
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                  <Shield className="h-3 w-3 mr-1" />
                  Quản lý người dùng
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                  <Shield className="h-3 w-3 mr-1" />
                  Quản lý bài thi
                </Badge>
              </div>
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
                {isEditing ? 'Cập nhật' : 'Tạo tài khoản'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Default export for lazy loading
export default UserForm;
