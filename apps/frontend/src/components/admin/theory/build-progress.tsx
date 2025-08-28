/**
 * Build Progress Tracker Component
 * Component theo dõi chi tiết progress của build process với real-time updates
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Button } from "@/components/ui/form/button";
import { Badge } from "@/components/ui/display/badge";
import { Progress } from "@/components/ui/display/progress";
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/navigation/tabs";
import {
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BuildStatus } from "./theory-build-manager";

// ===== TYPES =====

export interface BuildStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  details?: string;
  filesProcessed?: number;
  totalFiles?: number;
}

export interface PerformanceMetrics {
  buildTime: number;
  filesPerSecond: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  networkUsage: number;
}

export interface BuildProgressTrackerProps {
  /** Current build status */
  buildStatus: BuildStatus;
  
  /** Detailed build steps */
  buildSteps?: BuildStep[];
  
  /** Performance metrics */
  performanceMetrics?: PerformanceMetrics;
  
  /** Show detailed progress breakdown */
  showDetailedProgress?: boolean;
  
  /** Show performance metrics tab */
  showPerformanceMetrics?: boolean;
  
  /** Handler để view build logs */
  onViewLogs?: () => void;
  
  /** Handler để download build report */
  onDownloadReport?: () => void;
  
  /** Custom CSS classes */
  className?: string;
}

// ===== MOCK DATA =====

const mockBuildSteps: BuildStep[] = [
  {
    id: '1',
    name: 'Scanning content files',
    status: 'completed',
    progress: 100,
    startTime: new Date(Date.now() - 5000),
    endTime: new Date(Date.now() - 4000),
    duration: 1000,
    filesProcessed: 156,
    totalFiles: 156,
    details: 'Scanned all markdown files in content directory'
  },
  {
    id: '2',
    name: 'Validating LaTeX expressions',
    status: 'completed',
    progress: 100,
    startTime: new Date(Date.now() - 4000),
    endTime: new Date(Date.now() - 2000),
    duration: 2000,
    filesProcessed: 156,
    totalFiles: 156,
    details: 'Validated 1,247 LaTeX expressions'
  },
  {
    id: '3',
    name: 'Optimizing for mobile',
    status: 'running',
    progress: 65,
    startTime: new Date(Date.now() - 2000),
    filesProcessed: 101,
    totalFiles: 156,
    details: 'Optimizing LaTeX rendering for mobile devices'
  },
  {
    id: '4',
    name: 'Generating search index',
    status: 'pending',
    progress: 0,
    totalFiles: 156,
    details: 'Will generate searchable index for theory content'
  },
  {
    id: '5',
    name: 'Building static pages',
    status: 'pending',
    progress: 0,
    totalFiles: 156,
    details: 'Pre-render theory pages for optimal performance'
  }
];

const mockPerformanceMetrics: PerformanceMetrics = {
  buildTime: 45.2,
  filesPerSecond: 3.4,
  memoryUsage: 245,
  cpuUsage: 67,
  diskUsage: 1.2,
  networkUsage: 0.8
};

// ===== MAIN COMPONENT =====

export function BuildProgressTracker({
  buildStatus: _buildStatus,
  buildSteps = mockBuildSteps,
  performanceMetrics = mockPerformanceMetrics,
  showDetailedProgress = true,
  showPerformanceMetrics = true,
  onViewLogs,
  onDownloadReport,
  className
}: BuildProgressTrackerProps) {
  
  // ===== STATE =====
  
  const [selectedStep, setSelectedStep] = useState<string | null>(null);

  // ===== COMPUTED VALUES =====
  
  const completedSteps = buildSteps.filter(step => step.status === 'completed').length;
  const totalSteps = buildSteps.length;
  const currentStep = buildSteps.find(step => step.status === 'running');
  
  // ===== RENDER HELPERS =====

  const getStepIcon = (status: BuildStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStepBadge = (status: BuildStep['status']) => {
    const variants = {
      completed: 'default',
      running: 'default',
      failed: 'destructive',
      pending: 'secondary'
    } as const;

    const labels = {
      completed: 'Completed',
      running: 'Running',
      failed: 'Failed',
      pending: 'Pending'
    };

    return (
      <Badge variant={variants[status]} className="text-xs">
        {labels[status]}
      </Badge>
    );
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    return `${seconds}s`;
  };

  const formatFileSize = (mb: number) => {
    return `${mb.toFixed(1)} MB`;
  };

  // ===== RENDER =====

  return (
    <Card className={cn("build-progress-tracker", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Build Progress
        </CardTitle>
        <CardDescription>
          Chi tiết progress và performance metrics của build process
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="progress" className="space-y-4">
          <TabsList>
            <TabsTrigger value="progress">Progress Details</TabsTrigger>
            {showPerformanceMetrics && (
              <TabsTrigger value="metrics">Performance</TabsTrigger>
            )}
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-4">
            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Overall Progress</span>
                <span>{completedSteps}/{totalSteps} steps completed</span>
              </div>
              <Progress value={(completedSteps / totalSteps) * 100} className="h-2" />
            </div>

            {/* Current Step Highlight */}
            {currentStep && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <strong>Currently running:</strong> {currentStep.name}
                    </div>
                    <Badge variant="default" className="text-xs">
                      {currentStep.progress}%
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <Progress value={currentStep.progress} className="h-1" />
                  </div>
                  {currentStep.details && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {currentStep.details}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Detailed Steps */}
            {showDetailedProgress && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Build Steps</h4>
                <div className="space-y-2">
                  {buildSteps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`
                        flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors
                        ${selectedStep === step.id ? 'bg-muted/50' : 'hover:bg-muted/30'}
                      `}
                      onClick={() => setSelectedStep(selectedStep === step.id ? null : step.id)}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {getStepIcon(step.status)}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">
                              {index + 1}. {step.name}
                            </span>
                            {getStepBadge(step.status)}
                          </div>
                          
                          {step.status === 'running' && (
                            <div className="mt-1">
                              <Progress value={step.progress} className="h-1" />
                            </div>
                          )}
                          
                          {selectedStep === step.id && step.details && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {step.details}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground text-right">
                        {step.filesProcessed && step.totalFiles && (
                          <div>{step.filesProcessed}/{step.totalFiles} files</div>
                        )}
                        {step.duration && (
                          <div>{formatDuration(step.duration)}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {showPerformanceMetrics && (
            <TabsContent value="metrics" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Build Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Build Time</span>
                      <span className="font-medium">{performanceMetrics.buildTime}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Files/Second</span>
                      <span className="font-medium">{performanceMetrics.filesPerSecond}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">System Resources</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Memory Usage</span>
                      <span className="font-medium">{formatFileSize(performanceMetrics.memoryUsage)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">CPU Usage</span>
                      <span className="font-medium">{performanceMetrics.cpuUsage}%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Disk I/O</span>
                    <span>{formatFileSize(performanceMetrics.diskUsage)}/s</span>
                  </div>
                  <Progress value={Math.min(performanceMetrics.diskUsage * 10, 100)} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Network I/O</span>
                    <span>{formatFileSize(performanceMetrics.networkUsage)}/s</span>
                  </div>
                  <Progress value={Math.min(performanceMetrics.networkUsage * 20, 100)} className="h-2" />
                </div>
              </div>
            </TabsContent>
          )}

          <TabsContent value="logs" className="space-y-4">
            <div className="flex gap-2">
              {onViewLogs && (
                <Button onClick={onViewLogs} variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Full Logs
                </Button>
              )}
              
              {onDownloadReport && (
                <Button onClick={onDownloadReport} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              )}
            </div>

            <div className="bg-muted/30 rounded-lg p-4 font-mono text-xs space-y-1 max-h-64 overflow-y-auto">
              <div className="text-green-600">[INFO] Build started at {new Date().toISOString()}</div>
              <div className="text-blue-600">[INFO] Scanning content directory...</div>
              <div className="text-green-600">[INFO] Found 156 markdown files</div>
              <div className="text-blue-600">[INFO] Validating LaTeX expressions...</div>
              <div className="text-green-600">[INFO] Validated 1,247 LaTeX expressions</div>
              <div className="text-yellow-600">[WARN] 3 files have optimization opportunities</div>
              <div className="text-blue-600">[INFO] Optimizing for mobile devices...</div>
              <div className="text-blue-600">[INFO] Processing file: bài-1-hàm-số.md</div>
              <div className="text-blue-600">[INFO] Processing file: bài-2-đạo-hàm.md</div>
              <div className="text-muted-foreground">...</div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// ===== VARIANTS =====

/**
 * Compact Progress Tracker
 * Phiên bản compact cho dashboard
 */
export function CompactBuildProgressTracker(props: BuildProgressTrackerProps) {
  return (
    <BuildProgressTracker
      {...props}
      showDetailedProgress={false}
      showPerformanceMetrics={false}
      className={cn("compact-progress-tracker", props.className)}
    />
  );
}
