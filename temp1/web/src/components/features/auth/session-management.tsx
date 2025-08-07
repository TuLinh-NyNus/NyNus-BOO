'use client';

import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  MapPin, 
  Clock, 
  Shield, 
  AlertTriangle,
  X,
  Eye,
  Trash2
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui';
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Separator } from "@/components/ui/display/separator";
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";

/**
 * Session Management Component
 * 
 * Component này cung cấp:
 * - Hiển thị danh sách active sessions
 * - Thông tin device và location cho mỗi session
 * - Risk assessment và trusted device status
 * - Khả năng revoke sessions
 * - Device trust management
 */

interface SessionInfo {
  id: string;
  sessionId: string;
  deviceInfo: {
    browser?: string;
    os?: string;
    device?: string;
    userAgent: string;
  };
  ipAddress: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
  deviceFingerprint: string;
  riskScore: number;
  isTrusted: boolean;
  isActive: boolean;
  isCurrent: boolean;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
}

interface SessionManagementProps {
  userId: string;
  currentSessionId: string;
}

function SessionManagement({ userId, currentSessionId }: SessionManagementProps): JSX.Element {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  // Load sessions
  useEffect(() => {
    loadSessions();
  }, [userId]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/sessions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải danh sách phiên đăng nhập');
      }

      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      setRevoking(sessionId);

      const response = await fetch(`/api/auth/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể thu hồi phiên đăng nhập');
      }

      // Reload sessions
      await loadSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setRevoking(null);
    }
  };

  const trustDevice = async (sessionId: string, fingerprint: string) => {
    try {
      const response = await fetch('/api/auth/devices/trust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ fingerprint }),
      });

      if (!response.ok) {
        throw new Error('Không thể đánh dấu thiết bị tin cậy');
      }

      // Reload sessions
      await loadSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    }
  };

  const getDeviceIcon = (deviceInfo: SessionInfo['deviceInfo']) => {
    const userAgent = deviceInfo.userAgent.toLowerCase();
    
    if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
      return <Smartphone className="h-5 w-5" />;
    } else if (userAgent.includes('tablet') || userAgent.includes('ipad')) {
      return <Tablet className="h-5 w-5" />;
    } else {
      return <Monitor className="h-5 w-5" />;
    }
  };

  const getRiskBadge = (riskScore: number) => {
    if (riskScore < 30) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Thấp</Badge>;
    } else if (riskScore < 70) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Trung bình</Badge>;
    } else {
      return <Badge variant="destructive">Cao</Badge>;
    }
  };

  const getLocationString = (location?: SessionInfo['location']) => {
    if (!location) return 'Không xác định';
    
    const parts = [location.city, location.region, location.country].filter(Boolean);
    return parts.join(', ') || 'Không xác định';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quản lý phiên đăng nhập</CardTitle>
          <CardDescription>Đang tải...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Quản lý phiên đăng nhập
          </CardTitle>
          <CardDescription>
            Xem và quản lý tất cả các phiên đăng nhập đang hoạt động của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {sessions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Không có phiên đăng nhập nào
              </p>
            ) : (
              sessions.map((session) => (
                <Card key={session.id} className={session.isCurrent ? 'border-primary' : ''}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getDeviceIcon(session.deviceInfo)}
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">
                              {session.deviceInfo.browser || 'Trình duyệt không xác định'}
                            </h4>
                            {session.isCurrent && (
                              <Badge variant="outline" className="text-xs">
                                Phiên hiện tại
                              </Badge>
                            )}
                            {session.isTrusted && (
                              <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                <Shield className="h-3 w-3 mr-1" />
                                Tin cậy
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{getLocationString(session.location)}</span>
                              <span>•</span>
                              <span>{session.ipAddress}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>
                                Hoạt động lần cuối: {format(new Date(session.lastActivity), 'dd/MM/yyyy HH:mm', { locale: vi })}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span>Mức độ rủi ro:</span>
                              {getRiskBadge(session.riskScore)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!session.isTrusted && session.riskScore < 50 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => trustDevice(session.sessionId, session.deviceFingerprint)}
                          >
                            <Shield className="h-4 w-4 mr-1" />
                            Tin cậy
                          </Button>
                        )}
                        
                        {!session.isCurrent && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => revokeSession(session.sessionId)}
                            disabled={revoking === session.sessionId}
                          >
                            {revoking === session.sessionId ? (
                              'Đang thu hồi...'
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-1" />
                                Thu hồi
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <Separator className="my-6" />

          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={loadSessions}>
              <Eye className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
            
            <Button
              variant="destructive"
              onClick={() => {
                // Revoke all other sessions
                sessions
                  .filter(s => !s.isCurrent)
                  .forEach(s => revokeSession(s.sessionId));
              }}
              disabled={sessions.filter(s => !s.isCurrent).length === 0}
            >
              <X className="h-4 w-4 mr-2" />
              Thu hồi tất cả phiên khác
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Default export for lazy loading
export default SessionManagement;
