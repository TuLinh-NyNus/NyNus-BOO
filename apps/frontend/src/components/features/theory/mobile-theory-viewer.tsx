/**
 * Mobile Theory Viewer Component
 * Component xem nội dung lý thuyết được tối ưu cho mobile devices
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Button } from "@/components/ui/form/button";
import { Badge } from "@/components/ui/display/badge";
import {
  Smartphone,
  Monitor,
  Tablet,
  RefreshCw,
  TrendingUp,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LaTeXContent } from "@/components/common/latex";
import { usePerformanceOptimization } from '@/hooks';

// ===== TYPES =====

export interface TheoryContent {
  id: string;
  title: string;
  content: string;
  subject: string;
  grade: string;
  chapter: string;
  estimatedReadTime: number;
  lastModified: Date;
}

export interface LoadMetrics {
  loadTime: number;
  renderTime: number;
  contentSize: number;
  mobileScore: number;
  preRenderingEnabled: boolean;
  cacheHit: boolean;
  lastUpdate: Date;
}

export interface MobileTheoryViewerProps {
  /** Nội dung lý thuyết để hiển thị */
  content: TheoryContent;
  
  /** Enable pre-rendering optimization */
  enablePreRendering?: boolean;
  
  /** Show mobile performance stats */
  showMobileStats?: boolean;
  
  /** Enable content caching */
  enableCaching?: boolean;
  
  /** Handler cho content load metrics */
  onContentLoad?: (metrics: LoadMetrics) => void;
  
  /** Handler cho performance updates */
  onPerformanceUpdate?: (metrics: LoadMetrics) => void;
  
  /** Custom CSS classes */
  className?: string;
}

// ===== CONSTANTS =====

const MOBILE_BREAKPOINTS = {
  mobile: 375,
  tablet: 768,
  desktop: 1024
};

const PERFORMANCE_THRESHOLDS = {
  excellent: 90,
  good: 70,
  needsWork: 50
};

// ===== MAIN COMPONENT =====

export function MobileTheoryViewer({
  content,
  enablePreRendering = true,
  showMobileStats = false,
  enableCaching = true,
  onContentLoad,
  onPerformanceUpdate,
  className
}: MobileTheoryViewerProps) {
  
  // ===== STATE =====
  
  const [isLoading, setIsLoading] = useState(true);
  const [isPreRendering, setIsPreRendering] = useState(false);
  const [loadMetrics, setLoadMetrics] = useState<LoadMetrics>({
    loadTime: 0,
    renderTime: 0,
    contentSize: 0,
    mobileScore: 0,
    preRenderingEnabled: enablePreRendering,
    cacheHit: false,
    lastUpdate: new Date()
  });
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [cachedContent, setCachedContent] = useState<string>('');

  // ===== REFS =====
  
  const contentRef = useRef<HTMLDivElement>(null);
  const loadStartTime = useRef<number>(0);

  // ===== HOOKS =====

  const performance = usePerformanceOptimization({
    componentName: 'MobileTheoryViewer',
    enabled: true,
    warningThreshold: 200
  });

  // ===== HANDLERS =====

  const detectDeviceType = useCallback(() => {
    if (typeof window === 'undefined') return 'mobile';
    
    const width = window.innerWidth;
    if (width < MOBILE_BREAKPOINTS.tablet) return 'mobile';
    if (width < MOBILE_BREAKPOINTS.desktop) return 'tablet';
    return 'desktop';
  }, []);

  const calculateMobileScore = useCallback((loadTime: number, renderTime: number, contentSize: number): number => {
    let score = 100;

    // Deduct points for slow loading
    if (loadTime > 1000) score -= 20;
    else if (loadTime > 500) score -= 10;

    // Deduct points for slow rendering
    if (renderTime > 200) score -= 15;
    else if (renderTime > 100) score -= 5;

    // Deduct points for large content
    if (contentSize > 100000) score -= 10;
    else if (contentSize > 50000) score -= 5;

    return Math.max(0, score);
  }, []);

  const preRenderContent = useCallback(async (contentToRender: string): Promise<string> => {
    if (!enablePreRendering) return contentToRender;

    setIsPreRendering(true);
    performance.startMeasurement();

    try {
      // Simulate pre-rendering optimization
      // Trong thực tế, đây sẽ là quá trình optimize LaTeX, images, etc.
      await new Promise(resolve => setTimeout(resolve, 100));

      // Add mobile-optimized classes và structure
      const optimizedContent = `
        <div class="mobile-optimized-content">
          <div class="content-wrapper">
            ${contentToRender}
          </div>
        </div>
      `;

      performance.endMeasurement();
      return optimizedContent;
    } catch (error) {
      console.error('Pre-rendering failed:', error);
      return contentToRender;
    } finally {
      setIsPreRendering(false);
    }
  }, [enablePreRendering, performance]);

  const loadContent = useCallback(async () => {
    loadStartTime.current = Date.now();
    setIsLoading(true);
    performance.startMeasurement();

    try {
      let contentToLoad = content.content;
      let cacheHit = false;

      // Check cache first
      if (enableCaching && cachedContent) {
        contentToLoad = cachedContent;
        cacheHit = true;
      } else {
        // Pre-render content if enabled
        contentToLoad = await preRenderContent(content.content);
        
        // Cache the processed content
        if (enableCaching) {
          setCachedContent(contentToLoad);
        }
      }

      const loadTime = Date.now() - loadStartTime.current;
      const renderTime = performance.metrics.renderTime;
      const contentSize = content.content.length;
      const mobileScore = calculateMobileScore(loadTime, renderTime, contentSize);

      const metrics: LoadMetrics = {
        loadTime,
        renderTime,
        contentSize,
        mobileScore,
        preRenderingEnabled: enablePreRendering,
        cacheHit,
        lastUpdate: new Date()
      };

      setLoadMetrics(metrics);
      onContentLoad?.(metrics);
      onPerformanceUpdate?.(metrics);

      performance.endMeasurement();
    } catch (error) {
      console.error('Content loading failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [content, enableCaching, cachedContent, preRenderContent, performance, onContentLoad, onPerformanceUpdate, enablePreRendering, calculateMobileScore]);



  const handleRefresh = useCallback(() => {
    setCachedContent(''); // Clear cache
    loadContent();
  }, [loadContent]);

  // ===== EFFECTS =====

  useEffect(() => {
    setDeviceType(detectDeviceType());
    
    const handleResize = () => {
      setDeviceType(detectDeviceType());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [detectDeviceType]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  // ===== RENDER HELPERS =====

  const getScoreColor = (score: number) => {
    if (score >= PERFORMANCE_THRESHOLDS.excellent) return 'text-green-600';
    if (score >= PERFORMANCE_THRESHOLDS.good) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= PERFORMANCE_THRESHOLDS.excellent) return 'default';
    if (score >= PERFORMANCE_THRESHOLDS.good) return 'secondary';
    return 'destructive';
  };

  const getDeviceIcon = () => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      case 'desktop': return <Monitor className="h-4 w-4" />;
    }
  };

  const formatTime = (ms: number) => `${ms.toFixed(0)}ms`;
  const formatSize = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`;

  // ===== RENDER =====

  return (
    <div className={cn("mobile-theory-viewer", className)}>
      {/* Header với device info */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getDeviceIcon()}
              <div>
                <CardTitle className="text-lg">{content.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{content.subject}</Badge>
                  <Badge variant="outline">{content.grade}</Badge>
                  <Badge variant="outline" className="capitalize">{deviceType}</Badge>
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {loadMetrics.cacheHit && (
                <Badge variant="secondary" className="text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  Cached
                </Badge>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Mobile Performance Stats */}
      {showMobileStats && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Mobile Performance</span>
              <Badge variant="outline" className="text-xs">
                {loadMetrics.lastUpdate.toLocaleTimeString()}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className={`text-lg font-bold ${getScoreColor(loadMetrics.mobileScore)}`}>
                  {loadMetrics.mobileScore}
                </div>
                <div className="text-xs text-muted-foreground">Mobile Score</div>
                <Badge variant={getScoreBadge(loadMetrics.mobileScore)} className="mt-1 text-xs">
                  {loadMetrics.mobileScore >= PERFORMANCE_THRESHOLDS.excellent ? 'Excellent' : 
                   loadMetrics.mobileScore >= PERFORMANCE_THRESHOLDS.good ? 'Good' : 'Needs Work'}
                </Badge>
              </div>

              <div className="text-center">
                <div className="text-lg font-bold">{formatTime(loadMetrics.loadTime)}</div>
                <div className="text-xs text-muted-foreground">Load Time</div>
              </div>

              <div className="text-center">
                <div className="text-lg font-bold">{formatTime(loadMetrics.renderTime)}</div>
                <div className="text-xs text-muted-foreground">Render Time</div>
              </div>

              <div className="text-center">
                <div className="text-lg font-bold">{formatSize(loadMetrics.contentSize)}</div>
                <div className="text-xs text-muted-foreground">Content Size</div>
              </div>
            </div>

            {/* Performance Tips */}
            <div className="mt-3 pt-3 border-t">
              <div className="text-xs space-y-1">
                {loadMetrics.loadTime > 1000 && (
                  <div className="text-yellow-600">• Content loading chậm trên mobile</div>
                )}
                {loadMetrics.renderTime > 200 && (
                  <div className="text-yellow-600">• LaTeX rendering cần tối ưu</div>
                )}
                {loadMetrics.contentSize > 100000 && (
                  <div className="text-yellow-600">• Content size lớn, cần compression</div>
                )}
                {loadMetrics.mobileScore >= PERFORMANCE_THRESHOLDS.excellent && (
                  <div className="text-green-600">• Performance mobile tuyệt vời!</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Display */}
      <Card>
        <CardContent className="p-0">
          {isLoading || isPreRendering ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">
                  {isPreRendering ? 'Đang tối ưu cho mobile...' : 'Đang tải nội dung...'}
                </p>
              </div>
            </div>
          ) : (
            <div ref={contentRef} className="p-6">
              <div className="prose prose-sm max-w-none mobile-optimized">
                <LaTeXContent
                  content={cachedContent || content.content}
                  safeMode={true}
                  showStats={false}
                  options={{
                    displayMode: false,
                    throwOnError: false,
                    trust: false,
                    strict: false
                  }}
                  className={cn(
                    "mobile-theory-content",
                    {
                      "mobile-device": deviceType === 'mobile',
                      "tablet-device": deviceType === 'tablet',
                      "desktop-device": deviceType === 'desktop'
                    }
                  )}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile Instructions */}
      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground">
          💡 Được tối ưu cho {deviceType === 'mobile' ? 'điện thoại' : deviceType === 'tablet' ? 'máy tính bảng' : 'máy tính'}
        </p>
      </div>
    </div>
  );
}

// ===== VARIANTS =====

/**
 * Compact Mobile Theory Viewer
 * Phiên bản compact cho preview
 */
export function CompactMobileTheoryViewer(props: MobileTheoryViewerProps) {
  return (
    <MobileTheoryViewer
      {...props}
      showMobileStats={false}
      enableCaching={false}
      className={cn("compact-mobile-theory", props.className)}
    />
  );
}

/**
 * Full Mobile Theory Viewer
 * Phiên bản đầy đủ với tất cả features
 */
export function FullMobileTheoryViewer(props: MobileTheoryViewerProps) {
  return (
    <MobileTheoryViewer
      {...props}
      enablePreRendering={true}
      showMobileStats={true}
      enableCaching={true}
      className={cn("full-mobile-theory", props.className)}
    />
  );
}
