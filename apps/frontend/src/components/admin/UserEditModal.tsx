/**
 * User Edit Modal Component
 * Modal để edit user role, level, và status trong admin dashboard
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, Shield, AlertTriangle } from 'lucide-react';
import { User as UserType, UserRole, UserStatus } from '@/services/api/admin.api';

// ===== TYPES =====

export interface UserEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserType | null;
  isUpdating?: boolean;
  onUpdateRole: (userId: string, newRole: UserRole, level?: number) => Promise<void>;
  onUpdateLevel: (userId: string, newLevel: number) => Promise<void>;
  onUpdateStatus: (userId: string, newStatus: UserStatus, reason?: string) => Promise<void>;
}

// ===== CONSTANTS =====

const USER_ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: 'GUEST', label: 'Khách', description: 'Quyền truy cập hạn chế' },
  { value: 'STUDENT', label: 'Học sinh', description: 'Có thể làm bài thi và xem tài liệu' },
  { value: 'TUTOR', label: 'Gia sư', description: 'Có thể tạo và quản lý bài thi cơ bản' },
  { value: 'TEACHER', label: 'Giáo viên', description: 'Có thể tạo và quản lý tất cả nội dung' },
  { value: 'ADMIN', label: 'Quản trị viên', description: 'Toàn quyền quản lý hệ thống' },
];

const USER_STATUSES: { value: UserStatus; label: string; variant: 'default' | 'secondary' | 'destructive' }[] = [
  { value: 'ACTIVE', label: 'Đang hoạt động', variant: 'default' },
  { value: 'INACTIVE', label: 'Không hoạt động', variant: 'secondary' },
  { value: 'SUSPENDED', label: 'Đã bị khóa', variant: 'destructive' },
];

// ===== COMPONENT =====

export function UserEditModal({
  open,
  onOpenChange,
  user,
  isUpdating = false,
  onUpdateRole,
  onUpdateLevel,
  onUpdateStatus,
}: UserEditModalProps) {
  // States
  const [activeTab, setActiveTab] = useState('role');
  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT');
  const [selectedLevel, setSelectedLevel] = useState<number>(10);
  const [selectedStatus, setSelectedStatus] = useState<UserStatus>('ACTIVE');
  const [statusReason, setStatusReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Initialize states when user changes
  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
      setSelectedLevel(user.level || 10);
      setSelectedStatus(user.status);
      setStatusReason('');
      setError(null);
    }
  }, [user]);

  // ===== HANDLERS =====

  const handleUpdateRole = async () => {
    if (!user) return;

    try {
      setError(null);
      const level = shouldShowLevelField(selectedRole) ? selectedLevel : undefined;
      await onUpdateRole(user.id, selectedRole, level);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật vai trò');
    }
  };

  const handleUpdateLevel = async () => {
    if (!user) return;

    try {
      setError(null);
      await onUpdateLevel(user.id, selectedLevel);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật cấp độ');
    }
  };

  const handleUpdateStatus = async () => {
    if (!user) return;

    try {
      setError(null);
      const reason = selectedStatus === 'SUSPENDED' ? statusReason || 'Suspended by admin' : undefined;
      await onUpdateStatus(user.id, selectedStatus, reason);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái');
    }
  };

  // ===== UTILITY FUNCTIONS =====

  const shouldShowLevelField = (role: UserRole): boolean => {
    return ['STUDENT', 'TUTOR', 'TEACHER'].includes(role);
  };

  const getRoleInfo = (role: UserRole) => {
    return USER_ROLES.find(r => r.value === role) || USER_ROLES[1];
  };

  const getStatusInfo = (status: UserStatus) => {
    return USER_STATUSES.find(s => s.value === status) || USER_STATUSES[0];
  };

  const hasChanges = () => {
    if (!user) return false;

    switch (activeTab) {
      case 'role':
        return selectedRole !== user.role || 
               (shouldShowLevelField(selectedRole) && selectedLevel !== (user.level || 10));
      case 'level':
        return selectedLevel !== (user.level || 10);
      case 'status':
        return selectedStatus !== user.status;
      default:
        return false;
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Chỉnh sửa người dùng
          </DialogTitle>
          <DialogDescription>
            {user.name || user.email}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info */}
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{user.name || 'Không có tên'}</span>
              <Badge variant={getStatusInfo(user.status).variant}>
                {getStatusInfo(user.status).label}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span>Vai trò: {getRoleInfo(user.role).label}</span>
              {user.level && <span>Cấp độ: {user.level}</span>}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Edit Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="role">Vai trò</TabsTrigger>
              <TabsTrigger value="level">Cấp độ</TabsTrigger>
              <TabsTrigger value="status">Trạng thái</TabsTrigger>
            </TabsList>

            {/* Role Tab */}
            <TabsContent value="role" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role-select">Vai trò</Label>
                <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
                  <SelectTrigger id="role-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{role.label}</span>
                          {role.value === user.role && (
                            <Badge variant="outline" className="ml-2 text-xs">Hiện tại</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {getRoleInfo(selectedRole).description}
                </p>
              </div>

              {shouldShowLevelField(selectedRole) && (
                <div className="space-y-2">
                  <Label htmlFor="role-level">Cấp độ (1-12)</Label>
                  <Input
                    id="role-level"
                    type="number"
                    min="1"
                    max="12"
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(Number(e.target.value))}
                    placeholder="Nhập cấp độ"
                  />
                  <p className="text-sm text-muted-foreground">
                    Cấp độ phù hợp với vai trò {getRoleInfo(selectedRole).label.toLowerCase()}
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Level Tab */}
            <TabsContent value="level" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="level-input">Cấp độ (1-12)</Label>
                <Input
                  id="level-input"
                  type="number"
                  min="1"
                  max="12"
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(Number(e.target.value))}
                  placeholder="Nhập cấp độ"
                />
                <p className="text-sm text-muted-foreground">
                  Cấp độ hiện tại: {user.level || 'Chưa đặt'}
                </p>
              </div>

              {!shouldShowLevelField(user.role) && (
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Vai trò {getRoleInfo(user.role).label} không sử dụng cấp độ.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            {/* Status Tab */}
            <TabsContent value="status" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status-select">Trạng thái</Label>
                <Select value={selectedStatus} onValueChange={(value: UserStatus) => setSelectedStatus(value)}>
                  <SelectTrigger id="status-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{status.label}</span>
                          {status.value === user.status && (
                            <Badge variant="outline" className="ml-2 text-xs">Hiện tại</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedStatus === 'SUSPENDED' && (
                <div className="space-y-2">
                  <Label htmlFor="suspend-reason">Lý do khóa tài khoản</Label>
                  <Textarea
                    id="suspend-reason"
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    placeholder="Nhập lý do khóa tài khoản..."
                    rows={3}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdating}>
            Hủy
          </Button>
          
          <Button 
            onClick={() => {
              switch (activeTab) {
                case 'role':
                  handleUpdateRole();
                  break;
                case 'level':
                  handleUpdateLevel();
                  break;
                case 'status':
                  handleUpdateStatus();
                  break;
              }
            }}
            disabled={isUpdating || !hasChanges()}
          >
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {activeTab === 'role' && 'Cập nhật vai trò'}
            {activeTab === 'level' && 'Cập nhật cấp độ'}
            {activeTab === 'status' && 'Cập nhật trạng thái'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UserEditModal;