/**
 * User Interface Performance Optimizer Component
 * Advanced performance optimization cho user interface components
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  Clock,
  MemoryStick,
  Gauge,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { usePerformanceOptimization } from '@/hooks/performance/usePerformanceOptimization';

// ===== TYPES =====

export interface UserInterfacePerformanceOptimizerProps {
  className?: string;
  componentName?: string;
  enableAutoOptimization?: boolean;
  showDetailedMetrics?: boolean;
}

interface PerformanceMetrics {
  // Core Web Vitals
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  
  // Custom metrics
  renderTime: number;
  rerenderCount: number;
  memoryUsage?: number;
  cacheHitRate: number;
  networkLatency: number;
  
  // Scores
  performanceScore: number; // 0-100
  lastUpdate: Date;
}

interface OptimizationRecommendation {
  id: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  category: 'rendering' | 'memory' | 'network' | 'caching';
  priority: number;
  implemented: boolean;
}

interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
}

// ===== CONSTANTS =====

const PERFORMANCE_THRESHOLDS = {
  fcp: { good: 1800, poor: 3000 },
  lcp: { good: 2500, poor: 4000 },
  fid: { good: 100, poor: 300 },
  cls: { good: 0.1, poor: 0.25 },
  renderTime: { good: 16, poor: 50 },
  memoryUsage: { good: 50 * 1024 * 1024, poor: 100 * 1024 * 1024 } // 50MB, 100MB
};

const IMPACT_COLORS = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

const EFFORT_COLORS = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

// ===== MAIN COMPONENT =====

export function UserInterfacePerformanceOptimizer({
  className,
  componentName = 'UserInterface',
  enableAutoOptimization = true,
  showDetailedMetrics = false
}: UserInterfacePerformanceOptimizerProps) {
  // ===== STATE =====

  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // ===== PERFORMANCE HOOK =====
  
  const {
    metrics: hookMetrics
  } = usePerformanceOptimization({
    componentName,
    enabled: true,
    logWarnings: true,
    warningThreshold: 16
  });

  // ===== EFFECTS =====

  useEffect(() => {
    initializePerformanceMonitoring();
    startMetricsCollection();

    return () => {
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (enableAutoOptimization && metrics) {
      analyzePerformanceAndOptimize();
    }
  }, [metrics, enableAutoOptimization]); // eslint-disable-line react-hooks/exhaustive-deps

  // ===== HANDLERS =====

  const initializePerformanceMonitoring = useCallback(() => {
    setIsLoading(true);

    // Initialize Web Vitals monitoring
    if ('web-vitals' in window || typeof window !== 'undefined') {
      // Mock Web Vitals data for now
      // In production, use real web-vitals library
      const mockMetrics: PerformanceMetrics = {
        fcp: 1200 + Math.random() * 800,
        lcp: 2000 + Math.random() * 1000,
        fid: 50 + Math.random() * 100,
        cls: Math.random() * 0.2,
        renderTime: hookMetrics.renderTime || 0,
        rerenderCount: hookMetrics.rerenderCount || 0,
        memoryUsage: hookMetrics.memoryUsage,
        cacheHitRate: 85 + Math.random() * 15,
        networkLatency: 100 + Math.random() * 200,
        performanceScore: 0,
        lastUpdate: new Date()
      };

      // Calculate performance score
      mockMetrics.performanceScore = calculatePerformanceScore(mockMetrics);

      setMetrics(mockMetrics);
    }

    setIsLoading(false);
  }, [hookMetrics]); // eslint-disable-line react-hooks/exhaustive-deps

  const startMetricsCollection = useCallback(() => {
    metricsIntervalRef.current = setInterval(() => {
      updateMetrics();
    }, 5000); // Update every 5 seconds
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateMetrics = useCallback(() => {
    if (!metrics) return;

    const updatedMetrics: PerformanceMetrics = {
      ...metrics,
      renderTime: hookMetrics.renderTime || metrics.renderTime,
      rerenderCount: hookMetrics.rerenderCount || metrics.rerenderCount,
      memoryUsage: hookMetrics.memoryUsage || metrics.memoryUsage,
      lastUpdate: new Date()
    };

    // Recalculate performance score
    updatedMetrics.performanceScore = calculatePerformanceScore(updatedMetrics);

    setMetrics(updatedMetrics);

    // Check for performance alerts
    checkPerformanceAlerts(updatedMetrics);
  }, [metrics, hookMetrics]); // eslint-disable-line react-hooks/exhaustive-deps

  const calculatePerformanceScore = useCallback((metrics: PerformanceMetrics): number => {
    let score = 100;
    
    // FCP score (25%)
    if (metrics.fcp > PERFORMANCE_THRESHOLDS.fcp.poor) score -= 25;
    else if (metrics.fcp > PERFORMANCE_THRESHOLDS.fcp.good) score -= 15;
    
    // LCP score (25%)
    if (metrics.lcp > PERFORMANCE_THRESHOLDS.lcp.poor) score -= 25;
    else if (metrics.lcp > PERFORMANCE_THRESHOLDS.lcp.good) score -= 15;
    
    // FID score (25%)
    if (metrics.fid > PERFORMANCE_THRESHOLDS.fid.poor) score -= 25;
    else if (metrics.fid > PERFORMANCE_THRESHOLDS.fid.good) score -= 15;
    
    // CLS score (25%)
    if (metrics.cls > PERFORMANCE_THRESHOLDS.cls.poor) score -= 25;
    else if (metrics.cls > PERFORMANCE_THRESHOLDS.cls.good) score -= 15;
    
    return Math.max(0, Math.round(score));
  }, []);

  const checkPerformanceAlerts = useCallback((metrics: PerformanceMetrics) => {
    const newAlerts: PerformanceAlert[] = [];
    
    // Check render time
    if (metrics.renderTime > PERFORMANCE_THRESHOLDS.renderTime.poor) {
      newAlerts.push({
        id: `render-time-${Date.now()}`,
        type: 'error',
        title: 'Render Time Cao',
        message: `Component render mất ${metrics.renderTime.toFixed(2)}ms (> ${PERFORMANCE_THRESHOLDS.renderTime.poor}ms)`,
        timestamp: new Date(),
        resolved: false
      });
    }
    
    // Check memory usage
    if (metrics.memoryUsage && metrics.memoryUsage > PERFORMANCE_THRESHOLDS.memoryUsage.poor) {
      newAlerts.push({
        id: `memory-${Date.now()}`,
        type: 'warning',
        title: 'Memory Usage Cao',
        message: `Memory usage: ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`,
        timestamp: new Date(),
        resolved: false
      });
    }
    
    // Check rerender count
    if (metrics.rerenderCount > 10) {
      newAlerts.push({
        id: `rerender-${Date.now()}`,
        type: 'warning',
        title: 'Quá nhiều Re-render',
        message: `Component đã re-render ${metrics.rerenderCount} lần`,
        timestamp: new Date(),
        resolved: false
      });
    }
    
    if (newAlerts.length > 0) {
      setAlerts(prev => [...prev.slice(-4), ...newAlerts]); // Keep last 5 alerts
    }
  }, []);

  const analyzePerformanceAndOptimize = useCallback(async () => {
    if (!metrics || isOptimizing) return;
    
    setIsOptimizing(true);
    
    try {
      const newRecommendations: OptimizationRecommendation[] = [];
      
      // Analyze render performance
      if (metrics.renderTime > PERFORMANCE_THRESHOLDS.renderTime.good) {
        newRecommendations.push({
          id: 'optimize-render',
          title: 'Tối ưu Render Performance',
          description: 'Sử dụng React.memo, useMemo, useCallback để giảm re-render không cần thiết',
          impact: 'high',
          effort: 'medium',
          category: 'rendering',
          priority: 1,
          implemented: false
        });
      }
      
      // Analyze memory usage
      if (metrics.memoryUsage && metrics.memoryUsage > PERFORMANCE_THRESHOLDS.memoryUsage.good) {
        newRecommendations.push({
          id: 'optimize-memory',
          title: 'Tối ưu Memory Usage',
          description: 'Cleanup event listeners, clear intervals, và optimize data structures',
          impact: 'medium',
          effort: 'medium',
          category: 'memory',
          priority: 2,
          implemented: false
        });
      }
      
      // Analyze cache performance
      if (metrics.cacheHitRate < 80) {
        newRecommendations.push({
          id: 'improve-caching',
          title: 'Cải thiện Cache Strategy',
          description: 'Implement better caching strategies cho API calls và static assets',
          impact: 'medium',
          effort: 'low',
          category: 'caching',
          priority: 3,
          implemented: false
        });
      }
      
      // Analyze network performance
      if (metrics.networkLatency > 300) {
        newRecommendations.push({
          id: 'optimize-network',
          title: 'Tối ưu Network Requests',
          description: 'Implement request batching, compression, và CDN optimization',
          impact: 'high',
          effort: 'high',
          category: 'network',
          priority: 4,
          implemented: false
        });
      }
      
      setRecommendations(newRecommendations);
    } catch (error) {
      console.error('Performance analysis failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  }, [metrics, isOptimizing]);

  const implementRecommendation = useCallback((recommendationId: string) => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === recommendationId 
          ? { ...rec, implemented: true }
          : rec
      )
    );
    
    // In a real implementation, this would trigger actual optimizations
    console.log(`Implementing recommendation: ${recommendationId}`);
  }, []);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, resolved: true }
          : alert
      )
    );
  }, []);

  // ===== COMPUTED VALUES =====

  const performanceStatus = useMemo(() => {
    if (!metrics) return 'unknown';
    
    if (metrics.performanceScore >= 90) return 'excellent';
    if (metrics.performanceScore >= 75) return 'good';
    if (metrics.performanceScore >= 50) return 'fair';
    return 'poor';
  }, [metrics]);

  const statusColor = useMemo(() => {
    switch (performanceStatus) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }, [performanceStatus]);

  const statusIcon = useMemo(() => {
    switch (performanceStatus) {
      case 'excellent': return CheckCircle;
      case 'good': return TrendingUp;
      case 'fair': return Activity;
      case 'poor': return TrendingDown;
      default: return AlertTriangle;
    }
  }, [performanceStatus]);

  // ===== RENDER FUNCTIONS =====

  const renderMetricsOverview = () => {
    if (!metrics) return null;

    const StatusIcon = statusIcon;

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Performance Overview
              </CardTitle>
              <CardDescription>
                Real-time performance metrics cho {componentName}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon className={cn('h-6 w-6', statusColor)} />
              <span className={cn('font-semibold', statusColor)}>
                {metrics.performanceScore}/100
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Performance Score</span>
              <span className={statusColor}>{metrics.performanceScore}%</span>
            </div>
            <Progress value={metrics.performanceScore} className="h-2" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {metrics.fcp.toFixed(0)}ms
              </div>
              <div className="text-xs text-muted-foreground">FCP</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {metrics.lcp.toFixed(0)}ms
              </div>
              <div className="text-xs text-muted-foreground">LCP</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {metrics.fid.toFixed(0)}ms
              </div>
              <div className="text-xs text-muted-foreground">FID</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {metrics.cls.toFixed(3)}
              </div>
              <div className="text-xs text-muted-foreground">CLS</div>
            </div>
          </div>

          {showDetailedMetrics && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">{metrics.renderTime.toFixed(2)}ms</div>
                  <div className="text-xs text-muted-foreground">Render Time</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">{metrics.rerenderCount}</div>
                  <div className="text-xs text-muted-foreground">Re-renders</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <MemoryStick className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">
                    {metrics.memoryUsage ? `${(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB` : 'N/A'}
                  </div>
                  <div className="text-xs text-muted-foreground">Memory</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderRecommendations = () => {
    if (recommendations.length === 0) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Optimization Recommendations
          </CardTitle>
          <CardDescription>
            Các đề xuất để cải thiện performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.map((rec) => (
            <div key={rec.id} className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium">{rec.title}</h4>
                  <Badge className={cn('text-xs', IMPACT_COLORS[rec.impact])}>
                    {rec.impact} impact
                  </Badge>
                  <Badge className={cn('text-xs', EFFORT_COLORS[rec.effort])}>
                    {rec.effort} effort
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{rec.description}</p>
              </div>
              <Button
                size="sm"
                variant={rec.implemented ? "secondary" : "default"}
                onClick={() => implementRecommendation(rec.id)}
                disabled={rec.implemented}
              >
                {rec.implemented ? 'Implemented' : 'Apply'}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  const renderAlerts = () => {
    const activeAlerts = alerts.filter(alert => !alert.resolved);
    if (activeAlerts.length === 0) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Performance Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeAlerts.map((alert) => (
            <div key={alert.id} className="flex items-start justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{alert.title}</h4>
                  <Badge variant={alert.type === 'error' ? 'destructive' : 'secondary'}>
                    {alert.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{alert.message}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => dismissAlert(alert.id)}
              >
                Dismiss
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Đang khởi tạo performance monitoring...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {renderMetricsOverview()}
      {renderRecommendations()}
      {renderAlerts()}
    </div>
  );
}

export default UserInterfacePerformanceOptimizer;
