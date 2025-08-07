"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/layout/card";
import { Button } from "@/components/ui/forms/button";
import { Input } from "@/components/ui/forms/input";
import { Label } from "@/components/ui/forms/label";
import { Badge } from "@/components/ui/data-display/badge";
import { Progress } from "@/components/ui/data-display/progress";
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import {
  Clock,
  Mail,
  Users,
  AlertTriangle,
  RefreshCw,
  Search,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Interface cho rate limit status
 */
interface RateLimitStatus {
  canSend: boolean;
  hourlyRemaining: number;
  dailyRemaining: number;
  resetHourlyAt: string;
  resetDailyAt: string;
  message?: string;
}

/**
 * Interface cho rate limit statistics
 */
interface RateLimitStatistics {
  totalUsers: number;
  usersNearHourlyLimit: number;
  usersNearDailyLimit: number;
  averageHourlyUsage: number;
  averageDailyUsage: number;
}

/**
 * Rate Limit Dashboard Component
 * Quản lý và monitor email rate limiting
 *
 * Features:
 * - Rate limit statistics overview
 * - Individual user rate limit status
 * - Rate limit reset functionality
 * - Real-time monitoring
 *
 * @author NyNus Team
 * @version 1.0.0
 */
export function RateLimitDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [statistics, setStatistics] = useState<RateLimitStatistics>({
    totalUsers: 0,
    usersNearHourlyLimit: 0,
    usersNearDailyLimit: 0,
    averageHourlyUsage: 0,
    averageDailyUsage: 0,
  });
  const [userSearchId, setUserSearchId] = useState("");
  const [userStatus, setUserStatus] = useState<RateLimitStatus | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  /**
   * Load rate limit statistics
   */
  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/v1/admin/email-notifications/rate-limit/statistics", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error("Failed to load rate limit statistics:", error);
      toast.error("Không thể tải thống kê rate limit");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Search user rate limit status
   */
  const searchUserStatus = async () => {
    if (!userSearchId.trim()) {
      toast.error("Vui lòng nhập User ID");
      return;
    }

    try {
      setIsSearching(true);
      const response = await fetch(
        `/api/v1/admin/email-notifications/rate-limit/status/${userSearchId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      const data = await response.json();
      setUserStatus(data);
    } catch (error) {
      console.error("Failed to search user status:", error);
      toast.error("Không thể tìm kiếm user status");
      setUserStatus(null);
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Reset user rate limit
   */
  const resetUserRateLimit = async () => {
    if (!userSearchId.trim()) {
      toast.error("Vui lòng nhập User ID");
      return;
    }

    try {
      setIsResetting(true);
      const response = await fetch(
        `/api/v1/admin/email-notifications/rate-limit/reset/${userSearchId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Rate limit đã được reset thành công");
        // Refresh user status
        await searchUserStatus();
        // Refresh statistics
        await loadStatistics();
      } else {
        toast.error("Không thể reset rate limit");
      }
    } catch (error) {
      console.error("Failed to reset rate limit:", error);
      toast.error("Lỗi khi reset rate limit");
    } finally {
      setIsResetting(false);
    }
  };

  /**
   * Format time remaining
   */
  const formatTimeRemaining = (dateString: string) => {
    const resetTime = new Date(dateString);
    const now = new Date();
    const diff = resetTime.getTime() - now.getTime();

    if (diff <= 0) return "Đã reset";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  /**
   * Get usage percentage
   */
  const getUsagePercentage = (used: number, total: number) => {
    return Math.round((used / total) * 100);
  };

  /**
   * Load statistics on component mount
   */
  useEffect(() => {
    loadStatistics();

    // Auto refresh every 30 seconds
    const interval = setInterval(loadStatistics, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-6xl space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Email Rate Limit Dashboard
          </CardTitle>
          <CardDescription>
            Monitor và quản lý email rate limiting. Hệ thống giới hạn 5 emails/hour và 50 emails/day
            per user.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div className="text-sm font-medium text-gray-600">Total Users</div>
            </div>
            <div className="text-2xl font-bold">{statistics.totalUsers}</div>
            <div className="text-xs text-gray-500">Có email rate limit tracking</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <div className="text-sm font-medium text-gray-600">Near Hourly Limit</div>
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {statistics.usersNearHourlyLimit}
            </div>
            <div className="text-xs text-gray-500">Users ≥80% hourly limit</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div className="text-sm font-medium text-gray-600">Near Daily Limit</div>
            </div>
            <div className="text-2xl font-bold text-red-600">{statistics.usersNearDailyLimit}</div>
            <div className="text-xs text-gray-500">Users ≥80% daily limit</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-green-600" />
              <div className="text-sm font-medium text-gray-600">Avg Usage</div>
            </div>
            <div className="text-lg font-bold">{statistics.averageHourlyUsage.toFixed(1)}/h</div>
            <div className="text-sm text-gray-500">
              {statistics.averageDailyUsage.toFixed(1)}/day
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            User Rate Limit Status
          </CardTitle>
          <CardDescription>Tìm kiếm và quản lý rate limit status cho user cụ thể</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="userSearch">User ID</Label>
              <Input
                id="userSearch"
                value={userSearchId}
                onChange={(e) => setUserSearchId(e.target.value)}
                placeholder="Nhập User ID để tìm kiếm..."
                onKeyPress={(e) => e.key === "Enter" && searchUserStatus()}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                onClick={searchUserStatus}
                disabled={isSearching}
                className="flex items-center gap-2"
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Tìm kiếm
              </Button>
            </div>
          </div>

          {/* User Status Display */}
          {userStatus && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {userStatus.canSend ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">User ID: {userSearchId}</span>
                <Badge
                  className={
                    userStatus.canSend ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }
                >
                  {userStatus.canSend ? "Can Send" : "Rate Limited"}
                </Badge>
              </div>

              {userStatus.message && (
                <Alert
                  className={
                    userStatus.canSend ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                  }
                >
                  <AlertDescription
                    className={userStatus.canSend ? "text-green-800" : "text-red-800"}
                  >
                    {userStatus.message}
                  </AlertDescription>
                </Alert>
              )}

              {/* Rate Limit Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Hourly Limit */}
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Hourly Limit</span>
                        <span className="text-sm text-gray-500">
                          {5 - userStatus.hourlyRemaining}/5
                        </span>
                      </div>
                      <Progress
                        value={getUsagePercentage(5 - userStatus.hourlyRemaining, 5)}
                        className="h-2"
                      />
                      <div className="text-xs text-gray-500">
                        Reset in: {formatTimeRemaining(userStatus.resetHourlyAt)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Daily Limit */}
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Daily Limit</span>
                        <span className="text-sm text-gray-500">
                          {50 - userStatus.dailyRemaining}/50
                        </span>
                      </div>
                      <Progress
                        value={getUsagePercentage(50 - userStatus.dailyRemaining, 50)}
                        className="h-2"
                      />
                      <div className="text-xs text-gray-500">
                        Reset in: {formatTimeRemaining(userStatus.resetDailyAt)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Reset Button */}
              <div className="flex gap-2">
                <Button
                  onClick={resetUserRateLimit}
                  disabled={isResetting}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {isResetting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Reset Rate Limit
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button
          onClick={loadStatistics}
          disabled={isLoading}
          variant="outline"
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh Statistics
        </Button>
      </div>
    </div>
  );
}
