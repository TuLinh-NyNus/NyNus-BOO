/**
 * User Security Tab Component
 * Component tab bảo mật user với security events và settings
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Badge } from "@/components/ui/display/badge";
import { Button } from "@/components/ui/form/button";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  Eye,
  MapPin,
  Loader2,
} from "lucide-react";

import { UserRole } from "@/lib/mockdata/core-types";
import { toast } from "@/hooks/use-toast";

// Import mockdata functions
import {
  getSecurityEvents,
  resolveSecurityEvent,
  type SecurityEvent,
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
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
  activeSessionsCount: number;
  totalResourceAccess: number;
  riskScore?: number;
  permissions?: string[];
  isActive?: boolean;
  maxConcurrentSessions?: number;
  lastLoginIp?: string;
  loginAttempts?: number;
  lockedUntil?: Date;
}

/**
 * User Security Tab Props
 */
interface UserSecurityTabProps {
  user: AdminUser;
  isEditing?: boolean;
  onUpdate?: (updatedUser: AdminUser) => void;
  isLoading?: boolean;
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
 * Get severity badge color
 */
function getSeverityBadgeColor(severity: string) {
  switch (severity.toLowerCase()) {
    case 'low':
      return "bg-green-100 text-green-800";
    case 'medium':
      return "bg-yellow-100 text-yellow-800";
    case 'high':
      return "bg-orange-100 text-orange-800";
    case 'critical':
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/**
 * Get event type icon
 */
function getEventTypeIcon(eventType: string) {
  switch (eventType) {
    case 'LOGIN_ATTEMPT':
      return <Lock className="h-4 w-4" />;
    case 'PASSWORD_CHANGE':
      return <Shield className="h-4 w-4" />;
    case 'SUSPICIOUS_ACTIVITY':
      return <AlertTriangle className="h-4 w-4" />;
    case 'ACCOUNT_LOCKED':
      return <XCircle className="h-4 w-4" />;
    default:
      return <Eye className="h-4 w-4" />;
  }
}

/**
 * User Security Tab Component
 */
export function UserSecurityTab({
  user,
  isEditing = false,
  className = "",
}: UserSecurityTabProps) {
  // State management
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isResolvingEvent, setIsResolvingEvent] = useState<string | null>(null);

  /**
   * Load security events
   */
  const loadSecurityEvents = useCallback(async () => {
    setIsLoadingEvents(true);
    try {
      const events = await getSecurityEvents(user.id);
      setSecurityEvents(events);
    } catch (error) {
      console.error("Error loading security events:", error);
      toast({
        title: "Lỗi tải security events",
        description: "Không thể tải danh sách security events",
        variant: "destructive",
      });
    } finally {
      setIsLoadingEvents(false);
    }
  }, [user.id]);

  /**
   * Handle resolve security event
   */
  const handleResolveEvent = async (eventId: string) => {
    setIsResolvingEvent(eventId);
    try {
      await resolveSecurityEvent(eventId, 'current-admin'); // In real app, get from auth context
      
      // Update local state
      setSecurityEvents(prev => 
        prev.map(event => 
          event.id === eventId 
            ? { ...event, resolved: true, resolvedBy: 'current-admin', resolvedAt: new Date().toISOString() }
            : event
        )
      );

      toast({
        title: "Đã resolve security event",
        description: "Security event đã được đánh dấu là đã xử lý",
      });
    } catch (error) {
      console.error("Error resolving security event:", error);
      toast({
        title: "Lỗi resolve security event",
        description: "Không thể resolve security event",
        variant: "destructive",
      });
    } finally {
      setIsResolvingEvent(null);
    }
  };

  // Load security events on mount
  useEffect(() => {
    loadSecurityEvents();
  }, [loadSecurityEvents]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Tổng quan bảo mật
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-blue-600">{user.riskScore || 0}</div>
              <div className="text-sm text-muted-foreground">Risk Score</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-orange-600">{user.loginAttempts || 0}</div>
              <div className="text-sm text-muted-foreground">Login Attempts</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-green-600">{user.activeSessionsCount}</div>
              <div className="text-sm text-muted-foreground">Active Sessions</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-purple-600">{user.maxConcurrentSessions || 3}</div>
              <div className="text-sm text-muted-foreground">Max Sessions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Security Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Trạng thái bảo mật
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded">
            <div className="flex items-center gap-2">
              {user.emailVerified ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>Email verification</span>
            </div>
            <Badge className={user.emailVerified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
              {user.emailVerified ? "Verified" : "Not verified"}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 border rounded">
            <div className="flex items-center gap-2">
              {user.status === 'ACTIVE' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>Account status</span>
            </div>
            <Badge className={user.status === 'ACTIVE' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
              {user.status}
            </Badge>
          </div>

          {user.lockedUntil && (
            <div className="flex items-center justify-between p-3 border rounded bg-red-50">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-red-500" />
                <span>Account locked until</span>
              </div>
              <span className="text-red-600 font-medium">
                {formatDate(user.lockedUntil.toISOString())}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between p-3 border rounded">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span>Last login IP</span>
            </div>
            <span className="font-mono text-sm">
              {user.lastLoginIp || "N/A"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Security Events
            <Button variant="outline" size="sm" onClick={loadSecurityEvents}>
              <Loader2 className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingEvents ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Đang tải security events...</span>
            </div>
          ) : securityEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-8 w-8 mx-auto mb-2" />
              <p>Không có security events nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {securityEvents.map((event) => (
                <div key={event.id} className="border rounded p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getEventTypeIcon(event.eventType)}
                      <span className="font-medium">{event.eventType}</span>
                      <Badge className={getSeverityBadgeColor(event.severity)}>
                        {event.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(event.timestamp)}
                      </span>
                      {!event.resolved && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveEvent(event.id)}
                          disabled={isResolvingEvent === event.id}
                        >
                          {isResolvingEvent === event.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            "Resolve"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    IP: {event.ipAddress}
                  </div>

                  {Object.keys(event.details).length > 0 && (
                    <div className="text-sm bg-muted/25 p-2 rounded">
                      <strong>Details:</strong>
                      <pre className="mt-1 text-xs">
                        {JSON.stringify(event.details, null, 2)}
                      </pre>
                    </div>
                  )}

                  {event.resolved && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>
                        Resolved by {event.resolvedBy} at {formatDate(event.resolvedAt!)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Actions */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Lock className="h-4 w-4 mr-2" />
                Lock Account
              </Button>
              <Button variant="outline" size="sm">
                <Unlock className="h-4 w-4 mr-2" />
                Unlock Account
              </Button>
              <Button variant="outline" size="sm">
                <Shield className="h-4 w-4 mr-2" />
                Reset Password
              </Button>
              <Button variant="outline" size="sm">
                <XCircle className="h-4 w-4 mr-2" />
                Terminate All Sessions
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
