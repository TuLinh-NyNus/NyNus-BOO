/**
 * Performance Metrics Dashboard
 * System để collect và analyze performance data với real-time monitoring
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Zap, 
  Clock, 
  Server, 
  Database,
  Globe,
  Cpu,
  MemoryStick,
  Wifi,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react';

// Types cho performance metrics
interface CoreWebVitals {
  lcp: number; // Largest Contentful Paint (ms)
  fid: number; // First Input Delay (ms)
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint (ms)
  ttfb: number; // Time to First Byte (ms)
  timestamp: string;
}

interface SystemMetrics {
  cpuUsage: number; // percentage
  memoryUsage: number; // percentage
  diskUsage: number; // percentage
  networkLatency: number; // ms
  activeConnections: number;
  requestsPerSecond: number;
  errorRate: number; // percentage
  uptime: number; // hours
  timestamp: string;
}

interface APIPerformance {
  endpoint: string;
  method: string;
  averageResponseTime: number; // ms
  p95ResponseTime: number; // ms
  p99ResponseTime: number; // ms
  requestCount: number;
  errorCount: number;
  errorRate: number; // percentage
  throughput: number; // requests per second
  lastUpdated: string;
}

interface DatabaseMetrics {
  connectionPoolSize: number;
  activeConnections: number;
  queryExecutionTime: number; // ms
  slowQueries: number;
  cacheHitRate: number; // percentage
  diskIOPS: number;
  memoryUsage: number; // MB
  timestamp: string;
}

interface PerformanceAlert {
  id: string;
  type: 'PERFORMANCE' | 'AVAILABILITY' | 'ERROR_RATE' | 'RESOURCE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  metric: string;
  threshold: number;
  currentValue: number;
  timestamp: string;
  resolved: boolean;
}

interface PerformanceSummary {
  overallScore: number;
  webVitalsScore: number;
  systemHealthScore: number;
  apiPerformanceScore: number;
  databaseScore: number;
  availabilityScore: number;
  lastUpdated: string;
}

export function PerformanceMetricsDashboard() {
  // State management
  const [performanceSummary, setPerformanceSummary] = useState<PerformanceSummary>({
    overallScore: 0,
    webVitalsScore: 0,
    systemHealthScore: 0,
    apiPerformanceScore: 0,
    databaseScore: 0,
    availabilityScore: 0,
    lastUpdated: new Date().toISOString()
  });

  const [coreWebVitals, setCoreWebVitals] = useState<CoreWebVitals[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics[]>([]);
  const [apiPerformance, setApiPerformance] = useState<APIPerformance[]>([]);
  const [databaseMetrics, setDatabaseMetrics] = useState<DatabaseMetrics[]>([]);
  const [performanceAlerts, setPerformanceAlerts] = useState<PerformanceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data generation
  useEffect(() => {
    const generateMockData = () => {
      // Generate Core Web Vitals
      const webVitals: CoreWebVitals[] = Array.from({ length: 24 }, (_, i) => ({
        lcp: Math.floor(Math.random() * 1000) + 1000, // 1000-2000ms
        fid: Math.floor(Math.random() * 50) + 10, // 10-60ms
        cls: Math.random() * 0.2, // 0-0.2
        fcp: Math.floor(Math.random() * 800) + 800, // 800-1600ms
        ttfb: Math.floor(Math.random() * 200) + 100, // 100-300ms
        timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString()
      }));

      // Generate System Metrics
      const systemData: SystemMetrics[] = Array.from({ length: 24 }, (_, i) => ({
        cpuUsage: Math.floor(Math.random() * 40) + 30, // 30-70%
        memoryUsage: Math.floor(Math.random() * 30) + 50, // 50-80%
        diskUsage: Math.floor(Math.random() * 20) + 60, // 60-80%
        networkLatency: Math.floor(Math.random() * 50) + 20, // 20-70ms
        activeConnections: Math.floor(Math.random() * 500) + 100,
        requestsPerSecond: Math.floor(Math.random() * 100) + 50,
        errorRate: Math.random() * 2, // 0-2%
        uptime: 720 + i, // hours
        timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString()
      }));

      // Generate API Performance
      const apiEndpoints = [
        '/api/auth/login',
        '/api/auth/register',
        '/api/users/profile',
        '/api/content/videos',
        '/api/exams/submit',
        '/api/analytics/dashboard'
      ];

      const apiData: APIPerformance[] = apiEndpoints.map(endpoint => ({
        endpoint,
        method: endpoint.includes('submit') || endpoint.includes('register') ? 'POST' : 'GET',
        averageResponseTime: Math.floor(Math.random() * 200) + 50, // 50-250ms
        p95ResponseTime: Math.floor(Math.random() * 400) + 200, // 200-600ms
        p99ResponseTime: Math.floor(Math.random() * 800) + 500, // 500-1300ms
        requestCount: Math.floor(Math.random() * 10000) + 1000,
        errorCount: Math.floor(Math.random() * 50),
        errorRate: Math.random() * 3, // 0-3%
        throughput: Math.floor(Math.random() * 50) + 10, // 10-60 RPS
        lastUpdated: new Date().toISOString()
      }));

      // Generate Database Metrics
      const dbData: DatabaseMetrics[] = Array.from({ length: 24 }, (_, i) => ({
        connectionPoolSize: 20,
        activeConnections: Math.floor(Math.random() * 15) + 5,
        queryExecutionTime: Math.floor(Math.random() * 100) + 20, // 20-120ms
        slowQueries: Math.floor(Math.random() * 5),
        cacheHitRate: Math.floor(Math.random() * 20) + 75, // 75-95%
        diskIOPS: Math.floor(Math.random() * 1000) + 500,
        memoryUsage: Math.floor(Math.random() * 500) + 1000, // MB
        timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString()
      }));

      // Generate Performance Alerts
      const alerts: PerformanceAlert[] = [
        {
          id: 'alert-1',
          type: 'PERFORMANCE',
          severity: 'HIGH',
          title: 'High Response Time',
          description: 'API response time exceeded threshold',
          metric: 'Average Response Time',
          threshold: 200,
          currentValue: 350,
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          resolved: false
        },
        {
          id: 'alert-2',
          type: 'RESOURCE',
          severity: 'MEDIUM',
          title: 'High Memory Usage',
          description: 'System memory usage is above 80%',
          metric: 'Memory Usage',
          threshold: 80,
          currentValue: 85,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          resolved: true
        },
        {
          id: 'alert-3',
          type: 'ERROR_RATE',
          severity: 'CRITICAL',
          title: 'High Error Rate',
          description: 'Error rate exceeded 5% threshold',
          metric: 'Error Rate',
          threshold: 5,
          currentValue: 7.2,
          timestamp: new Date(Date.now() - 900000).toISOString(),
          resolved: false
        }
      ];

      // Calculate performance scores
      const latestWebVitals = webVitals[webVitals.length - 1];
      const latestSystemMetrics = systemData[systemData.length - 1];
      const latestDbMetrics = dbData[dbData.length - 1];

      const webVitalsScore = Math.max(0, 100 - (
        (latestWebVitals.lcp > 2500 ? 20 : 0) +
        (latestWebVitals.fid > 100 ? 20 : 0) +
        (latestWebVitals.cls > 0.1 ? 20 : 0) +
        (latestWebVitals.fcp > 1800 ? 20 : 0) +
        (latestWebVitals.ttfb > 600 ? 20 : 0)
      ));

      const systemHealthScore = Math.max(0, 100 - (
        (latestSystemMetrics.cpuUsage > 80 ? 25 : 0) +
        (latestSystemMetrics.memoryUsage > 85 ? 25 : 0) +
        (latestSystemMetrics.errorRate > 2 ? 25 : 0) +
        (latestSystemMetrics.networkLatency > 100 ? 25 : 0)
      ));

      const apiPerformanceScore = Math.max(0, 100 - apiData.reduce((penalty, api) => 
        penalty + (api.averageResponseTime > 300 ? 15 : 0) + (api.errorRate > 2 ? 15 : 0), 0
      ));

      const databaseScore = Math.max(0, 100 - (
        (latestDbMetrics.queryExecutionTime > 100 ? 20 : 0) +
        (latestDbMetrics.cacheHitRate < 80 ? 20 : 0) +
        (latestDbMetrics.slowQueries > 3 ? 20 : 0) +
        (latestDbMetrics.activeConnections > 18 ? 20 : 0)
      ));

      const availabilityScore = Math.max(0, 100 - (latestSystemMetrics.errorRate * 10));

      const overallScore = Math.round(
        (webVitalsScore + systemHealthScore + apiPerformanceScore + databaseScore + availabilityScore) / 5
      );

      const summary: PerformanceSummary = {
        overallScore,
        webVitalsScore: Math.round(webVitalsScore),
        systemHealthScore: Math.round(systemHealthScore),
        apiPerformanceScore: Math.round(apiPerformanceScore),
        databaseScore: Math.round(databaseScore),
        availabilityScore: Math.round(availabilityScore),
        lastUpdated: new Date().toISOString()
      };

      setCoreWebVitals(webVitals);
      setSystemMetrics(systemData);
      setApiPerformance(apiData);
      setDatabaseMetrics(dbData);
      setPerformanceAlerts(alerts);
      setPerformanceSummary(summary);
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
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    if (score >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'HIGH': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'MEDIUM': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'LOW': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('vi-VN');
  };

  const getWebVitalStatus = (metric: string, value: number) => {
    const thresholds: { [key: string]: { good: number; poor: number } } = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 600, poor: 1500 }
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
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
          <h1 className="text-3xl font-bold">Performance Metrics Dashboard</h1>
          <p className="text-gray-600">Real-time performance monitoring và analytics</p>
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
            Last updated: {formatTimestamp(performanceSummary.lastUpdated)}
          </Badge>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="col-span-1 md:col-span-3 lg:col-span-2">
          <CardHeader className="text-center">
            <CardTitle>Overall Performance Score</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className={`text-6xl font-bold ${getScoreColor(performanceSummary.overallScore)}`}>
              {performanceSummary.overallScore}
            </div>
            <Progress value={performanceSummary.overallScore} className="mt-4" />
            <p className="text-sm text-muted-foreground mt-2">
              {performanceSummary.overallScore >= 90 ? 'Excellent' : 
               performanceSummary.overallScore >= 70 ? 'Good' :
               performanceSummary.overallScore >= 50 ? 'Needs Improvement' : 'Poor'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Web Vitals</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(performanceSummary.webVitalsScore)}`}>
              {performanceSummary.webVitalsScore}
            </div>
            <Progress value={performanceSummary.webVitalsScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`text-2xl font-bold ${getScoreColor(performanceSummary.systemHealthScore)}`}>
                {performanceSummary.systemHealthScore}
              </div>
              <div className={`w-3 h-3 rounded-full ${getScoreBadgeColor(performanceSummary.systemHealthScore)}`}></div>
            </div>
            <Progress value={performanceSummary.systemHealthScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Performance</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`text-2xl font-bold ${getScoreColor(performanceSummary.apiPerformanceScore)}`}>
                {performanceSummary.apiPerformanceScore}
              </div>
              <div className={`w-3 h-3 rounded-full ${getScoreBadgeColor(performanceSummary.apiPerformanceScore)}`}></div>
            </div>
            <Progress value={performanceSummary.apiPerformanceScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(performanceSummary.databaseScore)}`}>
              {performanceSummary.databaseScore}
            </div>
            <Progress value={performanceSummary.databaseScore} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {performanceAlerts.filter(alert => !alert.resolved && alert.severity === 'CRITICAL').length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Critical Performance Alert</AlertTitle>
          <AlertDescription className="text-red-700">
            {performanceAlerts.filter(alert => !alert.resolved && alert.severity === 'CRITICAL').length} critical performance issues detected. Immediate action required.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="webvitals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="webvitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="system">System Metrics</TabsTrigger>
          <TabsTrigger value="api">API Performance</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        {/* Core Web Vitals Tab */}
        <TabsContent value="webvitals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {coreWebVitals.length > 0 && (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">LCP</CardTitle>
                    <CardDescription>Largest Contentful Paint</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {coreWebVitals[coreWebVitals.length - 1].lcp}ms
                    </div>
                    <Badge className={
                      getWebVitalStatus('lcp', coreWebVitals[coreWebVitals.length - 1].lcp) === 'good' ? 'bg-green-500' :
                      getWebVitalStatus('lcp', coreWebVitals[coreWebVitals.length - 1].lcp) === 'needs-improvement' ? 'bg-yellow-500' : 'bg-red-500'
                    }>
                      {getWebVitalStatus('lcp', coreWebVitals[coreWebVitals.length - 1].lcp)}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">FID</CardTitle>
                    <CardDescription>First Input Delay</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {coreWebVitals[coreWebVitals.length - 1].fid}ms
                    </div>
                    <Badge className={
                      getWebVitalStatus('fid', coreWebVitals[coreWebVitals.length - 1].fid) === 'good' ? 'bg-green-500' :
                      getWebVitalStatus('fid', coreWebVitals[coreWebVitals.length - 1].fid) === 'needs-improvement' ? 'bg-yellow-500' : 'bg-red-500'
                    }>
                      {getWebVitalStatus('fid', coreWebVitals[coreWebVitals.length - 1].fid)}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">CLS</CardTitle>
                    <CardDescription>Cumulative Layout Shift</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {coreWebVitals[coreWebVitals.length - 1].cls.toFixed(3)}
                    </div>
                    <Badge className={
                      getWebVitalStatus('cls', coreWebVitals[coreWebVitals.length - 1].cls) === 'good' ? 'bg-green-500' :
                      getWebVitalStatus('cls', coreWebVitals[coreWebVitals.length - 1].cls) === 'needs-improvement' ? 'bg-yellow-500' : 'bg-red-500'
                    }>
                      {getWebVitalStatus('cls', coreWebVitals[coreWebVitals.length - 1].cls)}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">FCP</CardTitle>
                    <CardDescription>First Contentful Paint</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {coreWebVitals[coreWebVitals.length - 1].fcp}ms
                    </div>
                    <Badge className={
                      getWebVitalStatus('fcp', coreWebVitals[coreWebVitals.length - 1].fcp) === 'good' ? 'bg-green-500' :
                      getWebVitalStatus('fcp', coreWebVitals[coreWebVitals.length - 1].fcp) === 'needs-improvement' ? 'bg-yellow-500' : 'bg-red-500'
                    }>
                      {getWebVitalStatus('fcp', coreWebVitals[coreWebVitals.length - 1].fcp)}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">TTFB</CardTitle>
                    <CardDescription>Time to First Byte</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {coreWebVitals[coreWebVitals.length - 1].ttfb}ms
                    </div>
                    <Badge className={
                      getWebVitalStatus('ttfb', coreWebVitals[coreWebVitals.length - 1].ttfb) === 'good' ? 'bg-green-500' :
                      getWebVitalStatus('ttfb', coreWebVitals[coreWebVitals.length - 1].ttfb) === 'needs-improvement' ? 'bg-yellow-500' : 'bg-red-500'
                    }>
                      {getWebVitalStatus('ttfb', coreWebVitals[coreWebVitals.length - 1].ttfb)}
                    </Badge>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        {/* System Metrics Tab */}
        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemMetrics.length > 0 && (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {systemMetrics[systemMetrics.length - 1].cpuUsage}%
                    </div>
                    <Progress value={systemMetrics[systemMetrics.length - 1].cpuUsage} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                    <MemoryStick className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {systemMetrics[systemMetrics.length - 1].memoryUsage}%
                    </div>
                    <Progress value={systemMetrics[systemMetrics.length - 1].memoryUsage} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Network Latency</CardTitle>
                    <Wifi className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {systemMetrics[systemMetrics.length - 1].networkLatency}ms
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {systemMetrics[systemMetrics.length - 1].requestsPerSecond} RPS
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {systemMetrics[systemMetrics.length - 1].errorRate.toFixed(2)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {systemMetrics[systemMetrics.length - 1].activeConnections} connections
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        {/* API Performance Tab */}
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoint Performance</CardTitle>
              <CardDescription>Response times và error rates cho các API endpoints</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiPerformance.map((api) => (
                  <div key={api.endpoint} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{api.method} {api.endpoint}</div>
                      <div className="text-sm text-gray-500">
                        {api.requestCount} requests • {api.throughput} RPS
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">Avg: {api.averageResponseTime}ms</Badge>
                        <Badge variant="outline">P95: {api.p95ResponseTime}ms</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={api.errorRate > 2 ? 'bg-red-500' : 'bg-green-500'}>
                          Error: {api.errorRate.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Tab */}
        <TabsContent value="database" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {databaseMetrics.length > 0 && (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Query Time</CardTitle>
                    <CardDescription>Average execution time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {databaseMetrics[databaseMetrics.length - 1].queryExecutionTime}ms
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {databaseMetrics[databaseMetrics.length - 1].slowQueries} slow queries
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Cache Hit Rate</CardTitle>
                    <CardDescription>Cache effectiveness</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {databaseMetrics[databaseMetrics.length - 1].cacheHitRate}%
                    </div>
                    <Progress value={databaseMetrics[databaseMetrics.length - 1].cacheHitRate} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Connections</CardTitle>
                    <CardDescription>Active/Pool size</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {databaseMetrics[databaseMetrics.length - 1].activeConnections}/
                      {databaseMetrics[databaseMetrics.length - 1].connectionPoolSize}
                    </div>
                    <Progress 
                      value={(databaseMetrics[databaseMetrics.length - 1].activeConnections / databaseMetrics[databaseMetrics.length - 1].connectionPoolSize) * 100} 
                      className="mt-2" 
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Memory Usage</CardTitle>
                    <CardDescription>Database memory</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {databaseMetrics[databaseMetrics.length - 1].memoryUsage}MB
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {databaseMetrics[databaseMetrics.length - 1].diskIOPS} IOPS
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Alerts</CardTitle>
              <CardDescription>Active và resolved performance alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getSeverityIcon(alert.severity)}
                      <div>
                        <div className="font-medium">{alert.title}</div>
                        <div className="text-sm text-gray-500">{alert.description}</div>
                        <div className="text-xs text-gray-400">
                          {alert.metric}: {alert.currentValue} (threshold: {alert.threshold})
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={alert.resolved ? "default" : "destructive"}>
                        {alert.resolved ? 'Resolved' : 'Active'}
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatTimestamp(alert.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
