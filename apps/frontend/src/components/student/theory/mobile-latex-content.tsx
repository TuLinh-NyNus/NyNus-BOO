/**
 * Mobile LaTeX Content Component
 * Component hiển thị LaTeX content được tối ưu cho mobile devices
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/display/card";
import { Button } from "@/components/ui/form/button";
import { Badge } from "@/components/ui/display/badge";
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Smartphone,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LaTeXContent, useLatexContent } from "@/components/latex";
import { usePerformanceOptimization } from '@/hooks';

// ===== TYPES =====

export interface MobilePerformanceMetrics {
  renderTime: number;
  latexCount: number;
  contentSize: number;
  mobileScore: number;
  touchResponseTime: number;
  memoryUsage: number;
  errorCount: number;
  lastUpdate: Date;
}

export interface TouchGesture {
  type: 'pinch' | 'pan' | 'tap' | 'double-tap';
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  scale: number;
  deltaX: number;
  deltaY: number;
}

export interface MobileLaTeXContentProps {
  /** LaTeX content để hiển thị */
  content: string;
  
  /** Enable mobile optimization */
  optimizeForMobile?: boolean;
  
  /** Enable touch zoom và pan */
  enableTouchZoom?: boolean;
  
  /** Show mobile performance stats */
  showMobileStats?: boolean;
  
  /** Maximum zoom level */
  maxZoom?: number;
  
  /** Minimum zoom level */
  minZoom?: number;
  
  /** Handler cho performance updates */
  onPerformanceUpdate?: (metrics: MobilePerformanceMetrics) => void;
  
  /** Handler cho touch gestures */
  onTouchGesture?: (gesture: TouchGesture) => void;
  
  /** Custom CSS classes */
  className?: string;
}

// ===== CONSTANTS =====

const DEFAULT_ZOOM = 1;
const DEFAULT_MAX_ZOOM = 3;
const DEFAULT_MIN_ZOOM = 0.5;
const ZOOM_STEP = 0.2;
const DOUBLE_TAP_DELAY = 300;

// ===== MAIN COMPONENT =====

export function MobileLaTeXContent({
  content,
  optimizeForMobile = true,
  enableTouchZoom = true,
  showMobileStats = false,
  maxZoom = DEFAULT_MAX_ZOOM,
  minZoom = DEFAULT_MIN_ZOOM,
  onPerformanceUpdate,
  onTouchGesture,
  className
}: MobileLaTeXContentProps) {
  
  // ===== STATE =====
  
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [mobileMetrics, setMobileMetrics] = useState<MobilePerformanceMetrics>({
    renderTime: 0,
    latexCount: 0,
    contentSize: 0,
    mobileScore: 0,
    touchResponseTime: 0,
    memoryUsage: 0,
    errorCount: 0,
    lastUpdate: new Date()
  });

  // ===== REFS =====
  
  const contentRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // ===== HOOKS =====

  const latexAnalysis = useLatexContent(content);
  const performance = usePerformanceOptimization({
    componentName: 'MobileLaTeXContent',
    enabled: true,
    warningThreshold: 200
  });

  // ===== HANDLERS =====

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(maxZoom, prev + ZOOM_STEP));
  }, [maxZoom]);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(minZoom, prev - ZOOM_STEP));
  }, [minZoom]);

  const handleResetZoom = useCallback(() => {
    setZoom(DEFAULT_ZOOM);
    setPanX(0);
    setPanY(0);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enableTouchZoom) return;

    const touch = e.touches[0];
    const now = Date.now();
    
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: now
    };

    // Detect double tap
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap to zoom
      if (zoom === DEFAULT_ZOOM) {
        setZoom(2);
      } else {
        handleResetZoom();
      }
    }
    
    lastTapRef.current = now;
  }, [enableTouchZoom, zoom, handleResetZoom]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!enableTouchZoom || !touchStartRef.current) return;

    e.preventDefault();
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    if (zoom > DEFAULT_ZOOM) {
      setIsPanning(true);
      setPanX(prev => prev + deltaX * 0.5);
      setPanY(prev => prev + deltaY * 0.5);
    }

    // Report touch gesture
    const gesture: TouchGesture = {
      type: 'pan',
      startX: touchStartRef.current.x,
      startY: touchStartRef.current.y,
      currentX: touch.clientX,
      currentY: touch.clientY,
      scale: zoom,
      deltaX,
      deltaY
    };
    
    onTouchGesture?.(gesture);
  }, [enableTouchZoom, zoom, onTouchGesture]);

  const handleTouchEnd = useCallback(() => {
    setIsPanning(false);
    touchStartRef.current = null;
  }, []);

  const updateMobileMetrics = useCallback(() => {
    performance.startMeasurement();
    
    const newMetrics: MobilePerformanceMetrics = {
      renderTime: performance.metrics.renderTime,
      latexCount: latexAnalysis.expressions.filter(e => e.type !== 'text').length,
      contentSize: content.length,
      mobileScore: Math.max(0, 100 - (performance.metrics.renderTime / 10)),
      touchResponseTime: performance.metrics.lastRenderTime,
      memoryUsage: 0, // Memory usage tracking not implemented yet
      errorCount: latexAnalysis.expressions.filter(e => e.isValid === false).length,
      lastUpdate: new Date()
    };
    
    setMobileMetrics(newMetrics);
    onPerformanceUpdate?.(newMetrics);
    
    performance.endMeasurement();
  }, [performance, latexAnalysis, content, onPerformanceUpdate]);

  // ===== EFFECTS =====

  useEffect(() => {
    updateMobileMetrics();
  }, [content, updateMobileMetrics]);

  useEffect(() => {
    // Auto-update metrics every 10 seconds
    const interval = setInterval(updateMobileMetrics, 10000);
    return () => clearInterval(interval);
  }, [updateMobileMetrics]);

  // ===== RENDER HELPERS =====

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTime = (ms: number) => {
    return `${ms.toFixed(1)}ms`;
  };

  // ===== RENDER =====

  return (
    <div className={cn("mobile-latex-content", className)}>
      {/* Mobile Controls */}
      {enableTouchZoom && (
        <Card className="mb-4">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Mobile Controls</span>
                <Badge variant="outline" className="text-xs">
                  {Math.round(zoom * 100)}%
                </Badge>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= minZoom}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetZoom}
                  disabled={zoom === DEFAULT_ZOOM && panX === 0 && panY === 0}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= maxZoom}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {mobileMetrics.errorCount > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Phát hiện {mobileMetrics.errorCount} lỗi LaTeX. 
            Một số công thức có thể không hiển thị đúng trên mobile.
          </AlertDescription>
        </Alert>
      )}

      {/* LaTeX Content */}
      <Card>
        <CardContent className="p-0">
          <div
            ref={contentRef}
            className={cn(
              "mobile-latex-container overflow-hidden touch-pan-y",
              {
                "cursor-grab": enableTouchZoom && !isPanning,
                "cursor-grabbing": enableTouchZoom && isPanning
              }
            )}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              transform: `scale(${zoom}) translate(${panX}px, ${panY}px)`,
              transformOrigin: 'center center',
              transition: isPanning ? 'none' : 'transform 0.2s ease-out'
            }}
          >
            <div className="p-6">
              <LaTeXContent
                content={content}
                safeMode={true}
                showStats={false}
                options={{
                  displayMode: false,
                  throwOnError: false,
                  // Mobile-specific options
                  trust: false,
                  strict: false
                }}
                onError={(errors) => {
                  console.warn('Mobile LaTeX errors:', errors);
                }}
                className={cn(
                  "mobile-latex-content",
                  "prose prose-sm max-w-none",
                  {
                    "mobile-optimized": optimizeForMobile
                  }
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Performance Stats */}
      {showMobileStats && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Mobile Performance</span>
              <Badge variant="outline" className="text-xs">
                Last updated: {mobileMetrics.lastUpdate.toLocaleTimeString()}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className={`text-lg font-bold ${getScoreColor(mobileMetrics.mobileScore)}`}>
                  {mobileMetrics.mobileScore}
                </div>
                <div className="text-xs text-muted-foreground">Mobile Score</div>
              </div>

              <div className="text-center">
                <div className="text-lg font-bold">{formatTime(mobileMetrics.renderTime)}</div>
                <div className="text-xs text-muted-foreground">Render Time</div>
              </div>

              <div className="text-center">
                <div className="text-lg font-bold">{mobileMetrics.latexCount}</div>
                <div className="text-xs text-muted-foreground">LaTeX Count</div>
              </div>

              <div className="text-center">
                <div className="text-lg font-bold">{formatTime(mobileMetrics.touchResponseTime)}</div>
                <div className="text-xs text-muted-foreground">Touch Response</div>
              </div>
            </div>

            {/* Performance Tips */}
            <div className="mt-3 pt-3 border-t">
              <div className="text-xs space-y-1">
                {mobileMetrics.renderTime > 500 && (
                  <div className="text-yellow-600">• LaTeX rendering chậm trên mobile</div>
                )}
                {mobileMetrics.latexCount > 20 && (
                  <div className="text-yellow-600">• Quá nhiều công thức LaTeX</div>
                )}
                {mobileMetrics.errorCount > 0 && (
                  <div className="text-red-600">• Có lỗi LaTeX cần sửa</div>
                )}
                {mobileMetrics.mobileScore >= 90 && mobileMetrics.errorCount === 0 && (
                  <div className="text-green-600">• Performance mobile tuyệt vời!</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Touch Instructions */}
      {enableTouchZoom && (
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            💡 Chạm đôi để zoom, kéo để di chuyển khi đã zoom
          </p>
        </div>
      )}
    </div>
  );
}

// ===== VARIANTS =====

/**
 * Compact Mobile LaTeX Content
 * Phiên bản compact cho preview
 */
export function CompactMobileLaTeXContent(props: MobileLaTeXContentProps) {
  return (
    <MobileLaTeXContent
      {...props}
      enableTouchZoom={false}
      showMobileStats={false}
      className={cn("compact-mobile-latex", props.className)}
    />
  );
}

/**
 * Full Mobile LaTeX Content
 * Phiên bản đầy đủ với tất cả features
 */
export function FullMobileLaTeXContent(props: MobileLaTeXContentProps) {
  return (
    <MobileLaTeXContent
      {...props}
      optimizeForMobile={true}
      enableTouchZoom={true}
      showMobileStats={true}
      className={cn("full-mobile-latex", props.className)}
    />
  );
}
