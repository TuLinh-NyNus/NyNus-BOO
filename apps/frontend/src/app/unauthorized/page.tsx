'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldOff, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function UnauthorizedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  const getReasonMessage = () => {
    if (!reason) {
      return 'Bạn không có quyền truy cập vào trang này.';
    }

    if (reason.startsWith('level_')) {
      const requiredLevel = reason.replace('level_', '');
      return `Trang này yêu cầu cấp độ ${requiredLevel} trở lên để truy cập.`;
    }

    switch (reason) {
      case 'role':
        return 'Vai trò của bạn không có quyền truy cập vào trang này.';
      case 'suspended':
        return 'Tài khoản của bạn đã bị tạm ngưng. Vui lòng liên hệ quản trị viên.';
      case 'inactive':
        return 'Tài khoản của bạn chưa được kích hoạt. Vui lòng kiểm tra email.';
      default:
        return 'Bạn không có quyền truy cập vào trang này.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldOff className="h-10 w-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-900">Truy cập bị từ chối</CardTitle>
          <CardDescription className="mt-2 text-red-700">
            {getReasonMessage()}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 mb-2">Bạn có thể:</h3>
            <ul className="space-y-1 text-sm text-red-700">
              <li>• Quay lại trang trước đó</li>
              <li>• Về trang chủ để tìm hiểu thêm</li>
              <li>• Liên hệ quản trị viên nếu bạn cho rằng đây là lỗi</li>
            </ul>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Mã lỗi: <code className="bg-gray-100 px-2 py-1 rounded">403_FORBIDDEN</code>
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <Button
            onClick={() => router.push('/dashboard')}
            className="flex-1"
          >
            <Home className="mr-2 h-4 w-4" />
            Trang chủ
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}