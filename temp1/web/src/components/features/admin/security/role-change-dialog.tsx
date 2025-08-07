'use client';

import { UserRole } from '@nynus/entities';
import { AlertTriangle, Shield, GraduationCap, User, Users, BookOpen } from 'lucide-react';
import { useState } from 'react';

import {
  Button,
  Badge,
  Label,
  Textarea,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { adminUsersService, AdminUser } from '@/lib/api/admin-users.service';

interface RoleChangeDialogProps {
  user: AdminUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleChanged: (updatedUser: AdminUser) => void;
}

const roleConfig = {
  ADMIN: {
    label: 'Quản trị viên',
    icon: Shield,
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    description: 'Quyền truy cập toàn bộ hệ thống, quản lý tất cả người dùng và cài đặt',
    permissions: [
      'Quản lý tất cả người dùng',
      'Cài đặt hệ thống',
      'Xem báo cáo và thống kê',
      'Quản lý khóa học và nội dung',
      'Quản lý quyền và vai trò'
    ]
  },
  TUTOR: {
    label: 'Gia sư',
    icon: GraduationCap,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    description: 'Tạo và quản lý khóa học, câu hỏi, đề thi và theo dõi học viên',
    permissions: [
      'Tạo và quản lý khóa học',
      'Tạo câu hỏi và đề thi',
      'Theo dõi tiến độ học viên',
      'Chấm điểm và đánh giá',
      'Quản lý nội dung giảng dạy'
    ]
  },
  TEACHER: {
    label: 'Giáo viên',
    icon: BookOpen,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    description: 'Tất cả quyền của gia sư + quản lý học sinh và lớp học',
    permissions: [
      'Tạo và quản lý khóa học',
      'Tạo câu hỏi và đề thi',
      'Theo dõi tiến độ học viên',
      'Chấm điểm và đánh giá',
      'Quản lý nội dung giảng dạy',
      'Quản lý học sinh',
      'Quản lý lớp học'
    ]
  },
  STUDENT: {
    label: 'Học sinh',
    icon: User,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    description: 'Tham gia khóa học, làm bài thi và theo dõi tiến độ học tập',
    permissions: [
      'Tham gia khóa học',
      'Làm bài thi và kiểm tra',
      'Xem kết quả và tiến độ',
      'Tương tác với giảng viên',
      'Tải tài liệu học tập'
    ]
  },
  GUEST: {
    label: 'Khách',
    icon: Users,
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    description: 'Quyền truy cập hạn chế, chỉ xem nội dung công khai',
    permissions: [
      'Xem nội dung công khai',
      'Đăng ký tài khoản',
      'Xem thông tin khóa học',
      'Liên hệ hỗ trợ'
    ]
  }
};

export function RoleChangeDialog({ user, open, onOpenChange, onRoleChanged }: RoleChangeDialogProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const currentRoleConfig = roleConfig[user.role];
  const newRoleConfig = roleConfig[selectedRole];
  const isRoleChanged = selectedRole !== user.role;

  const handleRoleChange = async () => {
    if (!isRoleChanged) {
      onOpenChange(false);
      return;
    }

    try {
      setLoading(true);
      
      const updatedUser = await adminUsersService.updateUser(user.id, {
        role: selectedRole,
        adminNotes: reason ? `Role changed to ${selectedRole}: ${reason}` : `Role changed to ${selectedRole}`
      });

      onRoleChanged(updatedUser);
      onOpenChange(false);
      
      toast({
        title: 'Thành công',
        description: `Đã thay đổi vai trò của ${user.firstName} ${user.lastName} thành ${newRoleConfig.label}`,
      });
    } catch (error) {
      console.error('Error changing role:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể thay đổi vai trò người dùng',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedRole(user.role);
    setReason('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Thay đổi vai trò người dùng
          </DialogTitle>
          <DialogDescription>
            Thay đổi vai trò cho {user.firstName} {user.lastName} ({user.email})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Role */}
          <div className="space-y-2">
            <Label>Vai trò hiện tại</Label>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <currentRoleConfig.icon className="h-5 w-5" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{currentRoleConfig.label}</span>
                  <Badge className={currentRoleConfig.color}>
                    {user.role}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentRoleConfig.description}
                </p>
              </div>
            </div>
          </div>

          {/* New Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Vai trò mới</Label>
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(roleConfig).map(([role, config]) => (
                  <SelectItem key={role} value={role}>
                    <div className="flex items-center gap-2">
                      <config.icon className="h-4 w-4" />
                      <span>{config.label}</span>
                      <Badge className={config.color} variant="outline">
                        {role}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Role Comparison */}
          {isRoleChanged && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Thay đổi quyền hạn</span>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Quyền hiện tại:</h4>
                  <ul className="text-sm space-y-1">
                    {currentRoleConfig.permissions.map((permission: string, index: number) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-current rounded-full opacity-60" />
                        {permission}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Quyền mới:</h4>
                  <ul className="text-sm space-y-1">
                    {newRoleConfig.permissions.map((permission: string, index: number) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-current rounded-full opacity-60" />
                        {permission}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Lý do thay đổi (tùy chọn)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do thay đổi vai trò..."
              rows={3}
            />
          </div>

          {/* Warning */}
          {isRoleChanged && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Cảnh báo thay đổi vai trò
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Thay đổi vai trò sẽ ảnh hưởng đến quyền truy cập của người dùng. 
                    Người dùng có thể cần đăng nhập lại để áp dụng quyền mới.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            Hủy
          </Button>
          <Button 
            onClick={handleRoleChange} 
            disabled={loading}
            variant={isRoleChanged ? "default" : "outline"}
          >
            {loading ? 'Đang xử lý...' : isRoleChanged ? 'Thay đổi vai trò' : 'Đóng'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
