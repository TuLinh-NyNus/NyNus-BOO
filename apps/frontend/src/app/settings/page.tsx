"use client";

import React from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/auth-context-grpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import AdvancedUserSettings from "@/components/features/settings/AdvancedUserSettings";

// Disable static generation - requires client-side data
export const dynamic = 'force-dynamic';

/**
 * User Settings Page
 * Trang cài đặt người dùng
 * 
 * Features:
 * - Cài đặt tài khoản
 * - Tùy chọn giao diện
 * - Cài đặt thông báo
 * - Bảo mật và quyền riêng tư
 */
export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Chưa đăng nhập
            </CardTitle>
            <CardDescription>
              Bạn cần đăng nhập để truy cập trang cài đặt.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/login")} className="w-full">
              Đăng nhập
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Gradient Background */}
      <div className="relative bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-orange-500/20 dark:from-purple-500/10 dark:via-pink-500/5 dark:to-orange-500/10">
        <div className="absolute inset-0 bg-grid-white/10 dark:bg-grid-black/10" />
        <div className="relative container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <SettingsIcon className="h-10 w-10" />
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">
                  Cài đặt
                </h1>
                <p className="text-muted-foreground text-lg">
                  Quản lý tài khoản và tùy chọn cá nhân của bạn
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content - AdvancedUserSettings Component */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <AdvancedUserSettings />
        </motion.div>
      </div>
    </div>
  );
}

