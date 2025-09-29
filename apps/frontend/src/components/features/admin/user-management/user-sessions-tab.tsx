/**
 * User Sessions Tab Component
 * Component tab sessions user với active sessions và session management
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Badge } from "@/components/ui/display/badge";
import { Button } from "@/components/ui/form/button";
import {
  Monitor,
  MapPin,
  Clock,
  Smartphone,
  Laptop,
  Tablet,
  X,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

import { AdminUser } from "@/types/user/admin";
import { toast } from "@/hooks/use-toast";

// Import mockdata functions
import {
  getUserSessions,
  terminateUserSession,
  type UserSession,
} from "@/lib/mockdata/user-management";
// AdminUser imported from canonical source above

/**
 * User Sessions Tab Props
 */
interface UserSessionsTabProps {
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
 * Format duration
 */
function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} phút`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Get device icon
 */
function getDeviceIcon(device: string) {
  switch (device.toLowerCase()) {
    case 'mobile':
      return <Smartphone className="h-4 w-4" />;
    case 'tablet':
      return <Tablet className="h-4 w-4" />;
    case 'desktop':
    default:
      return <Laptop className="h-4 w-4" />;
  }
}

/**
 * User Sessions Tab Component
 */
export function UserSessionsTab({
  user,
  className = "",
}: UserSessionsTabProps) {
  // State management
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [terminatingSession, setTerminatingSession] = useState<string | null>(null);

  /**
   * Load user sessions
   */
  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const userSessions = await getUserSessions(user.id);
      setSessions(userSessions);
    } catch (error) {
      console.error("Error loading user sessions:", error);
      toast({
        title: "Lỗi tải sessions",
        description: "Không thể tải danh sách sessions của user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user.id]);

  /**
   * Handle terminate session
   */
  const handleTerminateSession = async (sessionId: string) => {
    if (!confirm("Bạn có chắc chắn muốn terminate session này?")) {
      return;
    }

    setTerminatingSession(sessionId);
    try {
      await terminateUserSession(sessionId);
      
      // Update local state
      setSessions(prev => 
        prev.map(session => 
          session.id === sessionId 
            ? { ...session, isActive: false, lastActivity: new Date().toISOString() }
            : session
        )
      );

      toast({
        title: "Đã terminate session",
        description: "Session đã được terminate thành công",
      });
    } catch (error) {
      console.error("Error terminating session:", error);
      toast({
        title: "Lỗi terminate session",
        description: "Không thể terminate session",
        variant: "destructive",
      });
    } finally {
      setTerminatingSession(null);
    }
  };

  /**
   * Handle terminate all sessions
   */
  const handleTerminateAllSessions = async () => {
    if (!confirm("Bạn có chắc chắn muốn terminate tất cả sessions?")) {
      return;
    }

    const activeSessions = sessions.filter(s => s.isActive);
    
    for (const session of activeSessions) {
      try {
        await terminateUserSession(session.id);
      } catch (error) {
        console.error(`Error terminating session ${session.id}:`, error);
      }
    }

    // Reload sessions
    await loadSessions();

    toast({
      title: "Đã terminate tất cả sessions",
      description: `Đã terminate ${activeSessions.length} active sessions`,
    });
  };

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const activeSessions = sessions.filter(s => s.isActive);
  const inactiveSessions = sessions.filter(s => !s.isActive);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Sessions Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Sessions Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-green-600">{activeSessions.length}</div>
              <div className="text-sm text-muted-foreground">Active Sessions</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-gray-600">{inactiveSessions.length}</div>
              <div className="text-sm text-muted-foreground">Inactive Sessions</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-blue-600">{sessions.length}</div>
              <div className="text-sm text-muted-foreground">Total Sessions</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-purple-600">
                {sessions.filter(s => s.device === 'Mobile').length}
              </div>
              <div className="text-sm text-muted-foreground">Mobile Sessions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Active Sessions ({activeSessions.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadSessions}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              {activeSessions.length > 0 && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleTerminateAllSessions}
                >
                  <X className="h-4 w-4 mr-2" />
                  Terminate All
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Đang tải sessions...</span>
            </div>
          ) : activeSessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Monitor className="h-8 w-8 mx-auto mb-2" />
              <p>Không có active sessions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeSessions.map((session) => (
                <div key={session.id} className="border rounded p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(session.device)}
                      <span className="font-medium">{session.device}</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleTerminateSession(session.id)}
                      disabled={terminatingSession === session.id}
                    >
                      {terminatingSession === session.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      Terminate
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                        <span>{session.browser}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{session.location || "Unknown location"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Duration: {formatDuration(session.duration)}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="text-muted-foreground">IP Address:</span>
                        <span className="ml-2 font-mono">{session.ipAddress}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Started:</span>
                        <span className="ml-2">{formatDate(session.startTime)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Activity:</span>
                        <span className="ml-2">{formatDate(session.lastActivity)}</span>
                      </div>
                    </div>
                  </div>

                  <details className="text-sm">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                      User Agent
                    </summary>
                    <div className="mt-2 p-2 bg-muted/25 rounded font-mono text-xs">
                      {session.userAgent}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Inactive Sessions */}
      {inactiveSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Inactive Sessions ({inactiveSessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inactiveSessions.slice(0, 5).map((session) => (
                <div key={session.id} className="border rounded p-3 opacity-75">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(session.device)}
                      <span className="font-medium">{session.device}</span>
                      <Badge variant="outline">Inactive</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(session.lastActivity)}
                    </span>
                  </div>

                  <div className="mt-2 text-sm text-muted-foreground">
                    {session.browser} • {session.ipAddress} • Duration: {formatDuration(session.duration)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Security Warning */}
      {activeSessions.length > (user.activeSessionsCount ?? 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Session Security Warning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-600">
              User có {activeSessions.length} active sessions, nhiều hơn expected count ({user.activeSessionsCount}). 
              Hãy kiểm tra và terminate các sessions không cần thiết.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
