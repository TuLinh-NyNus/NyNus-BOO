'use client';

import { BulkImportUsers } from '@/components/features/admin/user-management/bulk-import-users';
import { BulkRoleAssignment } from '@/components/features/admin/user-management/bulk-role-assignment';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/navigation/tabs";

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
          <BulkImportUsers />
        </TabsContent>

        <TabsContent value="roles">
          <BulkRoleAssignment />
        </TabsContent>

        <TabsContent value="export">
          <div className="text-center py-8 text-muted-foreground">
            Chức năng export đang được phát triển
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
