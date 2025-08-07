"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/data-display/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout/card";
import { Badge } from "@/components/ui/data-display/badge";
import {
  Mail,
  Settings,
  FileText,
  Clock,
  TestTube,
  Shield,
  Users,
  AlertTriangle,
} from "lucide-react";

import { SMTPConfiguration } from "./smtp-configuration";
import { EmailTemplatesManager } from "./email-templates-manager";
import { RateLimitDashboard } from "./rate-limit-dashboard";

/**
 * Email Configuration Main Component
 * Trang chính cho quản lý Email Notification System
 *
 * Features:
 * - SMTP Configuration management
 * - Email Templates management
 * - Rate Limiting dashboard
 * - System overview và status
 *
 * @author NyNus Team
 * @version 1.0.0
 */
export function EmailConfiguration() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Email Notification System</h1>
        <p className="text-gray-600">
          Quản lý hệ thống email notifications cho NyNus platform. Cấu hình SMTP, templates và rate
          limiting.
        </p>
      </div>

      {/* System Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            System Overview
          </CardTitle>
          <CardDescription>Tổng quan trạng thái Email Notification System</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* SMTP Status */}
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Settings className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="font-medium">SMTP Configuration</div>
                <Badge className="bg-green-100 text-green-800">Configured</Badge>
              </div>
            </div>

            {/* Templates Status */}
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <div className="font-medium">Email Templates</div>
                <Badge className="bg-blue-100 text-blue-800">12 Templates</Badge>
              </div>
            </div>

            {/* Rate Limiting */}
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <div className="font-medium">Rate Limiting</div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
            </div>

            {/* System Health */}
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <TestTube className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="font-medium">System Health</div>
                <Badge className="bg-green-100 text-green-800">Healthy</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Configuration Tabs */}
      <Tabs defaultValue="smtp" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="smtp" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            SMTP Configuration
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="rate-limit" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Rate Limiting
          </TabsTrigger>
        </TabsList>

        {/* SMTP Configuration Tab */}
        <TabsContent value="smtp" className="space-y-6">
          <SMTPConfiguration />
        </TabsContent>

        {/* Email Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <EmailTemplatesManager />
        </TabsContent>

        {/* Rate Limiting Tab */}
        <TabsContent value="rate-limit" className="space-y-6">
          <RateLimitDashboard />
        </TabsContent>
      </Tabs>

      {/* Quick Actions & Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Các thao tác nhanh cho Email Notification System</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <span>Test SMTP Connection</span>
              </div>
              <Badge variant="outline">Available</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-600" />
                <span>Preview Email Templates</span>
              </div>
              <Badge variant="outline">Available</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-600" />
                <span>Bulk Email Operations</span>
              </div>
              <Badge variant="outline">Available</Badge>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Information
            </CardTitle>
            <CardDescription>Thông tin và cấu hình hệ thống</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Rate Limits</span>
              <span className="text-sm font-medium">5/hour, 50/day per user</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Supported Events</span>
              <span className="text-sm font-medium">Security, User, System</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Template Categories</span>
              <span className="text-sm font-medium">3 categories, 12 templates</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Priority Levels</span>
              <span className="text-sm font-medium">Low, Normal, High, Critical</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Emergency Bypass</span>
              <Badge className="bg-yellow-100 text-yellow-800">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Available
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Information */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>Email Notification System v1.0.0 - NyNus Admin Dashboard</div>
            <div>Last updated: {new Date().toLocaleDateString("vi-VN")}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default EmailConfiguration;
