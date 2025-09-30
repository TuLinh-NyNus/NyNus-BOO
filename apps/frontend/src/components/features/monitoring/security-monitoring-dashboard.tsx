/**
 * Security Monitoring Dashboard
 * Dashboard để monitor security events và threats trong real-time
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  AlertTriangle,
  Users,
  Activity,
  TrendingUp,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  Globe
} from 'lucide-react';

// Types cho security monitoring
interface SecurityEvent {
  id: string;
  type: 'LOGIN_ATTEMPT' | 'FAILED_LOGIN' | 'SUSPICIOUS_ACTIVITY' | 'BLOCKED_ACCESS' | 'PRIVILEGE_ESCALATION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userId?: string;
  userEmail?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  description: string;
  location?: string;
  blocked: boolean;
}

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  blockedAttempts: number;
  activeThreats: number;
  riskScore: number;
  lastUpdated: string;
}

interface ThreatIntelligence {
  id: string;
  threatType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  affectedUsers: number;
  mitigationStatus: 'DETECTED' | 'INVESTIGATING' | 'MITIGATED' | 'RESOLVED';
  firstSeen: string;
  lastSeen: string;
}

interface UserRiskProfile {
  userId: string;
  email: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  suspiciousActivities: number;
  lastActivity: string;
  location: string;
  deviceCount: number;
  isBlocked: boolean;
}

export function SecurityMonitoringDashboard() {
  // State management
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    criticalEvents: 0,
    blockedAttempts: 0,
    activeThreats: 0,
    riskScore: 0,
    lastUpdated: new Date().toISOString()
  });

  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [threatIntelligence, setThreatIntelligence] = useState<ThreatIntelligence[]>([]);
  const [userRiskProfiles, setUserRiskProfiles] = useState<UserRiskProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data generation
  useEffect(() => {
    const generateMockData = () => {
      // Generate security events
      const events: SecurityEvent[] = Array.from({ length: 50 }, (_, i) => ({
        id: `event-${i}`,
        type: ['LOGIN_ATTEMPT', 'FAILED_LOGIN', 'SUSPICIOUS_ACTIVITY', 'BLOCKED_ACCESS', 'PRIVILEGE_ESCALATION'][Math.floor(Math.random() * 5)] as SecurityEvent['type'],
        severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)] as SecurityEvent['severity'],
        userId: `user-${Math.floor(Math.random() * 100)}`,
        userEmail: `user${Math.floor(Math.random() * 100)}@example.com`,
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        description: `Security event detected: ${['Unusual login pattern', 'Multiple failed attempts', 'Suspicious IP address', 'Privilege escalation attempt'][Math.floor(Math.random() * 4)]}`,
        location: ['Vietnam', 'USA', 'China', 'Russia', 'Unknown'][Math.floor(Math.random() * 5)],
        blocked: Math.random() > 0.7
      }));

      // Generate threat intelligence
      const threats: ThreatIntelligence[] = Array.from({ length: 10 }, (_, i) => ({
        id: `threat-${i}`,
        threatType: ['Brute Force Attack', 'SQL Injection', 'XSS Attempt', 'CSRF Attack', 'Session Hijacking'][Math.floor(Math.random() * 5)],
        severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)] as ThreatIntelligence['severity'],
        description: `Threat detected from multiple sources targeting authentication system`,
        affectedUsers: Math.floor(Math.random() * 50),
        mitigationStatus: ['DETECTED', 'INVESTIGATING', 'MITIGATED', 'RESOLVED'][Math.floor(Math.random() * 4)] as ThreatIntelligence['mitigationStatus'],
        firstSeen: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
        lastSeen: new Date(Date.now() - Math.random() * 3600000).toISOString()
      }));

      // Generate user risk profiles
      const riskProfiles: UserRiskProfile[] = Array.from({ length: 20 }, (_, i) => ({
        userId: `user-${i}`,
        email: `user${i}@example.com`,
        riskScore: Math.floor(Math.random() * 100),
        riskLevel: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)] as UserRiskProfile['riskLevel'],
        suspiciousActivities: Math.floor(Math.random() * 10),
        lastActivity: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        location: ['Vietnam', 'USA', 'China', 'Russia', 'Unknown'][Math.floor(Math.random() * 5)],
        deviceCount: Math.floor(Math.random() * 5) + 1,
        isBlocked: Math.random() > 0.8
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
      setUserRiskProfiles(riskProfiles);
      setSecurityMetrics(metrics);
      setIsLoading(false);
    };

    generateMockData();

    // Auto refresh every 30 seconds
    const interval = autoRefresh ? setInterval(generateMockData, 30000) : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // Helper functions
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <XCircle className="h-4 w-4" />;
      case 'HIGH': return <AlertTriangle className="h-4 w-4" />;
      case 'MEDIUM': return <Clock className="h-4 w-4" />;
      case 'LOW': return <CheckCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('vi-VN');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Monitoring Dashboard</h1>
          <p className="text-gray-600">Real-time security monitoring và threat detection</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
            size="sm"
          >
            <Activity className="h-4 w-4 mr-2" />
            {autoRefresh ? 'Auto Refresh ON' : 'Auto Refresh OFF'}
          </Button>
          <Badge variant="outline">
            Last updated: {formatTimestamp(securityMetrics.lastUpdated)}
          </Badge>
        </div>
      </div>

      {/* Security Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityMetrics.totalEvents}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{securityMetrics.criticalEvents}</div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Attempts</CardTitle>
            <Ban className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{securityMetrics.blockedAttempts}</div>
            <p className="text-xs text-muted-foreground">Automatically blocked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <Shield className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{securityMetrics.activeThreats}</div>
            <p className="text-xs text-muted-foreground">Under investigation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{securityMetrics.riskScore}/100</div>
            <Progress value={securityMetrics.riskScore} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {securityMetrics.criticalEvents > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Critical Security Alert</AlertTitle>
          <AlertDescription className="text-red-700">
            {securityMetrics.criticalEvents} critical security events detected. Immediate action required.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="threats">Threat Intelligence</TabsTrigger>
          <TabsTrigger value="users">User Risk Profiles</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Security Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
              <CardDescription>Real-time security events và incidents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityEvents.slice(0, 10).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${getSeverityColor(event.severity)}`}>
                        {getSeverityIcon(event.severity)}
                      </div>
                      <div>
                        <div className="font-medium">{event.description}</div>
                        <div className="text-sm text-gray-500">
                          {event.userEmail} • {event.ipAddress} • {event.location}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={event.blocked ? "destructive" : "secondary"}>
                        {event.blocked ? 'Blocked' : 'Allowed'}
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatTimestamp(event.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Threat Intelligence Tab */}
        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Threats</CardTitle>
              <CardDescription>Threat intelligence và mitigation status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threatIntelligence.map((threat) => (
                  <div key={threat.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={getSeverityColor(threat.severity)}>
                          {threat.severity}
                        </Badge>
                        <span className="font-medium">{threat.threatType}</span>
                      </div>
                      <Badge variant={threat.mitigationStatus === 'RESOLVED' ? 'default' : 'secondary'}>
                        {threat.mitigationStatus}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{threat.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Affected users: {threat.affectedUsers}</span>
                      <span>First seen: {formatTimestamp(threat.firstSeen)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Risk Profiles Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>High-Risk Users</CardTitle>
              <CardDescription>Users với high risk scores cần monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userRiskProfiles
                  .filter(user => user.riskLevel === 'HIGH' || user.riskLevel === 'CRITICAL')
                  .map((user) => (
                    <div key={user.userId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${getSeverityColor(user.riskLevel)}`}>
                          <Users className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{user.email}</div>
                          <div className="text-sm text-gray-500">
                            {user.suspiciousActivities} suspicious activities • {user.deviceCount} devices
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <Badge className={getSeverityColor(user.riskLevel)}>
                            Risk: {user.riskScore}
                          </Badge>
                          {user.isBlocked && (
                            <Badge variant="destructive">Blocked</Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Last activity: {formatTimestamp(user.lastActivity)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Event Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(severity => {
                    const count = securityEvents.filter(e => e.severity === severity).length;
                    const percentage = (count / securityEvents.length) * 100;
                    return (
                      <div key={severity} className="flex items-center justify-between">
                        <span className="text-sm">{severity}</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={percentage} className="w-20" />
                          <span className="text-sm w-8">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['Vietnam', 'USA', 'China', 'Russia', 'Unknown'].map(location => {
                    const count = securityEvents.filter(e => e.location === location).length;
                    const percentage = (count / securityEvents.length) * 100;
                    return (
                      <div key={location} className="flex items-center justify-between">
                        <span className="text-sm flex items-center">
                          <Globe className="h-3 w-3 mr-1" />
                          {location}
                        </span>
                        <div className="flex items-center space-x-2">
                          <Progress value={percentage} className="w-20" />
                          <span className="text-sm w-8">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
