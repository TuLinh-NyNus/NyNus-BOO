/**
 * Performance Dashboard Component
 * Dashboard để monitor performance metrics và system health
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Zap, 
  Database, 
  Globe, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Cpu,
  HardDrive,
  Wifi
} from 'lucide-react';
import { cacheManager } from '@/lib/performance/cache-manager';
// import { performanceMonitor } from '@/lib/performance-monitor';
// import { PERFORMANCE_CONFIG, RuntimeConfig } from '@/lib/performance/production-config';

/**
 * Performance Metrics Interface
 */
interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  
  // Custom metrics
  pageLoadTime?: number;
  apiResponseTime?: number;
  memoryUsage?: number;
  cacheHitRate?: number;
  errorRate?: number;
  
  // Timestamps
  timestamp: number;
  pathname: string;
}

/**
 * System Health Status
 */
interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  score: number;
  issues: string[];
  recommendations: string[];
}

/**
 * Performance Metric Card Component
 */
interface MetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  threshold?: number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'stable';
  description?: string;
}

function MetricCard({ title, value, unit = '', threshold, icon: Icon, trend, description }: MetricCardProps) {
  const numValue = typeof value === 'number' ? value : parseFloat(value.toString());
  const isGood = threshold ? numValue <= threshold : true;
  
  const getStatusColor = () => {
    if (!threshold) return 'text-blue-600';
    if (numValue <= threshold * 0.7) return 'text-green-600';
    if (numValue <= threshold) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return null;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-2xl font-bold ${getStatusColor()}`}>
              {typeof value === 'number' ? value.toFixed(1) : value}{unit}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {getTrendIcon()}
        </div>
        
        {threshold && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Threshold: {threshold}{unit}</span>
              <Badge variant={isGood ? 'default' : 'destructive'} className="text-xs">
                {isGood ? 'Good' : 'Poor'}
              </Badge>
            </div>
            <Progress 
              value={Math.min((numValue / threshold) * 100, 100)} 
              className="h-1"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * System Health Component
 */
function SystemHealthCard({ health }: { health: SystemHealth }) {
  const getStatusIcon = () => {
    switch (health.status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (health.status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {getStatusIcon()}
          <span>System Health</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Score</span>
            <span className={`text-2xl font-bold ${getStatusColor()}`}>
              {health.score}/100
            </span>
          </div>
          
          <Progress value={health.score} className="h-2" />
          
          {health.issues.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Issues</h4>
              <ul className="space-y-1">
                {health.issues.map((issue, index) => (
                  <li key={index} className="text-xs text-red-600 flex items-center space-x-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {health.recommendations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Recommendations</h4>
              <ul className="space-y-1">
                {health.recommendations.map((rec, index) => (
                  <li key={index} className="text-xs text-blue-600">
                    • {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Cache Statistics Component
 */
interface CacheStatsDisplay {
  memory: {
    hits: number;
    misses: number;
    sets: number;
    deletes: number;
    size: number;
  };
  localStorage: {
    size: number;
  };
}

function CacheStatsCard() {
  const [cacheStats, setCacheStats] = useState<CacheStatsDisplay | null>(null);

  useEffect(() => {
    const updateStats = () => {
      const stats = cacheManager.getStats();
      setCacheStats(stats);
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (!cacheStats) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading cache stats...</span>
        </CardContent>
      </Card>
    );
  }

  const hitRate = cacheStats.memory.hits + cacheStats.memory.misses > 0 
    ? (cacheStats.memory.hits / (cacheStats.memory.hits + cacheStats.memory.misses)) * 100 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5" />
          <span>Cache Performance</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{hitRate.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Hit Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{cacheStats.memory.size}</div>
              <div className="text-xs text-muted-foreground">Cached Items</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Memory Cache Hits</span>
              <span className="font-medium">{cacheStats.memory.hits}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Memory Cache Misses</span>
              <span className="font-medium">{cacheStats.memory.misses}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>LocalStorage Items</span>
              <span className="font-medium">{cacheStats.localStorage.size}</span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              cacheManager.cleanup();
              setCacheStats(cacheManager.getStats());
            }}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Cleanup Cache
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Main Performance Dashboard Component
 */
export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: 'healthy',
    score: 85,
    issues: [],
    recommendations: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const calculateSystemHealth = useCallback((): SystemHealth => {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check performance thresholds
    if (metrics?.lcp && metrics.lcp > 2.5) {
      issues.push('Largest Contentful Paint is slow');
      recommendations.push('Optimize images and reduce bundle size');
      score -= 15;
    }

    if (metrics?.fid && metrics.fid > 100) {
      issues.push('First Input Delay is high');
      recommendations.push('Reduce JavaScript execution time');
      score -= 10;
    }

    if (metrics?.cls && metrics.cls > 0.1) {
      issues.push('Cumulative Layout Shift is high');
      recommendations.push('Ensure images have dimensions and avoid dynamic content');
      score -= 10;
    }

    const status = score >= 80 ? 'healthy' : score >= 60 ? 'warning' : 'critical';

    return { status, score, issues, recommendations };
  }, [metrics]);

  useEffect(() => {
    const loadMetrics = async () => {
      setIsLoading(true);
      
      try {
        // Get performance stats from monitor (for future use)
        // const _stats = performanceMonitor.getStats();

        // Calculate system health
        const health = calculateSystemHealth();
        setSystemHealth(health);
        
        // Set mock metrics for demo
        setMetrics({
          lcp: 2.1,
          fid: 45,
          cls: 0.08,
          fcp: 1.8,
          ttfb: 320,
          pageLoadTime: 2.5,
          apiResponseTime: 180,
          memoryUsage: 45.2,
          cacheHitRate: 78.5,
          errorRate: 0.2,
          timestamp: Date.now(),
          pathname: window.location.pathname
        });
      } catch (error) {
        console.error('Failed to load performance metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [calculateSystemHealth]);

  const handleRefresh = () => {
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading performance data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor system performance và optimization metrics
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      {/* System Health */}
      <SystemHealthCard health={systemHealth} />

      {/* Performance Metrics */}
      <Tabs defaultValue="web-vitals" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="web-vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="web-vitals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics && (
              <>
                <MetricCard
                  title="Largest Contentful Paint"
                  value={metrics.lcp || 0}
                  unit="s"
                  threshold={2.5}
                  icon={Zap}
                  description="Time to render largest element"
                />
                <MetricCard
                  title="First Input Delay"
                  value={metrics.fid || 0}
                  unit="ms"
                  threshold={100}
                  icon={Clock}
                  description="Time to first user interaction"
                />
                <MetricCard
                  title="Cumulative Layout Shift"
                  value={metrics.cls || 0}
                  threshold={0.1}
                  icon={Activity}
                  description="Visual stability score"
                />
                <MetricCard
                  title="First Contentful Paint"
                  value={metrics.fcp || 0}
                  unit="s"
                  threshold={1.8}
                  icon={BarChart3}
                  description="Time to first content render"
                />
                <MetricCard
                  title="Time to First Byte"
                  value={metrics.ttfb || 0}
                  unit="ms"
                  threshold={600}
                  icon={Wifi}
                  description="Server response time"
                />
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics && (
              <>
                <MetricCard
                  title="Page Load Time"
                  value={metrics.pageLoadTime || 0}
                  unit="s"
                  threshold={3.0}
                  icon={Globe}
                  description="Total page load duration"
                />
                <MetricCard
                  title="API Response Time"
                  value={metrics.apiResponseTime || 0}
                  unit="ms"
                  threshold={500}
                  icon={Database}
                  description="Average API response time"
                />
                <MetricCard
                  title="Error Rate"
                  value={metrics.errorRate || 0}
                  unit="%"
                  threshold={1.0}
                  icon={AlertTriangle}
                  description="Application error percentage"
                />
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CacheStatsCard />
            {metrics && (
              <MetricCard
                title="Cache Hit Rate"
                value={metrics.cacheHitRate || 0}
                unit="%"
                threshold={80}
                icon={Database}
                description="Percentage of cache hits"
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics && (
              <>
                <MetricCard
                  title="Memory Usage"
                  value={metrics.memoryUsage || 0}
                  unit="MB"
                  threshold={100}
                  icon={Cpu}
                  description="JavaScript heap usage"
                />
                <MetricCard
                  title="Bundle Size"
                  value="2.1"
                  unit="MB"
                  threshold={5.0}
                  icon={HardDrive}
                  description="Total JavaScript bundle size"
                />
                <MetricCard
                  title="Active Connections"
                  value="4"
                  threshold={10}
                  icon={Wifi}
                  description="Active network connections"
                />
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
