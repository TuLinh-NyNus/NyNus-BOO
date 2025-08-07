'use client';

import { Shield, GraduationCap, User, Users, Check, X, Info, BookOpen } from 'lucide-react';
import React, { useState } from 'react';

import {
  Button,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui';

// Permission definitions
const permissions = [
  {
    id: 'user_management',
    name: 'Quản lý người dùng',
    description: 'Tạo, sửa, xóa tài khoản người dùng',
    category: 'Quản lý hệ thống'
  },
  {
    id: 'role_management',
    name: 'Quản lý vai trò',
    description: 'Thay đổi vai trò và quyền hạn người dùng',
    category: 'Quản lý hệ thống'
  },
  {
    id: 'system_settings',
    name: 'Cài đặt hệ thống',
    description: 'Thay đổi cấu hình và cài đặt hệ thống',
    category: 'Quản lý hệ thống'
  },
  {
    id: 'view_analytics',
    name: 'Xem thống kê',
    description: 'Truy cập báo cáo và thống kê hệ thống',
    category: 'Báo cáo'
  },
  {
    id: 'export_data',
    name: 'Xuất dữ liệu',
    description: 'Xuất dữ liệu ra các định dạng khác nhau',
    category: 'Báo cáo'
  },
  {
    id: 'course_management',
    name: 'Quản lý khóa học',
    description: 'Tạo, sửa, xóa khóa học',
    category: 'Giáo dục'
  },
  {
    id: 'content_creation',
    name: 'Tạo nội dung',
    description: 'Tạo bài giảng, tài liệu, video',
    category: 'Giáo dục'
  },
  {
    id: 'question_management',
    name: 'Quản lý câu hỏi',
    description: 'Tạo, sửa, xóa câu hỏi và đề thi',
    category: 'Giáo dục'
  },
  {
    id: 'grade_management',
    name: 'Quản lý điểm số',
    description: 'Chấm điểm và quản lý kết quả học tập',
    category: 'Giáo dục'
  },
  {
    id: 'course_enrollment',
    name: 'Đăng ký khóa học',
    description: 'Đăng ký và tham gia khóa học',
    category: 'Học tập'
  },
  {
    id: 'take_exams',
    name: 'Làm bài thi',
    description: 'Tham gia các bài kiểm tra và thi',
    category: 'Học tập'
  },
  {
    id: 'view_progress',
    name: 'Xem tiến độ',
    description: 'Theo dõi tiến độ học tập cá nhân',
    category: 'Học tập'
  },
  {
    id: 'download_resources',
    name: 'Tải tài liệu',
    description: 'Tải xuống tài liệu học tập',
    category: 'Học tập'
  },
  {
    id: 'view_public_content',
    name: 'Xem nội dung công khai',
    description: 'Truy cập nội dung không yêu cầu đăng nhập',
    category: 'Cơ bản'
  },
  {
    id: 'contact_support',
    name: 'Liên hệ hỗ trợ',
    description: 'Gửi yêu cầu hỗ trợ và liên hệ',
    category: 'Cơ bản'
  }
];

// Role configurations with permissions
const rolePermissions = {
  ADMIN: [
    'user_management', 'role_management', 'system_settings', 'view_analytics', 'export_data',
    'course_management', 'content_creation', 'question_management', 'grade_management',
    'course_enrollment', 'take_exams', 'view_progress', 'download_resources',
    'view_public_content', 'contact_support'
  ],
  TEACHER: [
    'user_management', 'view_analytics', 'course_management', 'content_creation', 'question_management', 'grade_management',
    'course_enrollment', 'take_exams', 'view_progress', 'download_resources',
    'view_public_content', 'contact_support'
  ],
  TUTOR: [
    'view_analytics', 'course_management', 'content_creation', 'question_management', 'grade_management',
    'course_enrollment', 'take_exams', 'view_progress', 'download_resources',
    'view_public_content', 'contact_support'
  ],
  STUDENT: [
    'course_enrollment', 'take_exams', 'view_progress', 'download_resources',
    'view_public_content', 'contact_support'
  ],
  GUEST: [
    'view_public_content', 'contact_support'
  ]
};

const roleConfig = {
  ADMIN: {
    label: 'Quản trị viên',
    icon: Shield,
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  },
  TEACHER: {
    label: 'Giáo viên',
    icon: BookOpen,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
  },
  TUTOR: {
    label: 'Gia sư',
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

const roles = Object.keys(roleConfig) as Array<keyof typeof roleConfig>;

// Group permissions by category
const permissionsByCategory = permissions.reduce((acc, permission) => {
  if (!acc[permission.category]) {
    acc[permission.category] = [];
  }
  acc[permission.category].push(permission);
  return acc;
}, {} as Record<string, typeof permissions>);

export function PermissionMatrix() {
  const [editMode, setEditMode] = useState(false);
  const [localPermissions, setLocalPermissions] = useState(rolePermissions);

  const hasPermission = (role: string, permissionId: string) => {
    return localPermissions[role as keyof typeof localPermissions]?.includes(permissionId) || false;
  };

  const togglePermission = (role: string, permissionId: string) => {
    if (!editMode) return;

    setLocalPermissions(prev => {
      const rolePerms = prev[role as keyof typeof prev] || [];
      const hasIt = rolePerms.includes(permissionId);
      
      return {
        ...prev,
        [role]: hasIt 
          ? rolePerms.filter(p => p !== permissionId)
          : [...rolePerms, permissionId]
      };
    });
  };

  const resetPermissions = () => {
    setLocalPermissions(rolePermissions);
    setEditMode(false);
  };

  const savePermissions = () => {
    // TODO: Save to backend
    console.log('Saving permissions:', localPermissions);
    setEditMode(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Ma trận phân quyền
              </CardTitle>
              <CardDescription>
                Quản lý quyền hạn cho từng vai trò trong hệ thống
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {editMode ? (
                <>
                  <Button variant="outline" onClick={resetPermissions}>
                    Hủy
                  </Button>
                  <Button onClick={savePermissions}>
                    Lưu thay đổi
                  </Button>
                </>
              ) : (
                <Button onClick={() => setEditMode(true)}>
                  Chỉnh sửa quyền
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Role Overview */}
            <div className="grid gap-4 md:grid-cols-4">
              {roles.map(role => {
                const config = roleConfig[role];
                const permCount = localPermissions[role]?.length || 0;
                return (
                  <div key={role} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <config.icon className="h-5 w-5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{config.label}</span>
                        <Badge className={config.color} variant="outline">
                          {role}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {permCount} quyền
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Permission Matrix */}
            <div className="space-y-6">
              {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                <div key={category} className="space-y-3">
                  <h3 className="text-lg font-semibold">{category}</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[300px]">Quyền hạn</TableHead>
                          {roles.map(role => (
                            <TableHead key={role} className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                {React.createElement(roleConfig[role].icon, { className: "h-4 w-4" })}
                                <span>{roleConfig[role].label}</span>
                              </div>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categoryPermissions.map(permission => (
                          <TableRow key={permission.id}>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{permission.name}</span>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Info className="h-4 w-4 text-muted-foreground" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{permission.description}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {permission.description}
                                </p>
                              </div>
                            </TableCell>
                            {roles.map(role => {
                              const hasIt = hasPermission(role, permission.id);
                              return (
                                <TableCell key={role} className="text-center">
                                  {editMode ? (
                                    <Switch
                                      checked={hasIt}
                                      onCheckedChange={() => togglePermission(role, permission.id)}
                                    />
                                  ) : (
                                    <div className="flex justify-center">
                                      {hasIt ? (
                                        <Check className="h-5 w-5 text-green-600" />
                                      ) : (
                                        <X className="h-5 w-5 text-red-600" />
                                      )}
                                    </div>
                                  )}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
