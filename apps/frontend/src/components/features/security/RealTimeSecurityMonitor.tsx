/**
 * Real-Time Security Monitor Component
 * Component để theo dõi bảo mật real-time
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  AlertTriangle,
  Activity,
  Eye,
  Unlock,
  Clock,
  MapPin,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Zap,
  Ban
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ===== TYPES =====

export interface RealTimeSecurityMonitorProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface SecurityEvent {
  id: string;
  type: 'LOGIN_ATTEMPT' | 'SUSPICIOUS_ACTIVITY' | 'RATE_LIMIT' | 'SECURITY_VIOLATION' | 'ACCOUNT_LOCKED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userId?: string;
  userEmail?: string;
  ipAddress: string;
  location?: string;
  userAgent?: string;
  description: string;
  timestamp: Date;
  blocked: boolean;
  riskScore: number;
}

interface ThreatIntelligence {
  id: string;
  threatType: 'BRUTE_FORCE' | 'ACCOUNT_TAKEOVER' | 'SUSPICIOUS_LOCATION' | 'RATE_LIMIT_EXCEEDED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  sourceIP: string;
  targetUsers: string[];
  firstSeen: Date;
  lastSeen: Date;
  eventCount: number;
  mitigationStatus: 'DETECTED' | 'INVESTIGATING' | 'MITIGATED' | 'RESOLVED';
  description: string;
}

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  blockedAttempts: number;
  activeThreats: number;
  riskScore: number;
  lastUpdated: string;
}

// ===== CONSTANTS =====

const _SEVERITY_COLORS = {
  LOW: 'bg-blue-500',
  MEDIUM: 'bg-yellow-500',
  HIGH: 'bg-orange-500',
  CRITICAL: 'bg-red-500'
};

const THREAT_ICONS = {
  BRUTE_FORCE: Ban,
  ACCOUNT_TAKEOVER: Unlock,
  SUSPICIOUS_LOCATION: MapPin,
  RATE_LIMIT_EXCEEDED: Zap
};

// ===== MAIN COMPONENT =====

export const RealTimeSecurityMonitor: React.FC<RealTimeSecurityMonitorProps> = ({
  className,
  autoRefresh = true,
  refreshInterval = 30000
}) => {
  // ===== STATE =====

  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [threatIntelligence, setThreatIntelligence] = useState<ThreatIntelligence[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // ===== HANDLERS =====

  const loadSecurityData = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with real gRPC service calls
      // const [events, threats, metrics] = await Promise.all([
      //   SecurityService.getRecentEvents(),
      //   SecurityService.getThreatIntelligence(),
      //   SecurityService.getSecurityMetrics()
      // ]);

      // Mock data generation
      const events: SecurityEvent[] = Array.from({ length: 20 }, (_, i) => ({
        id: `event-${i}`,
        type: ['LOGIN_ATTEMPT', 'SUSPICIOUS_ACTIVITY', 'RATE_LIMIT', 'SECURITY_VIOLATION', 'ACCOUNT_LOCKED'][Math.floor(Math.random() * 5)] as SecurityEvent['type'],
        severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)] as SecurityEvent['severity'],
        userId: `user-${Math.floor(Math.random() * 100)}`,
        userEmail: `user${Math.floor(Math.random() * 100)}@example.com`,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        location: ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Cần Thơ'][Math.floor(Math.random() * 4)],
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        description: [
          'Đăng nhập thành công từ thiết bị mới',
          'Nhiều lần đăng nhập thất bại',
          'Truy cập từ địa chỉ IP đáng nghi',
          'Vượt quá giới hạn tần suất truy cập',
          'Tài khoản bị khóa do vi phạm bảo mật'
        ][Math.floor(Math.random() * 5)],
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        blocked: Math.random() > 0.7,
        riskScore: Math.floor(Math.random() * 100)
      }));

      const threats: ThreatIntelligence[] = Array.from({ length: 5 }, (_, i) => ({
        id: `threat-${i}`,
        threatType: ['BRUTE_FORCE', 'ACCOUNT_TAKEOVER', 'SUSPICIOUS_LOCATION', 'RATE_LIMIT_EXCEEDED'][Math.floor(Math.random() * 4)] as ThreatIntelligence['threatType'],
        severity: ['MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 3)] as ThreatIntelligence['severity'],
        sourceIP: `10.0.0.${Math.floor(Math.random() * 255)}`,
        targetUsers: [`user-${Math.floor(Math.random() * 100)}`, `user-${Math.floor(Math.random() * 100)}`],
        firstSeen: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        lastSeen: new Date(Date.now() - Math.random() * 60 * 60 * 1000),
        eventCount: Math.floor(Math.random() * 50) + 1,
        mitigationStatus: ['DETECTED', 'INVESTIGATING', 'MITIGATED', 'RESOLVED'][Math.floor(Math.random() * 4)] as ThreatIntelligence['mitigationStatus'],
        description: [
          'Tấn công brute force từ nhiều IP',
          'Cố gắng chiếm quyền tài khoản',
          'Truy cập từ vị trí bất thường',
          'Vượt quá giới hạn tần suất'
        ][Math.floor(Math.random() * 4)]
      }));

      // Calculate metrics
      const metrics: SecurityMetrics = {
        totalEvents: events.length,
        criticalEvents: events.filter(e => e.severity === 'CRITICAL').length,
        blockedAttempts: events.filter(e => e.blocked).length,
        activeThreats: threats.filter(t => t.mitigationStatus !== 'RESOLVED').length,
        riskScore: Math.floor(Math.random() * 100),
        lastUpdated: new Date().toISOString()
      };

      setSecurityEvents(events);
      setThreatIntelligence(threats);
      setSecurityMetrics(metrics);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleManualRefresh = useCallback(() => {
    loadSecurityData();
  }, [loadSecurityData]);

  // ===== EFFECTS =====

  useEffect(() => {
    loadSecurityData();

    if (autoRefresh) {
      const interval = setInterval(loadSecurityData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, loadSecurityData]);

  // ===== RENDER FUNCTIONS =====

  const renderSecurityMetrics = () => {
    if (!securityMetrics) return null;

    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng sự kiện</p>
                <p className="text-2xl font-bold">{securityMetrics.totalEvents}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sự kiện nghiêm trọng</p>
                <p className="text-2xl font-bold text-red-600">{securityMetrics.criticalEvents}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Đã chặn</p>
                <p className="text-2xl font-bold text-green-600">{securityMetrics.blockedAttempts}</p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mối đe dọa</p>
                <p className="text-2xl font-bold text-orange-600">{securityMetrics.activeThreats}</p>
              </div>
              <Eye className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Điểm rủi ro</p>
                <p className="text-2xl font-bold">{securityMetrics.riskScore}</p>
              </div>
              {securityMetrics.riskScore > 70 ? (
                <TrendingUp className="h-8 w-8 text-red-500" />
              ) : (
                <TrendingDown className="h-8 w-8 text-green-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderSecurityEvents = () => (
    <div className="space-y-4">
      <AnimatePresence>
        {securityEvents.slice(0, 10).map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="border rounded-lg p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={event.severity === 'CRITICAL' ? 'destructive' : 'secondary'}>
                    {event.severity}
                  </Badge>
                  <Badge variant="outline">{event.type}</Badge>
                  {event.blocked && (
                    <Badge variant="destructive">
                      <Ban className="h-3 w-3 mr-1" />
                      Đã chặn
                    </Badge>
                  )}
                </div>
                <p className="font-medium mb-1">{event.description}</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center gap-4">
                    <span>IP: {event.ipAddress}</span>
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {event.timestamp.toLocaleString('vi-VN')}
                    </span>
                  </div>
                  {event.userEmail && (
                    <div>User: {event.userEmail}</div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">Risk: {event.riskScore}</div>
                <div className={`w-16 h-2 rounded-full mt-1 ${
                  event.riskScore > 70 ? 'bg-red-500' :
                  event.riskScore > 40 ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  const renderThreatIntelligence = () => (
    <div className="space-y-4">
      {threatIntelligence.map((threat) => {
        const ThreatIcon = THREAT_ICONS[threat.threatType];
        return (
          <Card key={threat.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ThreatIcon className="h-5 w-5 text-red-500" />
                  <Badge variant={threat.severity === 'CRITICAL' ? 'destructive' : 'secondary'}>
                    {threat.severity}
                  </Badge>
                  <Badge variant="outline">{threat.mitigationStatus}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {threat.eventCount} events
                </div>
              </div>
              
              <h4 className="font-medium mb-2">{threat.description}</h4>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Source IP:</span> {threat.sourceIP}
                </div>
                <div>
                  <span className="font-medium">Target Users:</span> {threat.targetUsers.length}
                </div>
                <div>
                  <span className="font-medium">First Seen:</span> {threat.firstSeen.toLocaleDateString('vi-VN')}
                </div>
                <div>
                  <span className="font-medium">Last Seen:</span> {threat.lastSeen.toLocaleString('vi-VN')}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  // ===== MAIN RENDER =====

  if (isLoading && !securityMetrics) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Đang tải dữ liệu bảo mật...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Giám sát bảo mật real-time</h2>
          <p className="text-muted-foreground">
            Theo dõi các sự kiện bảo mật và mối đe dọa trong thời gian thực
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            Cập nhật lần cuối: {lastRefresh.toLocaleTimeString('vi-VN')}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Security Metrics */}
      {renderSecurityMetrics()}

      {/* Main Content */}
      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Sự kiện bảo mật
          </TabsTrigger>
          <TabsTrigger value="threats" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Mối đe dọa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Sự kiện bảo mật gần đây</CardTitle>
              <CardDescription>
                Danh sách các sự kiện bảo mật được phát hiện trong 24 giờ qua
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderSecurityEvents()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats">
          <Card>
            <CardHeader>
              <CardTitle>Phân tích mối đe dọa</CardTitle>
              <CardDescription>
                Thông tin chi tiết về các mối đe dọa được phát hiện và trạng thái xử lý
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderThreatIntelligence()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealTimeSecurityMonitor;
