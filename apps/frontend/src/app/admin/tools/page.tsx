/**
 * Admin Tools Page
 * Trang quản lý các công cụ admin
 */

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { 
  Wrench, 
  Database, 
  FileText, 
  Settings,
  Activity
} from "lucide-react";

/**
 * Admin Tools Page Component
 */
export default function AdminToolsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Wrench className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Admin Tools</h1>
          <p className="text-muted-foreground">
            Các công cụ quản trị và tiện ích hệ thống
          </p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* LaTeX Parser Tool (Placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              LaTeX Parser
            </CardTitle>
            <CardDescription>
              Công cụ parsing câu hỏi từ LaTeX sang CSV
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <p>• Upload LaTeX files</p>
              <p>• Parse questions automatically</p>
              <p>• Export to CSV format</p>
            </div>
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              Tool temporarily disabled
            </div>
          </CardContent>
        </Card>

        {/* Database Tools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Tools
            </CardTitle>
            <CardDescription>
              Công cụ quản lý và bảo trì cơ sở dữ liệu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <p>• Backup & Restore</p>
              <p>• Database Migration</p>
              <p>• Performance Monitoring</p>
            </div>
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              Coming soon...
            </div>
          </CardContent>
        </Card>

        {/* System Monitoring */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Monitor
            </CardTitle>
            <CardDescription>
              Giám sát hiệu suất và trạng thái hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <p>• CPU & Memory Usage</p>
              <p>• API Response Times</p>
              <p>• Error Tracking</p>
            </div>
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              Coming soon...
            </div>
          </CardContent>
        </Card>

        {/* File Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              File Manager
            </CardTitle>
            <CardDescription>
              Quản lý files và tài liệu hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <p>• Upload Management</p>
              <p>• File Cleanup</p>
              <p>• Storage Analytics</p>
            </div>
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              Coming soon...
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Config
            </CardTitle>
            <CardDescription>
              Cấu hình hệ thống và tham số
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <p>• Environment Variables</p>
              <p>• Feature Flags</p>
              <p>• System Parameters</p>
            </div>
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              Coming soon...
            </div>
          </CardContent>
        </Card>

        {/* Placeholder for more tools */}
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center h-full min-h-[200px]">
            <div className="text-center text-muted-foreground">
              <Wrench className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">More tools coming soon...</p>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Các thao tác nhanh thường dùng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <Database className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <p className="text-sm font-medium">DB Backup</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <Activity className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <p className="text-sm font-medium">Health Check</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <FileText className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <p className="text-sm font-medium">Log Viewer</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <Settings className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <p className="text-sm font-medium">Settings</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
