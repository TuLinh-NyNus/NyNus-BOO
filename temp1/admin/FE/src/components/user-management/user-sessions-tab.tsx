/**
 * User Sessions Tab Component
 * Component tab quản lý phiên đăng nhập user
 */

"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Alert,
  AlertDescription,
} from "@/components/ui";
import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  MapPin,
  Clock,
  Wifi,
  WifiOff,
  LogOut,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Trash2,
} from "lucide-react";

import { AdminUser } from "../../types/admin-user";

/**
 * User Sessions Tab Props
 * Props cho User Sessions Tab component
 */
interface UserSessionsTabProps {
  user: AdminUser;
  className?: string;
}

/**
 * Session interface
 * Interface cho session
 */
interface UserSession {
  id: string;
  deviceType: "desktop" | "mobile" | "tablet";
  deviceName: string;
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  isActive: boolean;
  isCurrent: boolean;
  lastActivity: string;
  createdAt: string;
  userAgent: string;
}

/**
 * Mock sessions data
 * Mock sessions data
 */
const mockSessions: UserSession[] = [
  {
    id: "1",
    deviceType: "desktop",
    deviceName: "Windows PC",
    browser: "Chrome 120.0.0.0",
    os: "Windows 11",
    ipAddress: "192.168.1.100",
    location: "Hà Nội, Việt Nam",
    isActive: true,
    isCurrent: true,
    lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  },
  {
    id: "2",
    deviceType: "mobile",
    deviceName: "iPhone 15",
    browser: "Safari 17.0",
    os: "iOS 17.1",
    ipAddress: "192.168.1.101",
    location: "Hà Nội, Việt Nam",
    isActive: true,
    isCurrent: false,
    lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X)",
  },
  {
    id: "3",
    deviceType: "tablet",
    deviceName: "iPad Pro",
    browser: "Safari 17.0",
    os: "iPadOS 17.1",
    ipAddress: "10.0.0.50",
    location: "Hồ Chí Minh, Việt Nam",
    isActive: false,
    isCurrent: false,
    lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  },
];

/**
 * Get device icon
 * Lấy icon cho device
 */
function getDeviceIcon(deviceType: string) {
  switch (deviceType) {
    case "mobile":
      return <Smartphone className="h-4 w-4" />;
    case "tablet":
      return <Tablet className="h-4 w-4" />;
    default:
      return <Monitor className="h-4 w-4" />;
  }
}

/**
 * Format time ago
 * Format thời gian trước đây
 */
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffMinutes < 60) {
    return `${diffMinutes} phút trước`;
  } else if (diffMinutes < 1440) {
    return `${Math.floor(diffMinutes / 60)} giờ trước`;
  } else {
    return `${Math.floor(diffMinutes / 1440)} ngày trước`;
  }
}

/**
 * Format full date
 * Format ngày đầy đủ
 */
function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * User Sessions Tab Component
 * Component tab quản lý phiên đăng nhập
 */
export function UserSessionsTab({ user, className = "" }: UserSessionsTabProps) {
  const [terminatingSession, setTerminatingSession] = useState<string | null>(null);

  const activeSessions = mockSessions.filter((session) => session.isActive);
  const inactiveSessions = mockSessions.filter((session) => !session.isActive);

  /**
   * Handle terminate session
   * Xử lý kết thúc phiên
   */
  const handleTerminateSession = async (sessionId: string) => {
    setTerminatingSession(sessionId);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Phiên đăng nhập đã được kết thúc!");
    } catch (error) {
      console.error("Failed to terminate session:", error);
    } finally {
      setTerminatingSession(null);
    }
  };

  /**
   * Handle terminate all sessions
   * Xử lý kết thúc tất cả phiên
   */
  const handleTerminateAllSessions = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Tất cả phiên đăng nhập đã được kết thúc!");
    } catch (error) {
      console.error("Failed to terminate all sessions:", error);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Sessions Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Phiên hoạt động</p>
                <p className="text-2xl font-bold">{activeSessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm text-muted-foreground">Phiên đã kết thúc</p>
                <p className="text-2xl font-bold">{inactiveSessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Tổng phiên</p>
                <p className="text-2xl font-bold">{mockSessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5 text-green-600" />
              Phiên đang hoạt động
              <Badge variant="secondary">{activeSessions.length}</Badge>
            </CardTitle>
            {activeSessions.length > 1 && (
              <Button variant="destructive" size="sm" onClick={handleTerminateAllSessions}>
                <LogOut className="h-3 w-3 mr-1" />
                Kết thúc tất cả
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {activeSessions.length === 0 ? (
            <div className="text-center py-8">
              <WifiOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Không có phiên hoạt động nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeSessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        {getDeviceIcon(session.deviceType)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{session.deviceName}</h4>
                          {session.isCurrent && (
                            <Badge variant="default" className="text-xs">
                              Phiên hiện tại
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>
                            {session.browser} trên {session.os}
                          </p>
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {session.ipAddress}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {session.location}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Hoạt động: {formatTimeAgo(session.lastActivity)}
                            </span>
                            <span>Bắt đầu: {formatFullDate(session.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {!session.isCurrent && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTerminateSession(session.id)}
                        disabled={terminatingSession === session.id}
                      >
                        <LogOut className="h-3 w-3 mr-1" />
                        {terminatingSession === session.id ? "Đang kết thúc..." : "Kết thúc"}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inactive Sessions */}
      {inactiveSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WifiOff className="h-5 w-5 text-gray-600" />
              Phiên đã kết thúc
              <Badge variant="outline">{inactiveSessions.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inactiveSessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-4 opacity-60">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      {getDeviceIcon(session.deviceType)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{session.deviceName}</h4>
                        <Badge variant="outline" className="text-xs">
                          Đã kết thúc
                        </Badge>
                      </div>

                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>
                          {session.browser} trên {session.os}
                        </p>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {session.ipAddress}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {session.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Kết thúc: {formatTimeAgo(session.lastActivity)}
                          </span>
                          <span>Thời gian: {formatFullDate(session.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Notice */}
      {activeSessions.length > 2 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Cảnh báo bảo mật:</strong> Người dùng có {activeSessions.length} phiên đăng nhập
            hoạt động. Hãy kiểm tra xem có phiên nào đáng ngờ và kết thúc nếu cần thiết.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
