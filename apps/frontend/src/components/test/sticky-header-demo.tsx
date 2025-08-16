'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/form/checkbox';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { MoreHorizontal } from 'lucide-react';

/**
 * Demo component để test sticky header functionality
 * Component này mô phỏng bảng người dùng với sticky header
 */
export function StickyHeaderDemo() {
  // Sample data for testing
  const sampleUsers = [
    { id: '1', name: 'Nguyễn Quân Trị', email: 'admin@nynus.edu.vn', role: 'Quản trị viên', status: 'Hoạt động', risk: 5, sessions: 2, access: 1250 },
    { id: '2', name: 'Trần Hồ Trợ', email: 'admin2@nynus.edu.vn', role: 'Quản trị viên', status: 'Hoạt động', risk: 8, sessions: 1, access: 850 },
    { id: '3', name: 'Lê Văn Toàn', email: 'gv.toan@nynus.edu.vn', role: 'Giáo viên', status: 'Hoạt động', risk: 12, sessions: 2, access: 650 },
    { id: '4', name: 'Phạm Thị Ly', email: 'gv.ly@nynus.edu.vn', role: 'Giáo viên', status: 'Hoạt động', risk: 6, sessions: 1, access: 720 },
    { id: '5', name: 'Nguyễn Minh Tutor', email: 'tutor.math@nynus.edu.vn', role: 'Gia sư', status: 'Hoạt động', risk: 15, sessions: 1, access: 420 },
    { id: '6', name: 'Nguyễn Văn An', email: 'hv001@student.nynus.edu.vn', role: 'Học sinh', status: 'Hoạt động', risk: 18, sessions: 2, access: 380 },
    { id: '7', name: 'Trần Thị Bình', email: 'hv002@student.nynus.edu.vn', role: 'Học sinh', status: 'Hoạt động', risk: 26, sessions: 1, access: 180 },
    { id: '8', name: 'Lê Minh Cường', email: 'hv003@student.nynus.edu.vn', role: 'Học sinh', status: 'Tạm ngưng', risk: 85, sessions: 0, access: 45 }
  ];

  // Generate more users for testing scroll
  const testUsers = [];
  for (let i = 0; i < 50; i++) {
    const baseUser = sampleUsers[i % sampleUsers.length];
    testUsers.push({
      ...baseUser,
      id: `${baseUser.id}-${i}`,
      name: `${baseUser.name} ${i + 1}`,
      email: baseUser.email.replace('@', `${i + 1}@`)
    });
  }

  const getRoleBadge = (role: string) => {
    const variants: Record<string, string> = {
      'Quản trị viên': 'bg-purple-600 text-white',
      'Giáo viên': 'bg-green-600 text-white',
      'Gia sư': 'bg-blue-600 text-white',
      'Học sinh': 'bg-gray-600 text-white'
    };
    
    return (
      <Badge className={variants[role] || 'bg-gray-500 text-white'}>
        {role}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'Hoạt động': 'bg-green-600 text-white',
      'Tạm ngưng': 'bg-red-600 text-white'
    };
    
    return (
      <Badge className={variants[status] || 'bg-gray-500 text-white'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Test Sticky Header - Danh sách người dùng</h1>
        <p className="text-muted-foreground">Demo component để kiểm tra sticky header functionality</p>
      </div>

      <Card className="admin-unified-card">
        <CardHeader>
          <CardTitle>Danh sách người dùng ({testUsers.length})</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div
            className="admin-table-container admin-table-scrollable"
            style={{ 
              height: 600, 
              maxHeight: '80vh',
              overflow: 'auto',
              position: 'relative'
            }}
          >
            <Table>
              <TableHeader
                className="sticky top-0 z-20 border-b-2"
                style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 20,
                  backgroundColor: 'hsl(var(--background))',
                  borderBottom: '2px solid hsl(var(--border))',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <TableRow>
                  <TableHead 
                    className="w-12 sticky top-0 z-20 font-semibold"
                    style={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 20,
                      backgroundColor: 'hsl(var(--background))',
                      borderBottom: '2px solid hsl(var(--border))'
                    }}
                  >
                    <Checkbox />
                  </TableHead>
                  <TableHead 
                    className="w-64 sticky top-0 z-20 font-semibold"
                    style={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 20,
                      backgroundColor: 'hsl(var(--background))',
                      borderBottom: '2px solid hsl(var(--border))'
                    }}
                  >
                    Người dùng
                  </TableHead>
                  <TableHead 
                    className="w-32 sticky top-0 z-20 font-semibold"
                    style={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 20,
                      backgroundColor: 'hsl(var(--background))',
                      borderBottom: '2px solid hsl(var(--border))'
                    }}
                  >
                    Vai trò
                  </TableHead>
                  <TableHead 
                    className="w-32 sticky top-0 z-20 font-semibold"
                    style={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 20,
                      backgroundColor: 'hsl(var(--background))',
                      borderBottom: '2px solid hsl(var(--border))'
                    }}
                  >
                    Trạng thái
                  </TableHead>
                  <TableHead 
                    className="w-40 sticky top-0 z-20 font-semibold"
                    style={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 20,
                      backgroundColor: 'hsl(var(--background))',
                      borderBottom: '2px solid hsl(var(--border))'
                    }}
                  >
                    Bảo mật
                  </TableHead>
                  <TableHead 
                    className="w-40 sticky top-0 z-20 font-semibold"
                    style={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 20,
                      backgroundColor: 'hsl(var(--background))',
                      borderBottom: '2px solid hsl(var(--border))'
                    }}
                  >
                    Hoạt động
                  </TableHead>
                  <TableHead 
                    className="w-24 sticky top-0 z-20 font-semibold"
                    style={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 20,
                      backgroundColor: 'hsl(var(--background))',
                      borderBottom: '2px solid hsl(var(--border))'
                    }}
                  >
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {testUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {getRoleBadge(user.role)}
                    </TableCell>
                    
                    <TableCell>
                      {getStatusBadge(user.status)}
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">Risk: {user.risk}</div>
                        <div className="text-xs text-muted-foreground">Sessions: {user.sessions}</div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">{new Date().toLocaleString('vi-VN')}</div>
                        <div className="text-xs text-muted-foreground">Access: {user.access}</div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="admin-unified-card">
        <CardHeader>
          <CardTitle>Test Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Scroll down trong bảng để kiểm tra sticky header</li>
            <li>Header phải luôn hiển thị ở trên cùng khi scroll</li>
            <li>Background của header phải đồng nhất với theme</li>
            <li>Border và shadow phải hiển thị đúng</li>
            <li>Kiểm tra cả light theme và dark theme</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
