/**
 * Admin Theory Preview Page
 * Trang preview nội dung lý thuyết với mobile/desktop view và performance metrics
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Button } from "@/components/ui/form/button";
import { Badge } from "@/components/ui/display/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/navigation/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/form/select";
import {
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw,
  Zap,
  Clock,
  TrendingUp,
  Eye,
  Settings,
  Download,
  Share,
  FolderOpen
} from "lucide-react";
import Link from "next/link";
import { LaTeXContent } from "@/components/latex";

// ===== TYPES =====

interface PreviewContent {
  id: string;
  title: string;
  subject: string;
  grade: string;
  chapter: string;
  content: string;
  lastModified: Date;
}

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  latexRenderTime: number;
  mobileScore: number;
  desktopScore: number;
  accessibility: number;
  seo: number;
}

interface DevicePreview {
  name: string;
  width: number;
  height: number;
  scale: number;
  icon: React.ComponentType<{ className?: string }>;
}

// ===== MOCK DATA =====

const mockContent: PreviewContent = {
  id: '1',
  title: 'Hàm số và đồ thị',
  subject: 'TOÁN',
  grade: 'LỚP-12',
  chapter: 'Chương 1: Hàm số',
  content: `# Hàm số và đồ thị

## 1. Định nghĩa hàm số

Cho hai tập hợp khác rỗng $D$ và $R$. Một **hàm số** $f$ từ $D$ vào $R$ là một quy tắc đặt tương ứng mỗi phần tử $x \\in D$ với một và chỉ một phần tử $y \\in R$.

Ký hiệu: $f: D \\to R$ hoặc $y = f(x)$

### Các khái niệm cơ bản:

- **Tập xác định**: $D$ là tập xác định của hàm số
- **Tập giá trị**: $R_f = \\{f(x) | x \\in D\\}$
- **Biến số**: $x$ được gọi là biến số (đối số)
- **Giá trị hàm số**: $y = f(x)$ là giá trị của hàm số tại $x$

## 2. Đồ thị hàm số

Đồ thị của hàm số $y = f(x)$ là tập hợp tất cả các điểm $M(x; f(x))$ trong mặt phẳng tọa độ $Oxy$ với $x \\in D$.

$$\\text{Đồ thị: } \\{(x, y) | y = f(x), x \\in D\\}$$

### Ví dụ:

Cho hàm số $f(x) = x^2 - 2x + 1$

- Tập xác định: $D = \\mathbb{R}$
- Giá trị tại $x = 1$: $f(1) = 1^2 - 2 \\cdot 1 + 1 = 0$
- Đồ thị là một parabol có đỉnh tại $(1, 0)$

## 3. Tính chất của hàm số

### 3.1 Tính đơn điệu

Hàm số $f(x)$ được gọi là:

- **Đồng biến** trên khoảng $(a, b)$ nếu: $\\forall x_1, x_2 \\in (a, b), x_1 < x_2 \\Rightarrow f(x_1) < f(x_2)$
- **Nghịch biến** trên khoảng $(a, b)$ nếu: $\\forall x_1, x_2 \\in (a, b), x_1 < x_2 \\Rightarrow f(x_1) > f(x_2)$

### 3.2 Tính chẵn lẻ

- **Hàm chẵn**: $f(-x) = f(x), \\forall x \\in D$
- **Hàm lẻ**: $f(-x) = -f(x), \\forall x \\in D$

### 3.3 Tính tuần hoàn

Hàm số $f(x)$ có chu kỳ $T > 0$ nếu: $f(x + T) = f(x), \\forall x \\in D$

## 4. Bài tập

**Bài 1:** Tìm tập xác định của hàm số $y = \\frac{1}{\\sqrt{x-1}}$

**Giải:**
Điều kiện: $x - 1 > 0 \\Leftrightarrow x > 1$

Vậy tập xác định: $D = (1, +\\infty)$

**Bài 2:** Xét tính đơn điệu của hàm số $f(x) = x^3 - 3x^2 + 2$

**Giải:**
$f'(x) = 3x^2 - 6x = 3x(x - 2)$

- $f'(x) > 0 \\Leftrightarrow x < 0$ hoặc $x > 2$
- $f'(x) < 0 \\Leftrightarrow 0 < x < 2$

Kết luận:
- Hàm số đồng biến trên $(-\\infty, 0)$ và $(2, +\\infty)$
- Hàm số nghịch biến trên $(0, 2)$`,
  lastModified: new Date()
};

const mockMetrics: PerformanceMetrics = {
  loadTime: 1.2,
  renderTime: 0.8,
  latexRenderTime: 0.4,
  mobileScore: 96,
  desktopScore: 98,
  accessibility: 94,
  seo: 92
};

const devices: DevicePreview[] = [
  { name: 'Desktop', width: 1200, height: 800, scale: 0.5, icon: Monitor },
  { name: 'Tablet', width: 768, height: 1024, scale: 0.6, icon: Tablet },
  { name: 'Mobile', width: 375, height: 667, scale: 0.8, icon: Smartphone }
];

// ===== MAIN COMPONENT =====

export default function AdminTheoryPreviewPage() {
  // ===== STATE =====
  
  const [selectedContent, _setSelectedContent] = useState<PreviewContent>(mockContent);
  const [selectedDevice, setSelectedDevice] = useState<DevicePreview>(devices[0]);
  const [metrics, setMetrics] = useState<PerformanceMetrics>(mockMetrics);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ===== HANDLERS =====

  const handleRefreshMetrics = async () => {
    setIsRefreshing(true);
    
    // Simulate metrics refresh
    setTimeout(() => {
      setMetrics(prev => ({
        ...prev,
        loadTime: Math.random() * 2 + 0.5,
        renderTime: Math.random() * 1 + 0.3,
        latexRenderTime: Math.random() * 0.5 + 0.2,
        mobileScore: Math.floor(Math.random() * 10 + 90),
        desktopScore: Math.floor(Math.random() * 5 + 95)
      }));
      setIsRefreshing(false);
    }, 2000);
  };

  const handleDeviceChange = (deviceName: string) => {
    const device = devices.find(d => d.name === deviceName);
    if (device) {
      setSelectedDevice(device);
    }
  };

  // ===== EFFECTS =====

  useEffect(() => {
    // Auto-refresh metrics every 30 seconds
    const interval = setInterval(() => {
      if (!isRefreshing) {
        handleRefreshMetrics();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isRefreshing]);

  // ===== RENDER HELPERS =====

  const formatTime = (seconds: number) => {
    return `${seconds.toFixed(1)}s`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // ===== RENDER =====

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Preview Nội dung Lý thuyết</h1>
          <p className="text-muted-foreground">
            Xem trước mobile/desktop và đo performance metrics
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Link href="/3141592654/admin/theory">
            <Button variant="outline" size="sm">
              <FolderOpen className="h-4 w-4 mr-2" />
              Back to Theory
            </Button>
          </Link>
          
          <Button
            onClick={handleRefreshMetrics}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Metrics
          </Button>
        </div>
      </div>

      {/* Content Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Content Selection
          </CardTitle>
          <CardDescription>
            Chọn nội dung để preview và test performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium">{selectedContent.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{selectedContent.subject}</Badge>
                <Badge variant="outline">{selectedContent.grade}</Badge>
                <span className="text-sm text-muted-foreground">
                  {selectedContent.chapter}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={selectedDevice.name} onValueChange={handleDeviceChange}>
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Load Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(metrics.loadTime)}</div>
            <p className="text-xs text-muted-foreground">
              Page load time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LaTeX Render</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(metrics.latexRenderTime)}</div>
            <p className="text-xs text-muted-foreground">
              LaTeX processing time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mobile Score</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(metrics.mobileScore)}`}>
              {metrics.mobileScore}
            </div>
            <p className="text-xs text-muted-foreground">
              Lighthouse mobile
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Desktop Score</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(metrics.desktopScore)}`}>
              {metrics.desktopScore}
            </div>
            <p className="text-xs text-muted-foreground">
              Lighthouse desktop
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="preview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="preview">Device Preview</TabsTrigger>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="settings">Preview Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-4">
          {/* Device Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <selectedDevice.icon className="h-5 w-5" />
                {selectedDevice.name} Preview
              </CardTitle>
              <CardDescription>
                Preview nội dung trên {selectedDevice.name.toLowerCase()} với responsive design
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center p-4 bg-muted/30 rounded-lg">
                <div
                  className="bg-white border-2 border-gray-300 rounded-lg shadow-lg overflow-hidden"
                  style={{
                    width: selectedDevice.width * selectedDevice.scale,
                    height: selectedDevice.height * selectedDevice.scale,
                    transform: `scale(${selectedDevice.scale})`
                  }}
                >
                  <div className="h-full overflow-y-auto p-4">
                    <div className="prose prose-sm max-w-none">
                      <LaTeXContent
                        content={selectedContent.content}
                        safeMode={true}
                        showStats={false}
                        className="theory-preview-content"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center gap-2 mt-4">
                {devices.map((device) => (
                  <Button
                    key={device.name}
                    variant={selectedDevice.name === device.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDevice(device)}
                  >
                    <device.icon className="h-4 w-4 mr-2" />
                    {device.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          {/* Detailed Metrics */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Scores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Mobile Performance</span>
                  <span className={`font-bold ${getScoreColor(metrics.mobileScore)}`}>
                    {metrics.mobileScore}/100
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Desktop Performance</span>
                  <span className={`font-bold ${getScoreColor(metrics.desktopScore)}`}>
                    {metrics.desktopScore}/100
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Accessibility</span>
                  <span className={`font-bold ${getScoreColor(metrics.accessibility)}`}>
                    {metrics.accessibility}/100
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">SEO</span>
                  <span className={`font-bold ${getScoreColor(metrics.seo)}`}>
                    {metrics.seo}/100
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Timing Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Load Time</span>
                  <span className="font-bold">{formatTime(metrics.loadTime)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Content Render</span>
                  <span className="font-bold">{formatTime(metrics.renderTime)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">LaTeX Processing</span>
                  <span className="font-bold">{formatTime(metrics.latexRenderTime)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Time to Interactive</span>
                  <span className="font-bold">{formatTime(metrics.loadTime + 0.3)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          {/* Preview Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Preview Settings
              </CardTitle>
              <CardDescription>
                Cấu hình preview và testing options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Auto-refresh Metrics</label>
                  <p className="text-xs text-muted-foreground">
                    Automatically refresh performance metrics every 30 seconds
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">LaTeX Optimization</label>
                  <p className="text-xs text-muted-foreground">
                    Enable mobile-optimized LaTeX rendering
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Touch Simulation</label>
                  <p className="text-xs text-muted-foreground">
                    Simulate touch interactions on mobile preview
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Network Throttling</label>
                  <p className="text-xs text-muted-foreground">
                    Test with simulated slow network conditions
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                <Button variant="outline" size="sm">
                  <Share className="h-4 w-4 mr-2" />
                  Share Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
