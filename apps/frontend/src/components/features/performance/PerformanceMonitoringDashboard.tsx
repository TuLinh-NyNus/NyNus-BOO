/**
 * Performance Monitoring Dashboard Component
 * Component để monitor và visualize performance metrics
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
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Activity,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  BarChart3,
  PieChart,
  Monitor,
  Cpu,
  HardDrive,
  Wifi,
  Eye,
  MousePointer,
  Timer,
  Gauge
} from 'lucide-react';
import { motion } from 'framer-motion';

// ===== TYPES =====

export interface PerformanceMonitoringDashboardProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface WebVitalsMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  inp: number; // Interaction to Next Paint
}

interface PerformanceMetrics {
  webVitals: WebVitalsMetrics;
  loadTime: number;
  domContentLoaded: number;
  memoryUsage: number;
  bundleSize: number;
  cacheHitRate: number;
  apiResponseTime: number;
  renderTime: number;
  jsHeapSize: number;
  networkLatency: number;
}

interface PerformanceAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  metric: string;
  message: string;
  value: number;
  threshold: number;
  timestamp: Date;
  resolved: boolean;
}

interface PerformanceRecommendation {
  id: string;
  category: 'loading' | 'rendering' | 'caching' | 'network' | 'memory';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  priority: number;
}

// ===== CONSTANTS =====

const WEB_VITALS_THRESHOLDS = {
  fcp: { good: 1800, poor: 3000 }, // ms
  lcp: { good: 2500, poor: 4000 }, // ms
  fid: { good: 100, poor: 300 }, // ms
  cls: { good: 0.1, poor: 0.25 }, // score
  ttfb: { good: 800, poor: 1800 }, // ms
  inp: { good: 200, poor: 500 } // ms
};

const METRIC_ICONS = {
  fcp: Eye,
  lcp: Monitor,
  fid: MousePointer,
  cls: Activity,
  ttfb: Wifi,
  inp: Timer
};

const PERFORMANCE_COLORS = {
  good: 'text-green-600 bg-green-100',
  needs_improvement: 'text-yellow-600 bg-yellow-100',
  poor: 'text-red-600 bg-red-100'
};

// ===== MAIN COMPONENT =====

export const PerformanceMonitoringDashboard: React.FC<PerformanceMonitoringDashboardProps> = ({
  className,
  autoRefresh = true,
  refreshInterval = 30000
}) => {
  // ===== STATE =====

  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [recommendations, setRecommendations] = useState<PerformanceRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [performanceScore, setPerformanceScore] = useState<number>(0);

  // ===== EFFECTS =====

  useEffect(() => {
    loadPerformanceData();

    if (autoRefresh) {
      const interval = setInterval(loadPerformanceData, refreshInterval);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, refreshInterval]);

  // ===== HANDLERS =====

  const loadPerformanceData = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with real performance monitoring service
      // const [metricsData, alertsData, recommendationsData] = await Promise.all([
      //   PerformanceService.getMetrics(),
      //   PerformanceService.getAlerts(),
      //   PerformanceService.getRecommendations()
      // ]);

      // Mock data generation
      const webVitals: WebVitalsMetrics = {
        fcp: 1200 + Math.random() * 800, // 1.2-2.0s
        lcp: 2000 + Math.random() * 1000, // 2.0-3.0s
        fid: 50 + Math.random() * 100, // 50-150ms
        cls: Math.random() * 0.2, // 0-0.2
        ttfb: 400 + Math.random() * 600, // 400-1000ms
        inp: 100 + Math.random() * 200 // 100-300ms
      };

      const performanceMetrics: PerformanceMetrics = {
        webVitals,
        loadTime: 2500 + Math.random() * 1000,
        domContentLoaded: 1800 + Math.random() * 500,
        memoryUsage: 45 + Math.random() * 30, // MB
        bundleSize: 2.1 + Math.random() * 0.5, // MB
        cacheHitRate: 85 + Math.random() * 10, // %
        apiResponseTime: 200 + Math.random() * 300, // ms
        renderTime: 16 + Math.random() * 8, // ms
        jsHeapSize: 25 + Math.random() * 15, // MB
        networkLatency: 50 + Math.random() * 100 // ms
      };

      const performanceAlerts: PerformanceAlert[] = [
        {
          id: 'lcp-warning',
          type: 'warning' as const,
          metric: 'LCP',
          message: 'Largest Contentful Paint is slower than recommended',
          value: webVitals.lcp,
          threshold: WEB_VITALS_THRESHOLDS.lcp.good,
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          resolved: false
        },
        {
          id: 'memory-critical',
          type: 'critical' as const,
          metric: 'Memory Usage',
          message: 'Memory usage is approaching critical levels',
          value: performanceMetrics.memoryUsage,
          threshold: 70,
          timestamp: new Date(Date.now() - 2 * 60 * 1000),
          resolved: false
        }
      ].filter(() => Math.random() > 0.3); // Randomly show alerts

      const performanceRecommendations: PerformanceRecommendation[] = [
        {
          id: 'optimize-images',
          category: 'loading',
          title: 'Optimize Images',
          description: 'Sử dụng WebP format và lazy loading cho images',
          impact: 'high',
          effort: 'medium',
          priority: 1
        },
        {
          id: 'code-splitting',
          category: 'loading',
          title: 'Implement Code Splitting',
          description: 'Chia nhỏ bundle để giảm initial load time',
          impact: 'high',
          effort: 'high',
          priority: 2
        },
        {
          id: 'cache-optimization',
          category: 'caching',
          title: 'Optimize Caching Strategy',
          description: 'Cải thiện cache hit rate với better cache policies',
          impact: 'medium',
          effort: 'low',
          priority: 3
        },
        {
          id: 'api-optimization',
          category: 'network',
          title: 'Optimize API Calls',
          description: 'Giảm số lượng API calls và implement request batching',
          impact: 'medium',
          effort: 'medium',
          priority: 4
        }
      ];

      // Calculate performance score
      const score = calculatePerformanceScore(webVitals, performanceMetrics);

      setMetrics(performanceMetrics);
      setAlerts(performanceAlerts);
      setRecommendations(performanceRecommendations);
      setPerformanceScore(score);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calculatePerformanceScore = useCallback((
    webVitals: WebVitalsMetrics,
    metrics: PerformanceMetrics
  ): number => {
    // Simplified performance score calculation
    const fcpScore = webVitals.fcp <= WEB_VITALS_THRESHOLDS.fcp.good ? 100 : 
                     webVitals.fcp <= WEB_VITALS_THRESHOLDS.fcp.poor ? 75 : 50;
    
    const lcpScore = webVitals.lcp <= WEB_VITALS_THRESHOLDS.lcp.good ? 100 : 
                     webVitals.lcp <= WEB_VITALS_THRESHOLDS.lcp.poor ? 75 : 50;
    
    const fidScore = webVitals.fid <= WEB_VITALS_THRESHOLDS.fid.good ? 100 : 
                     webVitals.fid <= WEB_VITALS_THRESHOLDS.fid.poor ? 75 : 50;
    
    const clsScore = webVitals.cls <= WEB_VITALS_THRESHOLDS.cls.good ? 100 : 
                     webVitals.cls <= WEB_VITALS_THRESHOLDS.cls.poor ? 75 : 50;

    const cacheScore = metrics.cacheHitRate >= 90 ? 100 : 
                       metrics.cacheHitRate >= 80 ? 85 : 70;

    return Math.round((fcpScore + lcpScore + fidScore + clsScore + cacheScore) / 5);
  }, []);

  const getMetricStatus = useCallback((metric: keyof WebVitalsMetrics, value: number): string => {
    const thresholds = WEB_VITALS_THRESHOLDS[metric];
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.poor) return 'needs_improvement';
    return 'poor';
  }, []);

  const handleResolveAlert = useCallback((alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, resolved: true } : alert
      )
    );
  }, []);

  // ===== RENDER FUNCTIONS =====

  const renderPerformanceOverview = () => {
    if (!metrics) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Performance Score</p>
                <p className="text-2xl font-bold">{performanceScore}</p>
              </div>
              <Gauge className={cn(
                "h-8 w-8",
                performanceScore >= 90 ? "text-green-500" :
                performanceScore >= 70 ? "text-yellow-500" : "text-red-500"
              )} />
            </div>
            <Progress value={performanceScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Load Time</p>
                <p className="text-2xl font-bold">{(metrics.loadTime / 1000).toFixed(1)}s</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Memory Usage</p>
                <p className="text-2xl font-bold">{metrics.memoryUsage.toFixed(1)}MB</p>
              </div>
              <HardDrive className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cache Hit Rate</p>
                <p className="text-2xl font-bold">{metrics.cacheHitRate.toFixed(1)}%</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderWebVitals = () => {
    if (!metrics) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(metrics.webVitals).map(([key, value]) => {
          const metricKey = key as keyof WebVitalsMetrics;
          const status = getMetricStatus(metricKey, value);
          const IconComponent = METRIC_ICONS[metricKey];
          const threshold = WEB_VITALS_THRESHOLDS[metricKey];
          
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <IconComponent className="h-5 w-5 text-blue-500" />
                  <h4 className="font-medium">{key.toUpperCase()}</h4>
                </div>
                <Badge className={cn('text-xs', PERFORMANCE_COLORS[status as keyof typeof PERFORMANCE_COLORS])}>
                  {status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {metricKey === 'cls' ? value.toFixed(3) : Math.round(value)}
                    {metricKey !== 'cls' && 'ms'}
                  </span>
                  {status === 'good' ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  Good: ≤{threshold.good}{metricKey !== 'cls' ? 'ms' : ''} •
                  Poor: &gt;{threshold.poor}{metricKey !== 'cls' ? 'ms' : ''}
                </div>

                <Progress 
                  value={Math.min((value / threshold.poor) * 100, 100)} 
                  className="h-2"
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderAlerts = () => (
    <div className="space-y-4">
      {alerts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
          <p>Không có performance alerts</p>
        </div>
      ) : (
        alerts.map((alert) => (
          <Alert key={alert.id} className={cn(
            alert.type === 'critical' ? 'border-red-200 bg-red-50' :
            alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
            'border-blue-200 bg-blue-50'
          )}>
            <AlertTriangle className={cn(
              "h-4 w-4",
              alert.type === 'critical' ? 'text-red-600' :
              alert.type === 'warning' ? 'text-yellow-600' :
              'text-blue-600'
            )} />
            <AlertDescription>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <strong>{alert.metric}</strong>
                    <Badge variant={
                      alert.type === 'critical' ? 'destructive' :
                      alert.type === 'warning' ? 'secondary' : 'default'
                    }>
                      {alert.type}
                    </Badge>
                    {alert.resolved && (
                      <Badge variant="outline" className="text-green-600">
                        Resolved
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm">{alert.message}</p>
                  <div className="text-xs text-muted-foreground mt-1">
                    Value: {alert.value.toFixed(1)} • Threshold: {alert.threshold} • 
                    {alert.timestamp.toLocaleTimeString('vi-VN')}
                  </div>
                </div>
                {!alert.resolved && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResolveAlert(alert.id)}
                  >
                    Resolve
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>
        ))
      )}
    </div>
  );

  const renderRecommendations = () => (
    <div className="space-y-4">
      {recommendations.map((rec) => (
        <motion.div
          key={rec.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border rounded-lg p-4"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium">{rec.title}</h4>
                <Badge variant="outline" className="text-xs">
                  {rec.category}
                </Badge>
                <Badge className={cn(
                  'text-xs',
                  rec.impact === 'high' ? 'bg-red-100 text-red-800' :
                  rec.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                )}>
                  {rec.impact} impact
                </Badge>
                <Badge className={cn(
                  'text-xs',
                  rec.effort === 'high' ? 'bg-red-100 text-red-800' :
                  rec.effort === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                )}>
                  {rec.effort} effort
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{rec.description}</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">Priority</div>
              <div className="text-2xl font-bold text-blue-600">#{rec.priority}</div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderDetailedMetrics = () => {
    if (!metrics) return null;

    const detailedMetrics = [
      { label: 'DOM Content Loaded', value: `${(metrics.domContentLoaded / 1000).toFixed(1)}s`, icon: Monitor },
      { label: 'Bundle Size', value: `${metrics.bundleSize.toFixed(1)}MB`, icon: HardDrive },
      { label: 'API Response Time', value: `${metrics.apiResponseTime.toFixed(0)}ms`, icon: Wifi },
      { label: 'Render Time', value: `${metrics.renderTime.toFixed(1)}ms`, icon: Eye },
      { label: 'JS Heap Size', value: `${metrics.jsHeapSize.toFixed(1)}MB`, icon: Cpu },
      { label: 'Network Latency', value: `${metrics.networkLatency.toFixed(0)}ms`, icon: Activity }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {detailedMetrics.map((metric) => {
          const IconComponent = metric.icon;
          return (
            <Card key={metric.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-xl font-bold">{metric.value}</p>
                  </div>
                  <IconComponent className="h-6 w-6 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  // ===== MAIN RENDER =====

  if (isLoading && !metrics) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Đang tải performance metrics...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Monitoring Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time performance metrics, Web Vitals và optimization recommendations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            Cập nhật: {lastRefresh.toLocaleTimeString('vi-VN')}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadPerformanceData}
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

      {/* Performance Overview */}
      {renderPerformanceOverview()}

      {/* Performance Score Alert */}
      {performanceScore < 70 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Performance Warning:</strong> Performance score is below optimal ({performanceScore}/100). 
            Check the recommendations tab for improvement suggestions.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs defaultValue="web-vitals" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="web-vitals" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Web Vitals
          </TabsTrigger>
          <TabsTrigger value="detailed" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Detailed Metrics
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alerts ({alerts.filter(a => !a.resolved).length})
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Recommendations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="web-vitals">
          <Card>
            <CardHeader>
              <CardTitle>Core Web Vitals</CardTitle>
              <CardDescription>
                Các metrics quan trọng để đánh giá user experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderWebVitals()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Performance Metrics</CardTitle>
              <CardDescription>
                Chi tiết các metrics về loading, rendering và resource usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderDetailedMetrics()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Performance Alerts</CardTitle>
              <CardDescription>
                Cảnh báo về các vấn đề performance cần được xử lý
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderAlerts()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Recommendations</CardTitle>
              <CardDescription>
                Các đề xuất để cải thiện performance dựa trên metrics hiện tại
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderRecommendations()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceMonitoringDashboard;
