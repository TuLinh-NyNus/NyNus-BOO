'use client';

import { History, RotateCcw, Shield, GraduationCap, User, Users, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

import {
  Button,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { AdminUser } from '@/lib/api/admin-users.service';

interface RoleHistoryRecord {
  id: string;
  oldRole: string;
  newRole: string;
  reason?: string;
  timestamp: string;
  metadata?: any;
  changedBy: {
    id: string;
    name: string;
    email: string;
  };
}

interface RoleHistoryProps {
  user: AdminUser;
}

const roleConfig = {
  ADMIN: {
    label: 'Quản trị viên',
    icon: Shield,
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  },
  INSTRUCTOR: {
    label: 'Giảng viên',
    icon: GraduationCap,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
  },
  STUDENT: {
    label: 'Học sinh',
    icon: User,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  },
  GUEST: {
    label: 'Khách',
    icon: Users,
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
};

export function RoleHistory({ user }: RoleHistoryProps) {
  const [history, setHistory] = useState<RoleHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [rollbackDialog, setRollbackDialog] = useState<{
    open: boolean;
    record?: RoleHistoryRecord;
  }>({ open: false });
  const [rollbackLoading, setRollbackLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRoleHistory();
  }, [user.id]);

  const fetchRoleHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${user.id}/role-history`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch role history');
      }
      
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('Error fetching role history:', error);
      
      // Mock data for development
      const mockHistory: RoleHistoryRecord[] = [
        {
          id: '1',
          oldRole: 'STUDENT',
          newRole: 'INSTRUCTOR',
          reason: 'Promoted to instructor role',
          timestamp: '2024-01-15T10:30:00Z',
          changedBy: {
            id: 'admin1',
            name: 'Admin User',
            email: 'admin@nynus.edu.vn'
          }
        },
        {
          id: '2',
          oldRole: 'GUEST',
          newRole: 'STUDENT',
          reason: 'Account activation',
          timestamp: '2024-01-01T00:00:00Z',
          changedBy: {
            id: 'admin1',
            name: 'Admin User',
            email: 'admin@nynus.edu.vn'
          }
        }
      ];
      
      setHistory(mockHistory);
      toast({
        title: 'Thông báo',
        description: 'Đang sử dụng dữ liệu mẫu (API chưa sẵn sàng)',
        variant: 'default',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async () => {
    if (!rollbackDialog.record) return;

    try {
      setRollbackLoading(true);
      const response = await fetch(`/api/admin/users/role-history/${rollbackDialog.record.id}/rollback`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to rollback role change');
      }

      const result = await response.json();
      
      toast({
        title: 'Thành công',
        description: result.message,
      });

      // Refresh history
      await fetchRoleHistory();
      setRollbackDialog({ open: false });
    } catch (error) {
      console.error('Error rolling back role change:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể rollback thay đổi vai trò',
        variant: 'destructive',
      });
    } finally {
      setRollbackLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleDisplay = (role: string) => {
    const config = roleConfig[role as keyof typeof roleConfig];
    if (!config) return { label: role, icon: User, color: 'bg-gray-100 text-gray-800' };
    return config;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Lịch sử thay đổi vai trò
        </CardTitle>
        <CardDescription>
          Theo dõi tất cả thay đổi vai trò của {user.firstName} {user.lastName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <Skeleton className="h-8 w-[100px]" />
              </div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Chưa có lịch sử thay đổi vai trò</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thay đổi</TableHead>
                <TableHead>Lý do</TableHead>
                <TableHead>Người thực hiện</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((record) => {
                const oldRoleConfig = getRoleDisplay(record.oldRole);
                const newRoleConfig = getRoleDisplay(record.newRole);
                
                return (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Badge className={oldRoleConfig.color} variant="outline">
                            <oldRoleConfig.icon className="h-3 w-3 mr-1" />
                            {oldRoleConfig.label}
                          </Badge>
                          <span className="text-muted-foreground">→</span>
                          <Badge className={newRoleConfig.color}>
                            <newRoleConfig.icon className="h-3 w-3 mr-1" />
                            {newRoleConfig.label}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate" title={record.reason}>
                        {record.reason || 'Không có lý do'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{record.changedBy.name}</div>
                        <div className="text-sm text-muted-foreground">{record.changedBy.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatDate(record.timestamp)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRollbackDialog({ open: true, record })}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Rollback
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Rollback Confirmation Dialog */}
      <Dialog open={rollbackDialog.open} onOpenChange={(open) => setRollbackDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận rollback</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn rollback thay đổi vai trò này không?
            </DialogDescription>
          </DialogHeader>
          
          {rollbackDialog.record && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Chi tiết thay đổi:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span>Từ:</span>
                    <Badge className={getRoleDisplay(rollbackDialog.record.oldRole).color} variant="outline">
                      {getRoleDisplay(rollbackDialog.record.oldRole).label}
                    </Badge>
                    <span>→</span>
                    <Badge className={getRoleDisplay(rollbackDialog.record.newRole).color}>
                      {getRoleDisplay(rollbackDialog.record.newRole).label}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Lý do:</span> {rollbackDialog.record.reason || 'Không có lý do'}
                  </div>
                  <div>
                    <span className="font-medium">Thời gian:</span> {formatDate(rollbackDialog.record.timestamp)}
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Lưu ý:</strong> Rollback sẽ đặt lại vai trò của người dùng về{' '}
                  <strong>{getRoleDisplay(rollbackDialog.record.oldRole).label}</strong> và tạo một bản ghi lịch sử mới.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setRollbackDialog({ open: false })}
              disabled={rollbackLoading}
            >
              Hủy
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRollback}
              disabled={rollbackLoading}
            >
              {rollbackLoading ? 'Đang xử lý...' : 'Rollback'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
