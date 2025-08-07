'use client';

import { User, Settings, Lock, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { PasswordChangeForm } from '@/components/features/profile/password-change-form';
import { ProfileForm } from '@/components/features/profile/profile-form';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/display/avatar";
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/navigation/tabs";
import { Progress } from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import { calculateProfileCompletion, type ExtendedProfile } from '@/lib/validation/profile-schemas';

// Mock user data - replace with actual API call
const mockUser: ExtendedProfile = {
  firstName: 'Nguyễn',
  lastName: 'Văn A',
  email: 'student1@nynus.edu.vn',
  role: 'STUDENT',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
  bio: 'Tôi là một sinh viên đam mê học tập và phát triển bản thân.',
  phoneNumber: '0123456789',
  address: '123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh',
  fullName: 'Nguyễn Văn A',
};

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function getRoleLabel(role: string): string {
  switch (role) {
    case 'STUDENT':
      return 'Học viên';
    case 'INSTRUCTOR':
      return 'Giảng viên';
    case 'ADMIN':
      return 'Quản trị viên';
    default:
      return role;
  }
}

function getRoleColor(role: string): string {
  switch (role) {
    case 'STUDENT':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'INSTRUCTOR':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'ADMIN':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
}

export default function ProfilePage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const router = useRouter();

  // Debug logging
  console.log('Profile Page - Auth State:', { user, isLoading, isAuthenticated, hasCheckedAuth });

  // Handle authentication redirect với delay để tránh hydration mismatch
  useEffect(() => {
    console.log('Profile Page - useEffect triggered:', { isLoading, isAuthenticated, user: !!user, hasCheckedAuth });

    if (!isLoading) {
      // Đợi lâu hơn để đảm bảo auth state đã được khởi tạo đầy đủ
      const timer = setTimeout(() => {
        console.log('Profile Page - Timer executed, setting hasCheckedAuth to true');
        setHasCheckedAuth(true);

        console.log('Profile Page - Auth check:', { isAuthenticated, user: !!user, isLoading });

        // Chỉ redirect nếu thực sự không có authentication
        if (!isAuthenticated && !user) {
          console.log('Profile Page - No authentication found, redirecting to home');
          console.log('Auth state:', { isAuthenticated, user, isLoading });
          router.push('/');
        } else if (isAuthenticated && user) {
          console.log('Profile Page - User authenticated successfully');
          console.log('User info:', { email: user.email, role: user.role });
        }
            5}, 500); // Tăng delay để đảm bảo auth state ổn định

      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Show loading state
  if (isLoading || !hasCheckedAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  // Create user profile from authenticated user data - aligned with User entity
  const displayName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email;
  const nameParts = displayName.split(' ');

  const userProfile: ExtendedProfile = {
    firstName: nameParts[0] || 'Người dùng',
    lastName: nameParts.slice(1).join(' ') || '',
    email: user.email,
    role: user.role,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    bio: '',
    phoneNumber: '',
    address: '',
    fullName: displayName,
  };

  // Calculate profile completion
  const { percentage: completionPercentage, missingFields } = calculateProfileCompletion(userProfile);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <Avatar className="h-24 w-24 border-2 border-primary">
                <AvatarImage src="/images/avatar.png" alt={userProfile.fullName} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                  {getInitials(userProfile.firstName, userProfile.lastName)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">
                      {userProfile.firstName} {userProfile.lastName}
                    </CardTitle>
                    <CardDescription className="text-base mt-1">
                      {userProfile.email}
                    </CardDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getRoleColor(userProfile.role)}>
                        {getRoleLabel(userProfile.role)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground mb-2">
                      Hoàn thành hồ sơ
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={completionPercentage} className="w-24" />
                      <span className="text-sm font-medium">{completionPercentage}%</span>
                    </div>
                  </div>
                </div>

                {userProfile.bio && (
                  <p className="text-muted-foreground mt-4 max-w-2xl">
                    {userProfile.bio}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Profile Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Thông tin cá nhân
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Bảo mật
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Cài đặt
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Chỉnh sửa thông tin cá nhân
                </CardTitle>
                <CardDescription>
                  Cập nhật thông tin cá nhân của bạn. Thay đổi email sẽ yêu cầu xác minh.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileForm user={userProfile} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Thay đổi mật khẩu
                </CardTitle>
                <CardDescription>
                  Đảm bảo tài khoản của bạn an toàn bằng cách sử dụng mật khẩu mạnh.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PasswordChangeForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Cài đặt tài khoản
                </CardTitle>
                <CardDescription>
                  Quản lý các tùy chọn và cài đặt tài khoản của bạn.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Tính năng cài đặt sẽ được phát triển trong phiên bản tiếp theo.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
