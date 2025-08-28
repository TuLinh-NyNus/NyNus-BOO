/**
 * Theory Build Manager Component
 * Component quản lý build process cho theory content với controls và monitoring
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Button } from "@/components/ui/form/button";
import { Progress } from "@/components/ui/display/progress";
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import {
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

// ===== TYPES =====

export interface BuildStatus {
  isBuilding: boolean;
  progress: number;
  currentStep: string;
  totalFiles: number;
  processedFiles: number;
  errors: string[];
  warnings: string[];
  startTime?: Date;
  estimatedCompletion?: Date;
  lastBuildTime?: Date;
}

export interface TheoryBuildManagerProps {
  /** Current build status */
  buildStatus: BuildStatus;
  
  /** Handler để start build process */
  onStartBuild: () => Promise<void>;
  
  /** Handler để stop build process */
  onStopBuild: () => Promise<void>;
  
  /** Handler để refresh build status */
  onRefreshStatus: () => Promise<void>;
  
  /** Loading state cho refresh action */
  isRefreshing?: boolean;
  
  /** Show advanced build options */
  showAdvancedOptions?: boolean;
  
  /** Custom CSS classes */
  className?: string;
}

// ===== MAIN COMPONENT =====

export function TheoryBuildManager({
  buildStatus,
  onStartBuild,
  onStopBuild,
  onRefreshStatus,
  isRefreshing = false,
  showAdvancedOptions = false,
  className
}: TheoryBuildManagerProps) {
  
  // ===== COMPUTED VALUES =====
  
  const buildDuration = buildStatus.startTime 
    ? Math.floor((Date.now() - buildStatus.startTime.getTime()) / 1000)
    : 0;
    
  const estimatedTimeRemaining = buildStatus.progress > 0 && buildStatus.isBuilding
    ? Math.floor((buildDuration / buildStatus.progress) * (100 - buildStatus.progress))
    : 0;

  // ===== RENDER HELPERS =====

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBuildStatusIcon = () => {
    if (buildStatus.isBuilding) {
      return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
    }
    if (buildStatus.errors.length > 0) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getBuildStatusText = () => {
    if (buildStatus.isBuilding) {
      return 'Building...';
    }
    if (buildStatus.errors.length > 0) {
      return 'Build Failed';
    }
    return 'Ready';
  };

  const getBuildStatusColor = () => {
    if (buildStatus.isBuilding) return 'text-blue-600';
    if (buildStatus.errors.length > 0) return 'text-red-600';
    return 'text-green-600';
  };

  // ===== RENDER =====

  return (
    <Card className={cn("theory-build-manager", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Build Management
        </CardTitle>
        <CardDescription>
          Quản lý build process và monitor trạng thái theory content
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Build Controls */}
        <div className="flex flex-wrap gap-2">
          {!buildStatus.isBuilding ? (
            <Button onClick={onStartBuild} size="sm" className="min-w-[100px]">
              <Play className="h-4 w-4 mr-2" />
              Start Build
            </Button>
          ) : (
            <Button onClick={onStopBuild} variant="destructive" size="sm" className="min-w-[100px]">
              <Pause className="h-4 w-4 mr-2" />
              Stop Build
            </Button>
          )}
          
          <Button
            onClick={onRefreshStatus}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {showAdvancedOptions && (
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Options
            </Button>
          )}
        </div>

        {/* Build Status */}
        <div className="space-y-3">
          {/* Status Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getBuildStatusIcon()}
              <span className={`font-medium ${getBuildStatusColor()}`}>
                {getBuildStatusText()}
              </span>
            </div>
            
            {buildStatus.isBuilding && (
              <div className="text-sm text-muted-foreground">
                {formatDuration(buildDuration)} elapsed
                {estimatedTimeRemaining > 0 && (
                  <span className="ml-2">
                    (~{formatDuration(estimatedTimeRemaining)} remaining)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Current Step */}
          <div className="text-sm text-muted-foreground">
            {buildStatus.currentStep}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{buildStatus.processedFiles}/{buildStatus.totalFiles} files</span>
            </div>
            <Progress value={buildStatus.progress} className="h-2" />
            <div className="text-xs text-muted-foreground text-right">
              {buildStatus.progress}% complete
            </div>
          </div>
        </div>

        {/* Build Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="text-center">
            <div className="text-lg font-bold">{buildStatus.totalFiles}</div>
            <div className="text-xs text-muted-foreground">Total Files</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{buildStatus.processedFiles}</div>
            <div className="text-xs text-muted-foreground">Processed</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{buildStatus.errors.length}</div>
            <div className="text-xs text-muted-foreground">Errors</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-600">{buildStatus.warnings.length}</div>
            <div className="text-xs text-muted-foreground">Warnings</div>
          </div>
        </div>

        {/* Error Display */}
        {buildStatus.errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Build Errors ({buildStatus.errors.length}):</strong>
              <ul className="mt-1 list-disc list-inside">
                {buildStatus.errors.slice(0, 3).map((error, index) => (
                  <li key={index} className="text-xs">{error}</li>
                ))}
                {buildStatus.errors.length > 3 && (
                  <li className="text-xs">...and {buildStatus.errors.length - 3} more errors</li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Warning Display */}
        {buildStatus.warnings.length > 0 && buildStatus.errors.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Build Warnings ({buildStatus.warnings.length}):</strong>
              <ul className="mt-1 list-disc list-inside">
                {buildStatus.warnings.slice(0, 3).map((warning, index) => (
                  <li key={index} className="text-xs">{warning}</li>
                ))}
                {buildStatus.warnings.length > 3 && (
                  <li className="text-xs">...and {buildStatus.warnings.length - 3} more warnings</li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Last Build Info */}
        {buildStatus.lastBuildTime && !buildStatus.isBuilding && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Last successful build: {buildStatus.lastBuildTime.toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ===== VARIANTS =====

/**
 * Compact Build Manager
 * Phiên bản compact cho sidebar hoặc dashboard
 */
export function CompactTheoryBuildManager(props: TheoryBuildManagerProps) {
  return (
    <TheoryBuildManager
      {...props}
      showAdvancedOptions={false}
      className={cn("compact-build-manager", props.className)}
    />
  );
}

/**
 * Detailed Build Manager
 * Phiên bản đầy đủ với tất cả options
 */
export function DetailedTheoryBuildManager(props: TheoryBuildManagerProps) {
  return (
    <TheoryBuildManager
      {...props}
      showAdvancedOptions={true}
      className={cn("detailed-build-manager", props.className)}
    />
  );
}
