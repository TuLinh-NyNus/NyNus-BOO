'use client';

import React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

export default function AdminUsersPermissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quản lý phân quyền</h1>
        <p className="text-muted-foreground">
          Cấu hình quyền hạn cho từng vai trò trong hệ thống
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ma trận phân quyền</CardTitle>
          <CardDescription>
            Quản lý quyền hạn chi tiết cho từng vai trò người dùng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Chức năng quản lý phân quyền đang được phát triển
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

