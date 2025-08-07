'use client';

import React from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

export default function AdminUsersBulkOperationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Thao tác hàng loạt</h1>
        <p className="text-muted-foreground">
          Thực hiện các thao tác trên nhiều người dùng cùng lúc
        </p>
      </div>

      <Tabs defaultValue="import" className="space-y-4">
        <TabsList>
          <TabsTrigger value="import">Import người dùng</TabsTrigger>
          <TabsTrigger value="roles">Gán vai trò hàng loạt</TabsTrigger>
          <TabsTrigger value="export">Export dữ liệu</TabsTrigger>
        </TabsList>

        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>Import người dùng từ file</CardTitle>
              <CardDescription>
                Tải lên file CSV hoặc Excel để import nhiều người dùng cùng lúc
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Chức năng import đang được phát triển
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Gán vai trò hàng loạt</CardTitle>
              <CardDescription>
                Thay đổi vai trò cho nhiều người dùng được chọn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Chức năng gán vai trò hàng loạt đang được phát triển
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>Export dữ liệu người dùng</CardTitle>
              <CardDescription>
                Xuất danh sách người dùng ra file CSV hoặc Excel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Chức năng export đang được phát triển
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

