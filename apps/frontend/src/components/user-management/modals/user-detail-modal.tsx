'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/overlay/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/form/label';
import { Textarea } from '@/components/ui/form/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Activity,
  TrendingUp,
  AlertTriangle,
  Clock,
  Globe,
  Edit,
  Save,
  X,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { AdminUser } from '@/lib/mockdata/types';
import { UserRole, UserStatus } from '@/lib/mockdata/core-types';

// ===== INTERFACES =====

/**
 * Props cho UserDetailModal component
 */
interface UserDetailModalProps {
  user: AdminUser | null;                                       // User data để hiển thị
  isOpen: boolean;                                              // Modal có đang mở không
  onClose: () => void;                                          // Callback khi đóng modal
  onUserUpdate?: (updatedUser: AdminUser) => void;             // Callback khi user được update
  className?: string;
}

/**
 * Form data cho edit user
 */
interface EditUserForm {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  bio: string;
  address: string;
  school: string;
  role: UserRole;
  status: UserStatus;
  level: number | null;
  maxConcurrentSessions: number;
}

// ===== CONSTANTS =====

/**
 * Role options cho select dropdown
 */
const ROLE_OPTIONS = [
  { value: UserRole.GUEST, label: 'Khách' },
  { value: UserRole.STUDENT, label: 'Học sinh' },
  { value: UserRole.TUTOR, label: 'Gia sư' },
  { value: UserRole.TEACHER, label: 'Giáo viên' },
  { value: UserRole.ADMIN, label: 'Quản trị viên' },
];

/**
 * Status options cho select dropdown
 */
const STATUS_OPTIONS = [
  { value: UserStatus.ACTIVE, label: 'Hoạt động' },
  { value: UserStatus.INACTIVE, label: 'Không hoạt động' },
  { value: UserStatus.SUSPENDED, label: 'Tạm ngưng' },
  { value: UserStatus.PENDING_VERIFICATION, label: 'Chờ xác thực' },
];

// ===== HELPER FUNCTIONS =====

/**
 * Format date cho hiển thị
 */
function formatDate(date: Date | string | undefined): string {
  if (!date) return 'Chưa có';
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format risk score với color
 */
function formatRiskScore(score: number | undefined): { text: string; color: string } {
  if (score === undefined || score === null) {
    return { text: 'N/A', color: 'text-gray-500' };
  }
  
  if (score <= 30) {
    return { text: score.toString(), color: 'text-green-600' };
  } else if (score <= 70) {
    return { text: score.toString(), color: 'text-yellow-600' };
  } else {
    return { text: score.toString(), color: 'text-red-600' };
  }
}

/**
 * Get user display name
 */
function getUserDisplayName(user: AdminUser): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.username || user.email.split('@')[0];
}

/**
 * Convert AdminUser to EditUserForm
 */
function userToForm(user: AdminUser): EditUserForm {
  return {
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    username: user.username || '',
    email: user.email,
    phone: user.phone || '',
    bio: user.bio || '',
    address: user.address || '',
    school: user.school || '',
    role: user.role,
    status: user.status,
    level: user.level ?? null,
    maxConcurrentSessions: user.maxConcurrentSessions,
  };
}

// ===== MAIN COMPONENT =====

/**
 * User Detail Modal Component với Enhanced User Model support
 * Hiển thị chi tiết user và cho phép edit thông tin
 */
export function UserDetailModal({
  user,
  isOpen,
  onClose,
  onUserUpdate,
  className = ''
}: UserDetailModalProps) {
  // ===== STATES =====
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<EditUserForm>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    bio: '',
    address: '',
    school: '',
    role: UserRole.STUDENT,
    status: UserStatus.ACTIVE,
    level: null,
    maxConcurrentSessions: 3,
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // ===== EFFECTS =====

  /**
   * Update form khi user thay đổi
   */
  useEffect(() => {
    if (user) {
      setEditForm(userToForm(user));
    }
  }, [user]);

  /**
   * Reset editing state khi modal đóng
   */
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setIsSaving(false);
    }
  }, [isOpen]);

  // ===== EVENT HANDLERS =====

  /**
   * Handle form field change
   */
  const handleFormChange = useCallback((field: keyof EditUserForm, value: string | number | UserRole | UserStatus | null) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  }, []);

  /**
   * Handle save changes
   */
  const handleSave = useCallback(async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create updated user object
      const updatedUser: AdminUser = {
        ...user,
        firstName: editForm.firstName || undefined,
        lastName: editForm.lastName || undefined,
        username: editForm.username || undefined,
        email: editForm.email,
        phone: editForm.phone || null,
        bio: editForm.bio || undefined,
        address: editForm.address || null,
        school: editForm.school || null,
        role: editForm.role,
        status: editForm.status,
        level: editForm.level,
        maxConcurrentSessions: editForm.maxConcurrentSessions,
        updatedAt: new Date(),
      };

      // Notify parent component
      onUserUpdate?.(updatedUser);

      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save user:', error);
    } finally {
      setIsSaving(false);
    }
  }, [user, editForm, onUserUpdate]);

  /**
   * Handle cancel edit
   */
  const handleCancelEdit = useCallback(() => {
    if (user) {
      setEditForm(userToForm(user));
    }
    setIsEditing(false);
  }, [user]);

  // ===== RENDER HELPERS =====

  /**
   * Render basic information section
   */
  const renderBasicInfo = useCallback(() => {
    if (!user) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Thông tin cơ bản
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Họ</Label>
                  <Input
                    id="firstName"
                    value={editForm.firstName}
                    onChange={(e) => handleFormChange('firstName', e.target.value)}
                    placeholder="Nhập họ"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Tên</Label>
                  <Input
                    id="lastName"
                    value={editForm.lastName}
                    onChange={(e) => handleFormChange('lastName', e.target.value)}
                    placeholder="Nhập tên"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={editForm.username}
                  onChange={(e) => handleFormChange('username', e.target.value)}
                  placeholder="Nhập username"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  placeholder="Nhập email"
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-3">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                  {user.firstName && user.lastName 
                    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
                    : (user.username || user.email).substring(0, 2).toUpperCase()
                  }
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{getUserDisplayName(user)}</h3>
                  <p className="text-gray-600">{user.email}</p>
                  {user.username && (
                    <p className="text-sm text-gray-500">@{user.username}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">ID:</span> {user.id}
                </div>
                <div>
                  <span className="font-medium">Email xác thực:</span>{' '}
                  {user.emailVerified ? (
                    <span className="text-green-600">✓ Đã xác thực</span>
                  ) : (
                    <span className="text-red-600">✗ Chưa xác thực</span>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }, [user, isEditing, editForm, handleFormChange]);

  /**
   * Render role & permissions section
   */
  const renderRolePermissions = useCallback(() => {
    if (!user) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Vai trò & Quyền hạn
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div>
                <Label htmlFor="role">Vai trò</Label>
                <Select
                  value={editForm.role}
                  onValueChange={(value) => handleFormChange('role', value as UserRole)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value) => handleFormChange('status', value as UserStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(editForm.role === UserRole.STUDENT || editForm.role === UserRole.TUTOR || editForm.role === UserRole.TEACHER) && (
                <div>
                  <Label htmlFor="level">Cấp độ (1-9)</Label>
                  <Input
                    id="level"
                    type="number"
                    min="1"
                    max="9"
                    value={editForm.level || ''}
                    onChange={(e) => handleFormChange('level', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="Nhập cấp độ"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="maxSessions">Số phiên tối đa</Label>
                <Input
                  id="maxSessions"
                  type="number"
                  min="1"
                  max="10"
                  value={editForm.maxConcurrentSessions}
                  onChange={(e) => handleFormChange('maxConcurrentSessions', parseInt(e.target.value))}
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Vai trò:</span>
                  <Badge className="ml-2">
                    {ROLE_OPTIONS.find(r => r.value === user.role)?.label}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Trạng thái:</span>
                  <Badge className="ml-2" variant={user.status === UserStatus.ACTIVE ? 'default' : 'secondary'}>
                    {STATUS_OPTIONS.find(s => s.value === user.status)?.label}
                  </Badge>
                </div>
              </div>
              {user.level && (
                <div>
                  <span className="font-medium">Cấp độ:</span> Level {user.level}
                </div>
              )}
              <div>
                <span className="font-medium">Số phiên tối đa:</span> {user.maxConcurrentSessions}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }, [user, isEditing, editForm, handleFormChange]);

  // ===== RENDER =====

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-4xl max-h-[90vh] overflow-y-auto ${className}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Chi tiết người dùng</span>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Hủy
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Đang lưu...' : 'Lưu'}
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Chỉnh sửa
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          {renderBasicInfo()}

          {/* Role & Permissions */}
          {renderRolePermissions()}

          {/* Security & Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Bảo mật & Trạng thái
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Đăng nhập cuối:</span>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(user.lastLoginAt)}
                  </div>
                </div>
                <div>
                  <span className="font-medium">IP cuối:</span>
                  <div className="flex items-center gap-1 mt-1">
                    <Globe className="h-3 w-3" />
                    {user.lastLoginIp || 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Lần thử đăng nhập:</span>
                  <div className="mt-1">{user.loginAttempts}</div>
                </div>
                <div>
                  <span className="font-medium">Điểm rủi ro:</span>
                  <div className={`mt-1 font-medium ${formatRiskScore(user.riskScore).color}`}>
                    {formatRiskScore(user.riskScore).text}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Phiên hoạt động:</span>
                  <div className="mt-1">{user.activeSessionsCount}/{user.maxConcurrentSessions}</div>
                </div>
                <div>
                  <span className="font-medium">Truy cập tài nguyên:</span>
                  <div className="mt-1">{user.totalResourceAccess}</div>
                </div>
              </div>
              {user.lockedUntil && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700">
                    <XCircle className="h-4 w-4" />
                    <span className="font-medium">Tài khoản bị khóa đến: {formatDate(user.lockedUntil)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity & Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Hoạt động & Sử dụng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Ngày tạo:</span>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(user.createdAt)}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Cập nhật cuối:</span>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(user.updatedAt)}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Phiên hiện tại:</span>
                  <div className="flex items-center gap-1 mt-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    {user.activeSessionsCount} phiên
                  </div>
                </div>
                <div>
                  <span className="font-medium">Tổng truy cập:</span>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    {user.totalResourceAccess} lần
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin cá nhân
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="bio">Tiểu sử</Label>
                    <Textarea
                      id="bio"
                      value={editForm.bio}
                      onChange={(e) => handleFormChange('bio', e.target.value)}
                      placeholder="Nhập tiểu sử"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input
                        id="phone"
                        value={editForm.phone}
                        onChange={(e) => handleFormChange('phone', e.target.value)}
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                    <div>
                      <Label htmlFor="school">Trường học</Label>
                      <Input
                        id="school"
                        value={editForm.school}
                        onChange={(e) => handleFormChange('school', e.target.value)}
                        placeholder="Nhập tên trường"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Địa chỉ</Label>
                    <Input
                      id="address"
                      value={editForm.address}
                      onChange={(e) => handleFormChange('address', e.target.value)}
                      placeholder="Nhập địa chỉ"
                    />
                  </div>
                </>
              ) : (
                <>
                  {user.bio && (
                    <div>
                      <span className="font-medium">Tiểu sử:</span>
                      <p className="mt-1 text-gray-600">{user.bio}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {user.phone && (
                      <div>
                        <span className="font-medium">Điện thoại:</span>
                        <div className="flex items-center gap-1 mt-1">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </div>
                      </div>
                    )}
                    {user.school && (
                      <div>
                        <span className="font-medium">Trường học:</span>
                        <div className="mt-1">{user.school}</div>
                      </div>
                    )}
                    {user.address && (
                      <div className="col-span-2">
                        <span className="font-medium">Địa chỉ:</span>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {user.address}
                        </div>
                      </div>
                    )}
                    {user.dateOfBirth && (
                      <div>
                        <span className="font-medium">Ngày sinh:</span>
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(user.dateOfBirth)}
                        </div>
                      </div>
                    )}
                    {user.gender && (
                      <div>
                        <span className="font-medium">Giới tính:</span>
                        <div className="mt-1 capitalize">{user.gender}</div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          {user.stats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Thống kê học tập
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Tổng bài kiểm tra:</span>
                    <div className="mt-1 text-lg font-semibold text-blue-600">
                      {user.stats.totalExamResults || 0}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Tổng khóa học:</span>
                    <div className="mt-1 text-lg font-semibold text-green-600">
                      {user.stats.totalCourses || 0}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Tổng bài học:</span>
                    <div className="mt-1 text-lg font-semibold text-purple-600">
                      {user.stats.totalLessons || 0}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Điểm trung bình:</span>
                    <div className="mt-1 text-lg font-semibold text-orange-600">
                      {user.stats.averageScore ? user.stats.averageScore.toFixed(1) : 'N/A'}
                    </div>
                  </div>
                </div>
                {user.profile?.completionRate && (
                  <div className="mt-4">
                    <span className="font-medium">Tỷ lệ hoàn thành:</span>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${user.profile.completionRate}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {user.profile.completionRate}% hoàn thành
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
