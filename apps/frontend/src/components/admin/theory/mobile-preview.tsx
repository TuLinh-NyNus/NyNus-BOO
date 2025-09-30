/**
 * Mobile Preview Panel Component
 * Component preview nội dung theory trên mobile/tablet/desktop với performance testing
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Button } from "@/components/ui/form/button";
import { Badge } from "@/components/ui/display/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/form/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/navigation/tabs";
import {
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw,
  Clock,
  TrendingUp,
  Share,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LaTeXContent } from "@/components/common/latex";

// ===== TYPES =====

export interface PreviewContent {
  id: string;
  title: string;
  subject: string;
  grade: string;
  chapter: string;
  content: string;
  lastModified: Date;
}

export interface DevicePreview {
  name: string;
  width: number;
  height: number;
  scale: number;
  icon: React.ComponentType<{ className?: string }>;
}

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  latexRenderTime: number;
  mobileScore: number;
  desktopScore: number;
  accessibility: number;
  seo: number;
}

export interface MobilePreviewPanelProps {
  /** Content để preview */
  content: PreviewContent;
  
  /** Device hiện tại được chọn */
  selectedDevice: DevicePreview;
  
  /** Handler để thay đổi device */
  onDeviceChange: (device: DevicePreview) => void;
  
  /** Performance metrics */
  performanceMetrics: PerformanceMetrics;
  
  /** Handler để refresh metrics */
  onRefreshMetrics: () => Promise<void>;
  
  /** Available devices */
  devices?: DevicePreview[];
  
  /** Show performance tab */
  showPerformanceTab?: boolean;
  
  /** Show settings tab */
  showSettingsTab?: boolean;
  
  /** Loading state cho metrics refresh */
  isRefreshing?: boolean;
  
  /** Custom CSS classes */
  className?: string;
}

// ===== CONSTANTS =====

const DEFAULT_DEVICES: DevicePreview[] = [
  { name: 'Desktop', width: 1200, height: 800, scale: 0.5, icon: Monitor },
  { name: 'Tablet', width: 768, height: 1024, scale: 0.6, icon: Tablet },
  { name: 'Mobile', width: 375, height: 667, scale: 0.8, icon: Smartphone }
];

// ===== MAIN COMPONENT =====

export function MobilePreviewPanel({
  content,
  selectedDevice,
  onDeviceChange,
  performanceMetrics,
  onRefreshMetrics,
  devices = DEFAULT_DEVICES,
  showPerformanceTab = true,
  showSettingsTab = true,
  isRefreshing = false,
  className
}: MobilePreviewPanelProps) {
  
  // ===== STATE =====
  
  const [previewMode, setPreviewMode] = useState<'normal' | 'touch' | 'performance'>('normal');

  // ===== HANDLERS =====

  const handleDeviceSelect = (deviceName: string) => {
    const device = devices.find(d => d.name === deviceName);
    if (device) {
      onDeviceChange(device);
    }
  };

  // ===== RENDER HELPERS =====

  const formatTime = (seconds: number) => {
    return `${seconds.toFixed(1)}s`;
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

  // ===== RENDER =====

  return (
    <Card className={cn("mobile-preview-panel", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <selectedDevice.icon className="h-5 w-5" />
          Mobile Preview Panel
        </CardTitle>
        <CardDescription>
          Preview nội dung theory trên các devices với performance testing
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="preview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="preview">Device Preview</TabsTrigger>
            {showPerformanceTab && (
              <TabsTrigger value="performance">Performance</TabsTrigger>
            )}
            {showSettingsTab && (
              <TabsTrigger value="settings">Settings</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="preview" className="space-y-4">
            {/* Content Info */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{content.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{content.subject}</Badge>
                  <Badge variant="outline">{content.grade}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {content.chapter}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Select value={selectedDevice.name} onValueChange={handleDeviceSelect}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {devices.map((device) => (
                      <SelectItem key={device.name} value={device.name}>
                        <div className="flex items-center gap-2">
                          <device.icon className="h-4 w-4" />
                          {device.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={onRefreshMetrics}
                  variant="outline"
                  size="sm"
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Device Preview */}
            <div className="flex justify-center p-4 bg-muted/30 rounded-lg">
              <div
                className={`
                  bg-white border-2 border-gray-300 rounded-lg shadow-lg overflow-hidden
                  ${previewMode === 'touch' ? 'cursor-pointer' : ''}
                `}
                style={{
                  width: selectedDevice.width * selectedDevice.scale,
                  height: selectedDevice.height * selectedDevice.scale,
                  transform: `scale(${selectedDevice.scale})`
                }}
              >
                <div className="h-full overflow-y-auto p-4">
                  <div className="prose prose-sm max-w-none">
                    <LaTeXContent
                      content={content.content}
                      safeMode={true}
                      showStats={false}
                      className="theory-preview-content"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Device Controls */}
            <div className="flex justify-center gap-2">
              {devices.map((device) => (
                <Button
                  key={device.name}
                  variant={selectedDevice.name === device.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => onDeviceChange(device)}
                >
                  <device.icon className="h-4 w-4 mr-2" />
                  {device.name}
                </Button>
              ))}
            </div>

            {/* Preview Mode Controls */}
            <div className="flex justify-center gap-2">
              <Button
                variant={previewMode === 'normal' ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewMode('normal')}
              >
                Normal
              </Button>
              <Button
                variant={previewMode === 'touch' ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewMode('touch')}
              >
                Touch Mode
              </Button>
              <Button
                variant={previewMode === 'performance' ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewMode('performance')}
              >
                Performance
              </Button>
            </div>
          </TabsContent>

          {showPerformanceTab && (
            <TabsContent value="performance" className="space-y-4">
              {/* Performance Scores */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(performanceMetrics.accessibility)}`}>
                      {performanceMetrics.accessibility}
                    </div>
                    <p className="text-xs text-muted-foreground">Accessibility</p>
                    <Badge variant={getScoreBadge(performanceMetrics.accessibility)} className="mt-1 text-xs">
                      {performanceMetrics.accessibility >= 90 ? 'Excellent' : 
                       performanceMetrics.accessibility >= 70 ? 'Good' : 'Needs Work'}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(performanceMetrics.seo)}`}>
                      {performanceMetrics.seo}
                    </div>
                    <p className="text-xs text-muted-foreground">SEO Score</p>
                    <Badge variant={getScoreBadge(performanceMetrics.seo)} className="mt-1 text-xs">
                      {performanceMetrics.seo >= 90 ? 'Excellent' : 
                       performanceMetrics.seo >= 70 ? 'Good' : 'Needs Work'}
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              {/* Timing Metrics */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Load Times
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Load Time</span>
                      <span className="font-medium">{formatTime(performanceMetrics.loadTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Content Render</span>
                      <span className="font-medium">{formatTime(performanceMetrics.renderTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">LaTeX Processing</span>
                      <span className="font-medium">{formatTime(performanceMetrics.latexRenderTime)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Performance Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-xs space-y-1">
                      {performanceMetrics.mobileScore < 90 && (
                        <div className="text-yellow-600">• Optimize LaTeX for mobile</div>
                      )}
                      {performanceMetrics.loadTime > 2 && (
                        <div className="text-yellow-600">• Reduce content size</div>
                      )}
                      {performanceMetrics.accessibility < 90 && (
                        <div className="text-yellow-600">• Improve accessibility</div>
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

          {showSettingsTab && (
            <TabsContent value="settings" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Preview Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Auto-refresh Metrics</label>
                      <p className="text-xs text-muted-foreground">
                        Automatically refresh performance metrics every 30 seconds
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Touch Simulation</label>
                      <p className="text-xs text-muted-foreground">
                        Simulate touch interactions on mobile preview
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Export Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share className="h-4 w-4 mr-2" />
                        Share Preview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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
 * Compact Mobile Preview
 * Phiên bản compact cho dashboard
 */
export function CompactMobilePreviewPanel(props: MobilePreviewPanelProps) {
  return (
    <MobilePreviewPanel
      {...props}
      showPerformanceTab={false}
      showSettingsTab={false}
      className={cn("compact-mobile-preview", props.className)}
    />
  );
}
