'use client';

import { Settings, Save, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Alert,
  AlertDescription,
  Input,
  Label
} from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { AdminUser } from '@/lib/api/admin-users.service';

interface IPLimitControlsProps {
  user: AdminUser;
  onUpdate?: (newLimit: number) => void;
}

export function IPLimitControls({ user, onUpdate }: IPLimitControlsProps) {
  const [currentLimit, setCurrentLimit] = useState(user.maxConcurrentIPs || 3);
  const [newLimit, setNewLimit] = useState(user.maxConcurrentIPs || 3);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  const handleLimitChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 10) {
      setNewLimit(numValue);
      setHasChanges(numValue !== currentLimit);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const response = await fetch(`/api/admin/sessions/user/${user.id}/ip-limit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxConcurrentIPs: newLimit,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update IP limit');
      }

      const result = await response.json();
      
      setCurrentLimit(newLimit);
      setHasChanges(false);
      
      toast({
        title: 'Thành công',
        description: result.message,
      });

      // Notify parent component
      onUpdate?.(newLimit);
    } catch (error) {
      console.error('Error updating IP limit:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật giới hạn IP',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setNewLimit(currentLimit);
    setHasChanges(false);
  };

  const getRecommendation = (limit: number) => {
    if (limit === 1) {
      return {
        type: 'restrictive' as const,
        message: 'Rất hạn chế - Chỉ cho phép 1 thiết bị đăng nhập cùng lúc',
        color: 'text-red-600',
      };
    } else if (limit <= 2) {
      return {
        type: 'strict' as const,
        message: 'Hạn chế - Phù hợp cho tài khoản cá nhân',
        color: 'text-orange-600',
      };
    } else if (limit <= 3) {
      return {
        type: 'balanced' as const,
        message: 'Cân bằng - Cho phép máy tính, điện thoại và tablet',
        color: 'text-green-600',
      };
    } else if (limit <= 5) {
      return {
        type: 'flexible' as const,
        message: 'Linh hoạt - Phù hợp cho gia đình hoặc nhóm nhỏ',
        color: 'text-blue-600',
      };
    } else {
      return {
        type: 'permissive' as const,
        message: 'Rất linh hoạt - Có thể gây rủi ro bảo mật',
        color: 'text-purple-600',
      };
    }
  };

  const recommendation = getRecommendation(newLimit);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Giới hạn IP đồng thời
        </CardTitle>
        <CardDescription>
          Cấu hình số lượng IP address tối đa có thể đăng nhập cùng lúc cho {user.firstName} {user.lastName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Giới hạn hiện tại</h4>
              <p className="text-sm text-muted-foreground">
                Cho phép tối đa {currentLimit} IP address đăng nhập cùng lúc
              </p>
            </div>
            <div className="text-2xl font-bold text-primary">
              {currentLimit}
            </div>
          </div>
        </div>

        {/* IP Limit Configuration */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ip-limit">Giới hạn IP mới</Label>
            <div className="flex items-center gap-4">
              <Input
                id="ip-limit"
                type="number"
                min="1"
                max="10"
                value={newLimit}
                onChange={(e) => handleLimitChange(e.target.value)}
                className="w-24"
              />
              <div className="flex-1">
                <div className={`font-medium ${recommendation.color}`}>
                  {recommendation.message}
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Lưu ý:</strong> Khi giảm giới hạn IP, các sessions từ IP cũ nhất sẽ bị terminate tự động 
              nếu số IP hiện tại vượt quá giới hạn mới.
            </AlertDescription>
          </Alert>

          {/* Preview Impact */}
          {hasChanges && (
            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                Xem trước thay đổi
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Giới hạn hiện tại:</span>
                  <span className="font-mono">{currentLimit} IP</span>
                </div>
                <div className="flex justify-between">
                  <span>Giới hạn mới:</span>
                  <span className="font-mono font-bold text-blue-600">{newLimit} IP</span>
                </div>
                <div className="flex justify-between">
                  <span>Thay đổi:</span>
                  <span className={`font-medium ${newLimit > currentLimit ? 'text-green-600' : 'text-red-600'}`}>
                    {newLimit > currentLimit ? '+' : ''}{newLimit - currentLimit} IP
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Security Guidelines */}
        <div className="space-y-3">
          <h4 className="font-medium">Hướng dẫn bảo mật</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong>1-2 IP:</strong> Phù hợp cho tài khoản cá nhân, bảo mật cao
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong>3-4 IP:</strong> Cân bằng giữa tiện lợi và bảo mật, phù hợp cho hầu hết người dùng
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong>5+ IP:</strong> Linh hoạt nhưng có thể gây rủi ro, cần giám sát thường xuyên
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
          
          {hasChanges && (
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={saving}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Hoàn tác
            </Button>
          )}
        </div>

        {/* Usage Examples */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-3">Ví dụ sử dụng</h4>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="p-3 border rounded-lg">
              <div className="font-medium text-sm">Tài khoản cá nhân</div>
              <div className="text-xs text-muted-foreground mt-1">
                2-3 IP: Máy tính, điện thoại, tablet
              </div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="font-medium text-sm">Tài khoản gia đình</div>
              <div className="text-xs text-muted-foreground mt-1">
                4-5 IP: Nhiều thiết bị, nhiều thành viên
              </div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="font-medium text-sm">Tài khoản doanh nghiệp</div>
              <div className="text-xs text-muted-foreground mt-1">
                3-4 IP: Văn phòng, nhà, thiết bị di động
              </div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="font-medium text-sm">Tài khoản bảo mật cao</div>
              <div className="text-xs text-muted-foreground mt-1">
                1-2 IP: Hạn chế tối đa, kiểm soát chặt chẽ
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
