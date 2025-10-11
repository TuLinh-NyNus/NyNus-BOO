/**
 * Suspicious Activity Detector Component
 * Component để phát hiện hoạt động đáng nghi
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  Shield,
  Ban,
  Clock,
  MapPin,
  Monitor,
  TrendingUp,
  TrendingDown,
  Zap,
  Users,
  Activity,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ===== TYPES =====

export interface SuspiciousActivityDetectorProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface SuspiciousActivity {
  id: string;
  userId: string;
  userEmail: string;
  activityType: 'BRUTE_FORCE' | 'RAPID_REQUESTS' | 'UNUSUAL_LOCATION' | 'MULTIPLE_SESSIONS' | 'SUSPICIOUS_TIMING';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number;
  description: string;
  evidence: {
    ipAddresses: string[];
    locations: string[];
    requestCount: number;
    timeWindow: string;
    patterns: string[];
  };
  detectedAt: Date;
  status: 'DETECTED' | 'INVESTIGATING' | 'CONFIRMED' | 'FALSE_POSITIVE' | 'RESOLVED';
  autoBlocked: boolean;
  investigatorId?: string;
  notes?: string;
}

interface RiskProfile {
  userId: string;
  userEmail: string;
  currentRiskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskFactors: {
    factor: string;
    score: number;
    description: string;
  }[];
  lastUpdated: Date;
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
}

interface DetectionRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  conditions: {
    metric: string;
    operator: string;
    threshold: number;
    timeWindow: string;
  }[];
  actions: string[];
  lastTriggered?: Date;
  triggerCount: number;
}

// ===== CONSTANTS =====

const ACTIVITY_ICONS = {
  BRUTE_FORCE: Ban,
  RAPID_REQUESTS: Zap,
  UNUSUAL_LOCATION: MapPin,
  MULTIPLE_SESSIONS: Monitor,
  SUSPICIOUS_TIMING: Clock
};

const _SEVERITY_COLORS = {
  LOW: 'bg-blue-500',
  MEDIUM: 'bg-yellow-500',
  HIGH: 'bg-orange-500',
  CRITICAL: 'bg-red-500'
};

const STATUS_COLORS = {
  DETECTED: 'bg-yellow-500',
  INVESTIGATING: 'bg-blue-500',
  CONFIRMED: 'bg-red-500',
  FALSE_POSITIVE: 'bg-gray-500',
  RESOLVED: 'bg-green-500'
};

// ===== MAIN COMPONENT =====

export const SuspiciousActivityDetector: React.FC<SuspiciousActivityDetectorProps> = ({
  className,
  autoRefresh = true,
  refreshInterval = 30000
}) => {
  // ===== STATE =====

  const [suspiciousActivities, setSuspiciousActivities] = useState<SuspiciousActivity[]>([]);
  const [riskProfiles, setRiskProfiles] = useState<RiskProfile[]>([]);
  const [detectionRules, setDetectionRules] = useState<DetectionRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // ===== HANDLERS =====

  const loadSuspiciousActivities = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with real gRPC service call
      // const activities = await SecurityService.getSuspiciousActivities();

      // Mock data generation
      const activities: SuspiciousActivity[] = Array.from({ length: 15 }, (_, i) => ({
        id: `activity-${i}`,
        userId: `user-${Math.floor(Math.random() * 100)}`,
        userEmail: `user${Math.floor(Math.random() * 100)}@example.com`,
        activityType: ['BRUTE_FORCE', 'RAPID_REQUESTS', 'UNUSUAL_LOCATION', 'MULTIPLE_SESSIONS', 'SUSPICIOUS_TIMING'][Math.floor(Math.random() * 5)] as SuspiciousActivity['activityType'],
        severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)] as SuspiciousActivity['severity'],
        riskScore: Math.floor(Math.random() * 100),
        description: [
          'Nhiều lần đăng nhập thất bại từ cùng IP',
          'Tần suất truy cập bất thường cao',
          'Đăng nhập từ vị trí địa lý lạ',
          'Nhiều phiên đăng nhập đồng thời',
          'Thời gian hoạt động bất thường'
        ][Math.floor(Math.random() * 5)],
        evidence: {
          ipAddresses: [`192.168.1.${Math.floor(Math.random() * 255)}`, `10.0.0.${Math.floor(Math.random() * 255)}`],
          locations: ['Hà Nội', 'TP.HCM', 'Unknown'][Math.floor(Math.random() * 3)] ? ['Hà Nội'] : ['Unknown'],
          requestCount: Math.floor(Math.random() * 1000) + 50,
          timeWindow: '15 phút',
          patterns: ['Rapid succession', 'Unusual timing', 'Geographic anomaly']
        },
        detectedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        status: ['DETECTED', 'INVESTIGATING', 'CONFIRMED', 'FALSE_POSITIVE', 'RESOLVED'][Math.floor(Math.random() * 5)] as SuspiciousActivity['status'],
        autoBlocked: Math.random() > 0.6,
        investigatorId: Math.random() > 0.5 ? `investigator-${Math.floor(Math.random() * 5)}` : undefined,
        notes: Math.random() > 0.7 ? 'Đang theo dõi thêm' : undefined
      }));

      setSuspiciousActivities(activities);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load suspicious activities:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadRiskProfiles = useCallback(async () => {
    try {
      // TODO: Replace with real gRPC service call
      // const profiles = await SecurityService.getRiskProfiles();

      // Mock data
      const profiles: RiskProfile[] = Array.from({ length: 10 }, (_, i) => ({
        userId: `user-${i}`,
        userEmail: `user${i}@example.com`,
        currentRiskScore: Math.floor(Math.random() * 100),
        riskLevel: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)] as RiskProfile['riskLevel'],
        riskFactors: [
          {
            factor: 'Unusual login times',
            score: Math.floor(Math.random() * 30),
            description: 'Đăng nhập vào giờ bất thường'
          },
          {
            factor: 'Multiple IP addresses',
            score: Math.floor(Math.random() * 25),
            description: 'Sử dụng nhiều địa chỉ IP khác nhau'
          },
          {
            factor: 'Failed login attempts',
            score: Math.floor(Math.random() * 20),
            description: 'Nhiều lần đăng nhập thất bại'
          }
        ],
        lastUpdated: new Date(Date.now() - Math.random() * 60 * 60 * 1000),
        trend: ['INCREASING', 'STABLE', 'DECREASING'][Math.floor(Math.random() * 3)] as RiskProfile['trend']
      }));

      setRiskProfiles(profiles);
    } catch (error) {
      console.error('Failed to load risk profiles:', error);
    }
  }, []);

  const loadDetectionRules = useCallback(async () => {
    try {
      // TODO: Replace with real gRPC service call
      // const rules = await SecurityService.getDetectionRules();

      // Mock data
      const rules: DetectionRule[] = [
        {
          id: 'rule-1',
          name: 'Brute Force Detection',
          description: 'Phát hiện tấn công brute force',
          enabled: true,
          severity: 'HIGH',
          conditions: [
            { metric: 'failed_logins', operator: '>', threshold: 5, timeWindow: '5m' }
          ],
          actions: ['block_ip', 'send_alert'],
          lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000),
          triggerCount: 15
        },
        {
          id: 'rule-2',
          name: 'Rapid Request Detection',
          description: 'Phát hiện tần suất truy cập bất thường',
          enabled: true,
          severity: 'MEDIUM',
          conditions: [
            { metric: 'requests_per_minute', operator: '>', threshold: 100, timeWindow: '1m' }
          ],
          actions: ['rate_limit', 'log_event'],
          lastTriggered: new Date(Date.now() - 30 * 60 * 1000),
          triggerCount: 8
        },
        {
          id: 'rule-3',
          name: 'Unusual Location',
          description: 'Phát hiện truy cập từ vị trí bất thường',
          enabled: true,
          severity: 'MEDIUM',
          conditions: [
            { metric: 'location_change', operator: '>', threshold: 1000, timeWindow: '1h' }
          ],
          actions: ['require_2fa', 'send_notification'],
          triggerCount: 3
        }
      ];

      setDetectionRules(rules);
    } catch (error) {
      console.error('Failed to load detection rules:', error);
    }
  }, []);

  const handleUpdateActivityStatus = useCallback(async (activityId: string, status: SuspiciousActivity['status'], notes?: string) => {
    try {
      // TODO: Replace with real gRPC service call
      // await SecurityService.updateActivityStatus(activityId, status, notes);

      setSuspiciousActivities(prev =>
        prev.map(activity =>
          activity.id === activityId
            ? { ...activity, status, notes, investigatorId: 'current-user' }
            : activity
        )
      );
    } catch (error) {
      console.error('Failed to update activity status:', error);
    }
  }, []);

  const handleToggleRule = useCallback(async (ruleId: string, enabled: boolean) => {
    try {
      // TODO: Replace with real gRPC service call
      // await SecurityService.updateDetectionRule(ruleId, { enabled });

      setDetectionRules(prev =>
        prev.map(rule =>
          rule.id === ruleId ? { ...rule, enabled } : rule
        )
      );
    } catch (error) {
      console.error('Failed to toggle rule:', error);
    }
  }, []);

  // ===== EFFECTS =====

  useEffect(() => {
    loadSuspiciousActivities();
    loadRiskProfiles();
    loadDetectionRules();

    if (autoRefresh) {
      const interval = setInterval(() => {
        loadSuspiciousActivities();
        loadRiskProfiles();
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, loadSuspiciousActivities, loadRiskProfiles, loadDetectionRules]);

  // ===== RENDER FUNCTIONS =====

  const renderSuspiciousActivities = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Hoạt động đáng nghi gần đây</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Cập nhật: {lastRefresh.toLocaleTimeString('vi-VN')}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={loadSuspiciousActivities}
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

      <AnimatePresence>
        {suspiciousActivities.slice(0, 10).map((activity) => {
          const ActivityIcon = ACTIVITY_ICONS[activity.activityType];
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="border rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ActivityIcon className="h-5 w-5 text-red-500" />
                  <Badge variant={activity.severity === 'CRITICAL' ? 'destructive' : 'secondary'}>
                    {activity.severity}
                  </Badge>
                  <Badge 
                    variant="outline"
                    className={cn('text-white', STATUS_COLORS[activity.status])}
                  >
                    {activity.status}
                  </Badge>
                  {activity.autoBlocked && (
                    <Badge variant="destructive">
                      <Ban className="h-3 w-3 mr-1" />
                      Đã chặn
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">Risk: {activity.riskScore}</div>
                  <Progress value={activity.riskScore} className="w-16 h-2 mt-1" />
                </div>
              </div>

              <h4 className="font-medium mb-2">{activity.description}</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-3 w-3" />
                    <span>{activity.userEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-3 w-3" />
                    <span>IPs: {activity.evidence.ipAddresses.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-3 w-3" />
                    <span>{activity.evidence.requestCount} requests in {activity.evidence.timeWindow}</span>
                  </div>
                </div>
                <div>
                  <div className="mb-1">
                    <span className="font-medium">Locations:</span> {activity.evidence.locations.join(', ')}
                  </div>
                  <div className="mb-1">
                    <span className="font-medium">Detected:</span> {activity.detectedAt.toLocaleString('vi-VN')}
                  </div>
                  <div>
                    <span className="font-medium">Patterns:</span> {activity.evidence.patterns.join(', ')}
                  </div>
                </div>
              </div>

              {activity.notes && (
                <Alert className="mb-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{activity.notes}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                {activity.status === 'DETECTED' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateActivityStatus(activity.id, 'INVESTIGATING')}
                    >
                      Điều tra
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateActivityStatus(activity.id, 'FALSE_POSITIVE')}
                    >
                      False Positive
                    </Button>
                  </>
                )}
                {activity.status === 'INVESTIGATING' && (
                  <>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleUpdateActivityStatus(activity.id, 'CONFIRMED')}
                    >
                      Xác nhận
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateActivityStatus(activity.id, 'FALSE_POSITIVE')}
                    >
                      False Positive
                    </Button>
                  </>
                )}
                {activity.status === 'CONFIRMED' && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleUpdateActivityStatus(activity.id, 'RESOLVED')}
                  >
                    Đánh dấu đã xử lý
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );

  const renderRiskProfiles = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Hồ sơ rủi ro người dùng</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {riskProfiles.slice(0, 8).map((profile) => (
          <Card key={profile.userId}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium">{profile.userEmail}</h4>
                  <Badge variant={profile.riskLevel === 'CRITICAL' ? 'destructive' : 'secondary'}>
                    {profile.riskLevel}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{profile.currentRiskScore}</div>
                  <div className="flex items-center gap-1 text-sm">
                    {profile.trend === 'INCREASING' ? (
                      <TrendingUp className="h-3 w-3 text-red-500" />
                    ) : profile.trend === 'DECREASING' ? (
                      <TrendingDown className="h-3 w-3 text-green-500" />
                    ) : (
                      <Activity className="h-3 w-3 text-gray-500" />
                    )}
                    <span className="text-muted-foreground">{profile.trend}</span>
                  </div>
                </div>
              </div>

              <Progress value={profile.currentRiskScore} className="mb-3" />

              <div className="space-y-2">
                {profile.riskFactors.slice(0, 3).map((factor, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{factor.factor}</span>
                    <span className="font-medium">{factor.score}</span>
                  </div>
                ))}
              </div>

              <div className="text-xs text-muted-foreground mt-3">
                Cập nhật: {profile.lastUpdated.toLocaleString('vi-VN')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderDetectionRules = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Quy tắc phát hiện</h3>
      
      <div className="space-y-4">
        {detectionRules.map((rule) => (
          <Card key={rule.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{rule.name}</h4>
                    <Badge variant={rule.severity === 'CRITICAL' ? 'destructive' : 'secondary'}>
                      {rule.severity}
                    </Badge>
                    <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                      {rule.enabled ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {rule.enabled ? 'Bật' : 'Tắt'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{rule.description}</p>
                  
                  <div className="text-sm">
                    <div className="mb-1">
                      <span className="font-medium">Điều kiện:</span>
                      {rule.conditions.map((condition, index) => (
                        <span key={index} className="ml-2">
                          {condition.metric} {condition.operator} {condition.threshold} trong {condition.timeWindow}
                        </span>
                      ))}
                    </div>
                    <div>
                      <span className="font-medium">Hành động:</span> {rule.actions.join(', ')}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-muted-foreground mb-2">
                    Kích hoạt: {rule.triggerCount} lần
                  </div>
                  {rule.lastTriggered && (
                    <div className="text-xs text-muted-foreground mb-2">
                      Lần cuối: {rule.lastTriggered.toLocaleString('vi-VN')}
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant={rule.enabled ? "destructive" : "default"}
                    onClick={() => handleToggleRule(rule.id, !rule.enabled)}
                  >
                    {rule.enabled ? 'Tắt' : 'Bật'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // ===== MAIN RENDER =====

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Phát hiện hoạt động đáng nghi</h2>
        <p className="text-muted-foreground">
          Hệ thống AI phát hiện và phân tích các hoạt động bất thường
        </p>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="activities" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Hoạt động đáng nghi
          </TabsTrigger>
          <TabsTrigger value="profiles" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Hồ sơ rủi ro
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Quy tắc phát hiện
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Hoạt động đáng nghi</CardTitle>
              <CardDescription>
                Danh sách các hoạt động được hệ thống AI đánh giá là đáng nghi
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderSuspiciousActivities()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profiles">
          <Card>
            <CardHeader>
              <CardTitle>Hồ sơ rủi ro người dùng</CardTitle>
              <CardDescription>
                Phân tích mức độ rủi ro của từng người dùng dựa trên hành vi
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderRiskProfiles()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle>Quy tắc phát hiện</CardTitle>
              <CardDescription>
                Cấu hình và quản lý các quy tắc tự động phát hiện hoạt động đáng nghi
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderDetectionRules()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuspiciousActivityDetector;
