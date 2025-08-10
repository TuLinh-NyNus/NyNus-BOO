/**
 * User Activity Tab Component
 * Component tab hoạt động user với activity logs và timeline
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Badge } from "@/components/ui/display/badge";
import { Button } from "@/components/ui/form/button";
import {
  Activity,
  Clock,
  MapPin,
  Monitor,
  FileText,
  User,
  Shield,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { UserRole } from "@/lib/mockdata/core-types";
import { toast } from "@/hooks/use-toast";

// Import mockdata functions
import {
  getUserActivities,
  type UserActivity,
} from "@/lib/mockdata/user-management";

/**
 * Admin User interface (simplified)
 */
interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  status: string;
}

/**
 * User Activity Tab Props
 */
interface UserActivityTabProps {
  user: AdminUser;
  className?: string;
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Get activity icon
 */
function getActivityIcon(action: string) {
  switch (action.toLowerCase()) {
    case 'login':
      return <User className="h-4 w-4" />;
    case 'logout':
      return <User className="h-4 w-4" />;
    case 'question_create':
      return <FileText className="h-4 w-4" />;
    case 'question_edit':
      return <FileText className="h-4 w-4" />;
    case 'role_change':
      return <Shield className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
}

/**
 * Get risk level badge color
 */
function getRiskLevelBadgeColor(riskLevel: string) {
  switch (riskLevel.toLowerCase()) {
    case 'low':
      return "bg-green-100 text-green-800";
    case 'medium':
      return "bg-yellow-100 text-yellow-800";
    case 'high':
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/**
 * User Activity Tab Component
 */
export function UserActivityTab({
  user,
  className = "",
}: UserActivityTabProps) {
  // State management
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [limit, setLimit] = useState(50);

  /**
   * Load user activities
   */
  const loadActivities = useCallback(async () => {
    setIsLoading(true);
    try {
      const userActivities = await getUserActivities(user.id, limit);
      setActivities(userActivities);
    } catch (error) {
      console.error("Error loading user activities:", error);
      toast({
        title: "Lỗi tải activities",
        description: "Không thể tải danh sách hoạt động của user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user.id, limit]);

  // Load activities on mount
  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Activity Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Tổng quan hoạt động
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-blue-600">{activities.length}</div>
              <div className="text-sm text-muted-foreground">Total Activities</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-green-600">
                {activities.filter(a => a.action === 'LOGIN').length}
              </div>
              <div className="text-sm text-muted-foreground">Login Events</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-purple-600">
                {activities.filter(a => a.action.includes('QUESTION')).length}
              </div>
              <div className="text-sm text-muted-foreground">Question Actions</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-orange-600">
                {activities.filter(a => a.riskLevel === 'HIGH').length}
              </div>
              <div className="text-sm text-muted-foreground">High Risk</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Activity Timeline
            </CardTitle>
            <div className="flex items-center gap-2">
              <select
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value={25}>25 activities</option>
                <option value={50}>50 activities</option>
                <option value={100}>100 activities</option>
              </select>
              <Button variant="outline" size="sm" onClick={loadActivities}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Đang tải activities...</span>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2" />
              <p>Không có hoạt động nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={activity.id} className="flex gap-4 p-4 border rounded">
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                      {getActivityIcon(activity.action)}
                    </div>
                    {index < activities.length - 1 && (
                      <div className="w-px h-8 bg-gray-200 mt-2" />
                    )}
                  </div>

                  {/* Activity content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{activity.action}</span>
                        <Badge className={getRiskLevelBadgeColor(activity.riskLevel)}>
                          {activity.riskLevel}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(activity.timestamp)}
                      </span>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Resource: {activity.resource}
                      {activity.resourceId && ` (ID: ${activity.resourceId})`}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {activity.ipAddress}
                      </div>
                      <div className="flex items-center gap-1">
                        <Monitor className="h-3 w-3" />
                        {activity.userAgent.split(' ')[0]}
                      </div>
                    </div>

                    {Object.keys(activity.details).length > 0 && (
                      <details className="text-sm">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                          View details
                        </summary>
                        <div className="mt-2 p-2 bg-muted/25 rounded">
                          <pre className="text-xs overflow-x-auto">
                            {JSON.stringify(activity.details, null, 2)}
                          </pre>
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" size="sm" className="justify-start">
              <User className="h-4 w-4 mr-2" />
              Login Events
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Question Actions
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Shield className="h-4 w-4 mr-2" />
              Security Events
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Activity className="h-4 w-4 mr-2" />
              All Activities
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
