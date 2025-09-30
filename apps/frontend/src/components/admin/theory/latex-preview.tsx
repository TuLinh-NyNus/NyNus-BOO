/**
 * LaTeX Preview Component
 * Component preview LaTeX content với desktop/mobile modes và performance metrics
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Button } from "@/components/ui/form/button";
import { Badge } from "@/components/ui/display/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/navigation/tabs";
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import {
  Monitor,
  Smartphone,
  Tablet,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LaTeXContent, useLatexContent } from "@/components/latex";
import { usePerformanceOptimization } from '@/hooks';

// ===== TYPES =====

export interface LaTeXPreviewProps {
  /** Content để preview */
  content: string;
  
  /** Preview mode */
  mode?: 'desktop' | 'mobile' | 'split';
  
  /** Show performance metrics */
  showPerformanceMetrics?: boolean;
  
  /** Enable zoom controls */
  enableZoom?: boolean;
  
  /** Error handler */
  onError?: (error: string) => void;
  
  /** Performance metrics callback */
  onPerformanceUpdate?: (metrics: PerformanceMetrics) => void;
  
  /** Custom CSS classes */
  className?: string;
}

export interface PerformanceMetrics {
  renderTime: number;
  latexCount: number;
  contentSize: number;
  mobileScore: number;
  desktopScore: number;
  errorCount: number;
  lastUpdate: Date;
}

export interface DeviceConfig {
  name: string;
  width: number;
  height: number;
  scale: number;
  icon: React.ComponentType<{ className?: string }>;
}

// ===== CONSTANTS =====

const DEVICE_CONFIGS: DeviceConfig[] = [
  { name: 'Desktop', width: 1200, height: 800, scale: 0.6, icon: Monitor },
  { name: 'Tablet', width: 768, height: 1024, scale: 0.7, icon: Tablet },
  { name: 'Mobile', width: 375, height: 667, scale: 0.9, icon: Smartphone }
];

const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2];

// ===== MAIN COMPONENT =====

export function LaTeXPreview({
  content,
  mode = 'desktop',
  showPerformanceMetrics = true,
  enableZoom = true,
  onError,
  onPerformanceUpdate,
  className
}: LaTeXPreviewProps) {
  
  // ===== STATE =====
  
  const [selectedDevice, setSelectedDevice] = useState<DeviceConfig>(DEVICE_CONFIGS[0]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    latexCount: 0,
    contentSize: 0,
    mobileScore: 0,
    desktopScore: 0,
    errorCount: 0,
    lastUpdate: new Date()
  });

  // ===== HOOKS =====

  const latexAnalysis = useLatexContent(content);
  const performance = usePerformanceOptimization({
    componentName: 'LaTeXPreview',
    enabled: showPerformanceMetrics,
    onPerformanceWarning: (metrics) => {
      console.warn('LaTeX Preview performance warning:', metrics);
    }
  });

  // ===== HANDLERS =====

  const handleDeviceChange = useCallback((deviceName: string) => {
    const device = DEVICE_CONFIGS.find(d => d.name === deviceName);
    if (device) {
      setSelectedDevice(device);
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoomLevel);
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      setZoomLevel(ZOOM_LEVELS[currentIndex + 1]);
    }
  }, [zoomLevel]);

  const handleZoomOut = useCallback(() => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoomLevel);
    if (currentIndex > 0) {
      setZoomLevel(ZOOM_LEVELS[currentIndex - 1]);
    }
  }, [zoomLevel]);



  const updatePerformanceMetrics = useCallback(() => {
    performance.startMeasurement();

    const newMetrics: PerformanceMetrics = {
      renderTime: performance.metrics.renderTime,
      latexCount: latexAnalysis.expressions.filter(e => e.type !== 'text').length,
      contentSize: content.length,
      mobileScore: Math.max(0, 100 - (performance.metrics.renderTime * 2)),
      desktopScore: Math.max(0, 100 - performance.metrics.renderTime),
      errorCount: latexAnalysis.expressions.filter(e => e.isValid === false).length,
      lastUpdate: new Date()
    };

    setPerformanceMetrics(newMetrics);
    onPerformanceUpdate?.(newMetrics);

    performance.endMeasurement();
  }, [performance, latexAnalysis, content, onPerformanceUpdate]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
      updatePerformanceMetrics();
    }, 1000);
  }, [updatePerformanceMetrics]);

  // ===== EFFECTS =====

  useEffect(() => {
    updatePerformanceMetrics();
  }, [content, updatePerformanceMetrics]);

  useEffect(() => {
    if (latexAnalysis.expressions.some(e => e.isValid === false)) {
      const errors = latexAnalysis.expressions
        .filter(e => e.isValid === false)
        .map(e => e.error || 'Unknown error')
        .join(', ');
      onError?.(errors);
    }
  }, [latexAnalysis, onError]);

  // ===== RENDER HELPERS =====

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

  const renderDevicePreview = (device: DeviceConfig) => (
    <div className="flex justify-center p-4 bg-muted/30 rounded-lg">
      <div
        className="bg-white border-2 border-gray-300 rounded-lg shadow-lg overflow-hidden"
        style={{
          width: device.width * device.scale * zoomLevel,
          height: device.height * device.scale * zoomLevel,
          transform: `scale(${device.scale * zoomLevel})`
        }}
      >
        <div className="h-full overflow-y-auto p-4">
          <div className="prose prose-sm max-w-none">
            <LaTeXContent
              content={content}
              safeMode={true}
              showStats={false}
              onError={(errors) => {
                const errorMessage = errors.join(', ');
                onError?.(errorMessage);
              }}
              className="latex-preview-content"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPerformanceMetrics = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold">{performanceMetrics.renderTime.toFixed(1)}ms</div>
          <p className="text-xs text-muted-foreground">Render Time</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold">{performanceMetrics.latexCount}</div>
          <p className="text-xs text-muted-foreground">LaTeX Expressions</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <div className={`text-2xl font-bold ${getScoreColor(performanceMetrics.mobileScore)}`}>
            {performanceMetrics.mobileScore}
          </div>
          <p className="text-xs text-muted-foreground">Mobile Score</p>
          <Badge variant={getScoreBadge(performanceMetrics.mobileScore)} className="mt-1 text-xs">
            {performanceMetrics.mobileScore >= 90 ? 'Excellent' : 
             performanceMetrics.mobileScore >= 70 ? 'Good' : 'Needs Work'}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <div className={`text-2xl font-bold ${getScoreColor(performanceMetrics.desktopScore)}`}>
            {performanceMetrics.desktopScore}
          </div>
          <p className="text-xs text-muted-foreground">Desktop Score</p>
          <Badge variant={getScoreBadge(performanceMetrics.desktopScore)} className="mt-1 text-xs">
            {performanceMetrics.desktopScore >= 90 ? 'Excellent' : 
             performanceMetrics.desktopScore >= 70 ? 'Good' : 'Needs Work'}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );

  // ===== RENDER =====

  return (
    <Card className={cn("latex-preview", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          LaTeX Preview
        </CardTitle>
        <CardDescription>
          Preview LaTeX content với desktop/mobile modes và performance metrics
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="preview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            {showPerformanceMetrics && (
              <TabsTrigger value="metrics">Performance</TabsTrigger>
            )}
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-4">
            {/* Preview Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleDeviceChange('Desktop')}
                  variant={selectedDevice.name === 'Desktop' ? "default" : "outline"}
                  size="sm"
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  Desktop
                </Button>
                <Button
                  onClick={() => handleDeviceChange('Tablet')}
                  variant={selectedDevice.name === 'Tablet' ? "default" : "outline"}
                  size="sm"
                >
                  <Tablet className="h-4 w-4 mr-2" />
                  Tablet
                </Button>
                <Button
                  onClick={() => handleDeviceChange('Mobile')}
                  variant={selectedDevice.name === 'Mobile' ? "default" : "outline"}
                  size="sm"
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  Mobile
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {enableZoom && (
                  <>
                    <Button
                      onClick={handleZoomOut}
                      variant="outline"
                      size="sm"
                      disabled={zoomLevel <= ZOOM_LEVELS[0]}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <Button
                      onClick={handleZoomIn}
                      variant="outline"
                      size="sm"
                      disabled={zoomLevel >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </>
                )}

                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="sm"
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Error Display */}
            {performanceMetrics.errorCount > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Found {performanceMetrics.errorCount} LaTeX error(s) in content. 
                  Check the LaTeX syntax and try again.
                </AlertDescription>
              </Alert>
            )}

            {/* Device Preview */}
            {mode === 'split' ? (
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium mb-2">Desktop Preview</h4>
                  {renderDevicePreview(DEVICE_CONFIGS[0])}
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Mobile Preview</h4>
                  {renderDevicePreview(DEVICE_CONFIGS[2])}
                </div>
              </div>
            ) : (
              <div>
                <h4 className="text-sm font-medium mb-2">
                  {selectedDevice.name} Preview
                </h4>
                {renderDevicePreview(selectedDevice)}
              </div>
            )}
          </TabsContent>

          {showPerformanceMetrics && (
            <TabsContent value="metrics" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">Performance Metrics</span>
                <Badge variant="outline" className="text-xs">
                  Last updated: {performanceMetrics.lastUpdate.toLocaleTimeString()}
                </Badge>
              </div>

              {renderPerformanceMetrics()}

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Content Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Content Size</span>
                      <span>{(performanceMetrics.contentSize / 1024).toFixed(1)} KB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>LaTeX Expressions</span>
                      <span>{performanceMetrics.latexCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Error Count</span>
                      <span className={performanceMetrics.errorCount > 0 ? 'text-red-600' : 'text-green-600'}>
                        {performanceMetrics.errorCount}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Performance Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-xs space-y-1">
                      {performanceMetrics.renderTime > 100 && (
                        <div className="text-yellow-600">• Consider reducing LaTeX complexity</div>
                      )}
                      {performanceMetrics.latexCount > 50 && (
                        <div className="text-yellow-600">• High LaTeX expression count</div>
                      )}
                      {performanceMetrics.errorCount > 0 && (
                        <div className="text-red-600">• Fix LaTeX syntax errors</div>
                      )}
                      {performanceMetrics.mobileScore >= 90 && performanceMetrics.desktopScore >= 90 && (
                        <div className="text-green-600">• Performance is excellent!</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          <TabsContent value="settings" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Preview Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Auto-refresh</label>
                    <p className="text-xs text-muted-foreground">
                      Automatically refresh preview when content changes
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Performance Monitoring</label>
                    <p className="text-xs text-muted-foreground">
                      Track rendering performance and optimization suggestions
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">LaTeX Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Safe Mode</label>
                    <p className="text-xs text-muted-foreground">
                      Enable error fallback for invalid LaTeX expressions
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mobile Optimization</label>
                    <p className="text-xs text-muted-foreground">
                      Optimize LaTeX rendering for mobile devices
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// ===== VARIANTS =====

/**
 * Compact LaTeX Preview
 * Phiên bản compact cho sidebar
 */
export function CompactLaTeXPreview(props: LaTeXPreviewProps) {
  return (
    <LaTeXPreview
      {...props}
      showPerformanceMetrics={false}
      enableZoom={false}
      className={cn("compact-latex-preview", props.className)}
    />
  );
}

/**
 * Split LaTeX Preview
 * Phiên bản split screen desktop/mobile
 */
export function SplitLaTeXPreview(props: LaTeXPreviewProps) {
  return (
    <LaTeXPreview
      {...props}
      mode="split"
      showPerformanceMetrics={true}
      className={cn("split-latex-preview", props.className)}
    />
  );
}
