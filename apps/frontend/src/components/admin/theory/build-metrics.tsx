/**
 * Build Metrics Component
 * Component hiển thị performance statistics và build metrics cho theory system
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Button } from "@/components/ui/form/button";
import { Badge } from "@/components/ui/display/badge";
import { Progress } from "@/components/ui/display/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/navigation/tabs";
import {
  BarChart3,
  TrendingUp,
  Clock,
  FileText,
  Smartphone,
  Monitor,
  Zap,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

// ===== TYPES =====

export interface BuildMetricsData {
  buildTime: number;
  totalFiles: number;
  processedFiles: number;
  errorFiles: number;
  totalSize: number;
  compressedSize: number;
  mobileScore: number;
  desktopScore: number;
  latexExpressions: number;
  buildDate: Date;
  version: string;
}

export interface HistoricalMetrics {
  date: Date;
  buildTime: number;
  mobileScore: number;
  desktopScore: number;
  fileCount: number;
}

export interface BuildMetricsProps {
  /** Current build metrics data */
  buildData: BuildMetricsData;
  
  /** Historical metrics data */
  historicalData?: HistoricalMetrics[];
  
  /** Show historical data tab */
  showHistoricalData?: boolean;
  
  /** Auto-refresh interval in seconds */
  refreshInterval?: number;
  
  /** Handler để refresh metrics */
  onRefresh?: () => Promise<void>;
  
  /** Handler để download report */
  onDownloadReport?: () => Promise<void>;
  
  /** Custom CSS classes */
  className?: string;
}

// ===== MOCK DATA =====

const mockHistoricalData: HistoricalMetrics[] = [
  { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), buildTime: 45.2, mobileScore: 92, desktopScore: 96, fileCount: 150 },
  { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), buildTime: 43.8, mobileScore: 94, desktopScore: 97, fileCount: 152 },
  { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), buildTime: 46.1, mobileScore: 93, desktopScore: 96, fileCount: 154 },
  { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), buildTime: 44.5, mobileScore: 95, desktopScore: 98, fileCount: 155 },
  { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), buildTime: 42.3, mobileScore: 96, desktopScore: 98, fileCount: 156 },
  { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), buildTime: 41.8, mobileScore: 96, desktopScore: 99, fileCount: 156 },
  { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), buildTime: 40.2, mobileScore: 97, desktopScore: 99, fileCount: 156 }
];

// ===== MAIN COMPONENT =====

export function BuildMetrics({
  buildData,
  historicalData = mockHistoricalData,
  showHistoricalData = true,
  refreshInterval = 30,
  onRefresh,
  onDownloadReport,
  className
}: BuildMetricsProps) {
  
  // ===== STATE =====
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // ===== HANDLERS =====

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to refresh metrics:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  const handleDownloadReport = useCallback(async () => {
    if (!onDownloadReport) return;
    
    try {
      await onDownloadReport();
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  }, [onDownloadReport]);

  // ===== EFFECTS =====

  useEffect(() => {
    if (refreshInterval > 0 && onRefresh) {
      const interval = setInterval(() => {
        if (!isRefreshing) {
          handleRefresh();
        }
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [refreshInterval, onRefresh, isRefreshing, handleRefresh]);

  // ===== COMPUTED VALUES =====

  const compressionRatio = buildData.totalSize > 0 
    ? ((buildData.totalSize - buildData.compressedSize) / buildData.totalSize * 100)
    : 0;

  const successRate = buildData.totalFiles > 0
    ? ((buildData.processedFiles - buildData.errorFiles) / buildData.totalFiles * 100)
    : 0;

  const averageBuildTime = historicalData.length > 0
    ? historicalData.reduce((sum, item) => sum + item.buildTime, 0) / historicalData.length
    : 0;

  const trendDirection = historicalData.length >= 2
    ? buildData.buildTime < historicalData[historicalData.length - 2].buildTime ? 'improving' : 'declining'
    : 'stable';

  // ===== RENDER HELPERS =====

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  const getTrendIcon = () => {
    switch (trendDirection) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default:
        return <TrendingUp className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // ===== RENDER =====

  return (
    <Card className={cn("build-metrics", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Build Metrics Dashboard
        </CardTitle>
        <CardDescription>
          Performance statistics và build metrics cho theory system
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            {showHistoricalData && (
              <TabsTrigger value="trends">Trends</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Header Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Version {buildData.version}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {buildData.buildDate.toLocaleDateString()}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Last refresh: {lastRefresh.toLocaleTimeString()}
                </span>
                
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="sm"
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>

                {onDownloadReport && (
                  <Button
                    onClick={handleDownloadReport}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Report
                  </Button>
                )}
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Build Time</span>
                    {getTrendIcon()}
                  </div>
                  <div className="text-2xl font-bold mt-2">{formatDuration(buildData.buildTime)}</div>
                  <p className="text-xs text-muted-foreground">
                    Avg: {formatDuration(averageBuildTime)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Files</span>
                  </div>
                  <div className="text-2xl font-bold mt-2">{buildData.processedFiles}/{buildData.totalFiles}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Progress value={successRate} className="h-1 flex-1" />
                    <span className="text-xs text-muted-foreground">{successRate.toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Mobile Score</span>
                  </div>
                  <div className={`text-2xl font-bold mt-2 ${getScoreColor(buildData.mobileScore)}`}>
                    {buildData.mobileScore}
                  </div>
                  <Badge variant={getScoreBadge(buildData.mobileScore)} className="mt-1 text-xs">
                    {buildData.mobileScore >= 90 ? 'Excellent' : 
                     buildData.mobileScore >= 70 ? 'Good' : 'Needs Work'}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Desktop Score</span>
                  </div>
                  <div className={`text-2xl font-bold mt-2 ${getScoreColor(buildData.desktopScore)}`}>
                    {buildData.desktopScore}
                  </div>
                  <Badge variant={getScoreBadge(buildData.desktopScore)} className="mt-1 text-xs">
                    {buildData.desktopScore >= 90 ? 'Excellent' : 
                     buildData.desktopScore >= 70 ? 'Good' : 'Needs Work'}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Stats */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">File Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Total Files</span>
                    <span className="font-medium">{buildData.totalFiles}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Processed Successfully</span>
                    <span className="font-medium text-green-600">{buildData.processedFiles - buildData.errorFiles}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Errors</span>
                    <span className="font-medium text-red-600">{buildData.errorFiles}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>LaTeX Expressions</span>
                    <span className="font-medium">{buildData.latexExpressions}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Size & Compression</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Original Size</span>
                    <span className="font-medium">{formatFileSize(buildData.totalSize)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Compressed Size</span>
                    <span className="font-medium">{formatFileSize(buildData.compressedSize)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Compression Ratio</span>
                    <span className="font-medium text-green-600">{compressionRatio.toFixed(1)}%</span>
                  </div>
                  <div className="mt-2">
                    <Progress value={compressionRatio} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            {/* Performance Analysis */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Performance Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    {buildData.buildTime < 60 ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm">
                      Build time: {buildData.buildTime < 60 ? 'Excellent' : 'Could be improved'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {buildData.mobileScore >= 90 ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm">
                      Mobile performance: {buildData.mobileScore >= 90 ? 'Excellent' : 'Needs optimization'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {buildData.errorFiles === 0 ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">
                      Error rate: {buildData.errorFiles === 0 ? 'No errors' : `${buildData.errorFiles} errors found`}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Optimization Suggestions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xs space-y-1">
                    {buildData.buildTime > 60 && (
                      <div className="text-yellow-600">• Consider optimizing LaTeX expressions</div>
                    )}
                    {buildData.mobileScore < 90 && (
                      <div className="text-yellow-600">• Improve mobile performance optimization</div>
                    )}
                    {buildData.errorFiles > 0 && (
                      <div className="text-red-600">• Fix LaTeX syntax errors</div>
                    )}
                    {compressionRatio < 50 && (
                      <div className="text-yellow-600">• Enable better compression</div>
                    )}
                    {buildData.buildTime <= 60 && buildData.mobileScore >= 90 && buildData.errorFiles === 0 && (
                      <div className="text-green-600">• Performance is excellent!</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {showHistoricalData && (
            <TabsContent value="trends" className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Historical trends visualization would be implemented here</p>
                <p className="text-xs mt-2">
                  Showing data from {historicalData.length} previous builds
                </p>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}

// ===== VARIANTS =====

/**
 * Compact Build Metrics
 * Phiên bản compact cho dashboard
 */
export function CompactBuildMetrics(props: BuildMetricsProps) {
  return (
    <BuildMetrics
      {...props}
      showHistoricalData={false}
      className={cn("compact-build-metrics", props.className)}
    />
  );
}

/**
 * Detailed Build Metrics
 * Phiên bản đầy đủ với tất cả features
 */
export function DetailedBuildMetrics(props: BuildMetricsProps) {
  return (
    <BuildMetrics
      {...props}
      showHistoricalData={true}
      className={cn("detailed-build-metrics", props.className)}
    />
  );
}
