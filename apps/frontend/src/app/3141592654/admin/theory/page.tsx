/**
 * Admin Theory Management Page
 * Trang chính quản lý hệ thống lý thuyết với build dashboard và controls
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Button } from "@/components/ui/form/button";
import { Progress } from "@/components/ui/display/progress";
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import {
  BookOpen,
  Upload,
  Eye,
  Settings,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Smartphone,
  Monitor,
  Zap,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { BuildStatus } from "@/components/admin/theory";

// ===== TYPES =====

interface TheoryStats {
  totalSubjects: number;
  totalGrades: number;
  totalContent: number;
  lastBuildTime: Date;
  buildDuration: number;
  mobileScore: number;
  performanceScore: number;
}

// ===== MOCK DATA =====

const mockBuildStatus: BuildStatus = {
  isBuilding: false,
  progress: 100,
  currentStep: "Build completed",
  totalFiles: 156,
  processedFiles: 156,
  errors: [],
  warnings: ["LaTeX optimization could be improved for 3 files"],
  lastBuildTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
};

const mockTheoryStats: TheoryStats = {
  totalSubjects: 8,
  totalGrades: 16,
  totalContent: 156,
  lastBuildTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
  buildDuration: 4.2, // minutes
  mobileScore: 96,
  performanceScore: 94
};

// ===== MAIN COMPONENT =====

export default function AdminTheoryPage() {
  // ===== STATE =====
  
  const [buildStatus, setBuildStatus] = useState<BuildStatus>(mockBuildStatus);
  const [theoryStats, _setTheoryStats] = useState<TheoryStats>(mockTheoryStats);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ===== HANDLERS =====

  const handleStartBuild = async () => {
    setBuildStatus(prev => ({
      ...prev,
      isBuilding: true,
      progress: 0,
      currentStep: "Initializing build...",
      startTime: new Date(),
      errors: [],
      warnings: []
    }));

    // Simulate build process
    // In real implementation, this would call the build API
    console.log("Starting theory build process...");
  };

  const handleStopBuild = async () => {
    setBuildStatus(prev => ({
      ...prev,
      isBuilding: false,
      currentStep: "Build stopped by user"
    }));
  };

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // ===== EFFECTS =====

  useEffect(() => {
    // Auto-refresh build status every 5 seconds when building
    if (buildStatus.isBuilding) {
      const interval = setInterval(() => {
        setBuildStatus(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 5, 100),
          processedFiles: Math.min(prev.processedFiles + 3, prev.totalFiles)
        }));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [buildStatus.isBuilding]);

  // ===== RENDER =====

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Lý thuyết</h1>
          <p className="text-muted-foreground">
            Build system và quản lý nội dung lý thuyết cho NyNus
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleRefreshStatus}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Link href="/3141592654/admin/theory/upload">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload Content
            </Button>
          </Link>
          
          <Link href="/3141592654/admin/theory/preview">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </Link>
        </div>
      </div>

      {/* Build Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Build Status
          </CardTitle>
          <CardDescription>
            Trạng thái build system và tiến trình xử lý content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Build Controls */}
          <div className="flex flex-wrap gap-2">
            {!buildStatus.isBuilding ? (
              <Button onClick={handleStartBuild} size="sm">
                <Play className="h-4 w-4 mr-2" />
                Start Build
              </Button>
            ) : (
              <Button onClick={handleStopBuild} variant="destructive" size="sm">
                <Pause className="h-4 w-4 mr-2" />
                Stop Build
              </Button>
            )}
          </div>

          {/* Build Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{buildStatus.currentStep}</span>
              <span>{buildStatus.processedFiles}/{buildStatus.totalFiles} files</span>
            </div>
            <Progress value={buildStatus.progress} className="h-2" />
          </div>

          {/* Build Status Indicators */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              {buildStatus.isBuilding ? (
                <Clock className="h-4 w-4 text-blue-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              <span>
                {buildStatus.isBuilding ? 'Building...' : 'Ready'}
              </span>
            </div>
            
            {buildStatus.errors.length > 0 && (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span>{buildStatus.errors.length} errors</span>
              </div>
            )}
            
            {buildStatus.warnings.length > 0 && (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span>{buildStatus.warnings.length} warnings</span>
              </div>
            )}
          </div>

          {/* Warnings Display */}
          {buildStatus.warnings.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warnings:</strong>
                <ul className="mt-1 list-disc list-inside">
                  {buildStatus.warnings.map((warning, index) => (
                    <li key={index} className="text-xs">{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Theory Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Môn học</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{theoryStats.totalSubjects}</div>
            <p className="text-xs text-muted-foreground">
              TOÁN, LÝ, HÓA, SINH, VĂN, ANH, SỬ, ĐỊA
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lớp học</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{theoryStats.totalGrades}</div>
            <p className="text-xs text-muted-foreground">
              Từ lớp 3 đến lớp 12
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mobile Score</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{theoryStats.mobileScore}</div>
            <p className="text-xs text-muted-foreground">
              Lighthouse mobile score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{theoryStats.performanceScore}</div>
            <p className="text-xs text-muted-foreground">
              Overall performance score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Các thao tác nhanh cho quản lý content lý thuyết
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/3141592654/admin/theory/upload">
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Upload className="h-8 w-8 text-blue-500" />
                    <div>
                      <h3 className="font-medium">Upload Content</h3>
                      <p className="text-sm text-muted-foreground">
                        Tải lên nội dung lý thuyết mới
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/3141592654/admin/theory/preview">
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Eye className="h-8 w-8 text-green-500" />
                    <div>
                      <h3 className="font-medium">Preview Content</h3>
                      <p className="text-sm text-muted-foreground">
                        Xem trước mobile/desktop
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Monitor className="h-8 w-8 text-purple-500" />
                  <div>
                    <h3 className="font-medium">Build Metrics</h3>
                    <p className="text-sm text-muted-foreground">
                      Xem chi tiết performance
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
