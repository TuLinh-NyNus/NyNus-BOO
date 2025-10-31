/**
 * Token Analytics Dashboard
 * =========================
 *
 * Comprehensive dashboard for JWT token analytics
 * Displays metrics, trends, insights, and recommendations
 *
 * Features:
 * - Real-time token metrics display
 * - Historical trend charts
 * - Performance analytics
 * - AI-powered insights and recommendations
 * - Export functionality
 *
 * @author NyNus Development Team
 * @version 1.0.0 - Phase 5 Advanced Analytics
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Download,
  Zap,
  Shield,
  BarChart3,
  LineChart as LineChartIcon,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import { getTokenAnalytics } from '@/lib/analytics/token-analytics';
import { getInsightsEngine } from '@/lib/analytics/insights-engine';
import type { TokenAnalytics, TokenInsight } from '@/lib/analytics/token-analytics';
import type { Recommendation } from '@/lib/analytics/insights-engine';

// ===== METRICS CARD COMPONENT =====

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon: React.ElementType;
  description?: string;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
}

function MetricCard({ title, value, trend, icon: Icon, description, color = 'blue' }: MetricCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    orange: 'text-orange-600 bg-orange-50',
    red: 'text-red-600 bg-red-50',
    purple: 'text-purple-600 bg-purple-50',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend !== undefined && (
          <div className="flex items-center mt-2">
            {trend >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
            )}
            <span className={`text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(trend).toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">so với trước</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ===== INSIGHT CARD COMPONENT =====

interface InsightCardProps {
  insight: TokenInsight;
}

function InsightCard({ insight }: InsightCardProps) {
  const severityColors = {
    low: 'bg-blue-50 text-blue-700 border-blue-200',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    high: 'bg-orange-50 text-orange-700 border-orange-200',
    critical: 'bg-red-50 text-red-700 border-red-200',
  };

  const typeIcons = {
    warning: AlertCircle,
    info: Activity,
    success: CheckCircle,
    error: AlertCircle,
  };

  const Icon = typeIcons[insight.type];

  return (
    <Card className={`border ${severityColors[insight.severity]}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <CardTitle className="text-base">{insight.title}</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {insight.severity === 'low' && 'Thấp'}
            {insight.severity === 'medium' && 'Trung bình'}
            {insight.severity === 'high' && 'Cao'}
            {insight.severity === 'critical' && 'Nghiêm trọng'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-2">{insight.description}</p>
        {insight.recommendation && (
          <div className="bg-white/50 p-2 rounded mt-2">
            <p className="text-xs font-medium mb-1">💡 Khuyến nghị:</p>
            <p className="text-xs">{insight.recommendation}</p>
          </div>
        )}
        <div className="flex gap-2 mt-3">
          <Badge variant="secondary" className="text-xs">
            Impact: {insight.impact}/10
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Effort: {insight.effort}/10
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

// ===== RECOMMENDATION CARD COMPONENT =====

interface RecommendationCardProps {
  recommendation: Recommendation;
}

function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const categoryColors = {
    performance: 'bg-blue-50 border-blue-200',
    reliability: 'bg-green-50 border-green-200',
    security: 'bg-red-50 border-red-200',
    cost: 'bg-purple-50 border-purple-200',
    user_experience: 'bg-orange-50 border-orange-200',
  };

  return (
    <Card className={`border ${categoryColors[recommendation.category]}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{recommendation.title}</CardTitle>
          <Badge variant="outline" className="text-xs">
            Priority: {recommendation.priority}/10
          </Badge>
        </div>
        <CardDescription className="text-xs">{recommendation.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs font-medium mb-1">📋 Lý do:</p>
          <p className="text-xs text-muted-foreground">{recommendation.rationale}</p>
        </div>
        
        <div>
          <p className="text-xs font-medium mb-1">🔧 Cách thực hiện:</p>
          <p className="text-xs text-muted-foreground">{recommendation.implementation}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Impact Score:</p>
            <div className="flex gap-1">
              <Badge variant="secondary" className="text-xs">
                Perf: {recommendation.estimatedImpact.performance > 0 ? '+' : ''}{recommendation.estimatedImpact.performance}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Effort:</p>
            <Badge variant="outline" className="text-xs">
              {recommendation.estimatedEffort}/10
            </Badge>
          </div>
        </div>

        {recommendation.risks && recommendation.risks.length > 0 && (
          <div className="bg-red-50 p-2 rounded">
            <p className="text-xs font-medium text-red-700 mb-1">⚠️ Rủi ro:</p>
            <ul className="list-disc list-inside text-xs text-red-600 space-y-1">
              {recommendation.risks.map((risk, idx) => (
                <li key={idx}>{risk}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ===== MAIN DASHBOARD COMPONENT =====

export function TokenAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<TokenAnalytics | null>(null);
  const [insights, setInsights] = useState<TokenInsight[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Load analytics data
  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const tokenAnalytics = getTokenAnalytics();
      const currentAnalytics = tokenAnalytics.getAnalytics();
      setAnalytics(currentAnalytics);
      setInsights(currentAnalytics.insights);

      // Get recommendations from insights engine
      const insightsEngine = getInsightsEngine();
      const recs = insightsEngine.analyzeAndRecommend(currentAnalytics);
      setRecommendations(recs.slice(0, 10)); // Top 10 recommendations

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load token analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading || !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Đang tải analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Token Analytics</h2>
          <p className="text-muted-foreground">
            Phân tích chi tiết về JWT token management
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Last refresh time */}
      <div className="text-sm text-muted-foreground">
        Cập nhật lần cuối: {lastRefresh.toLocaleTimeString('vi-VN')}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="performance">Hiệu suất</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Khuyến nghị</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Tổng số Refresh"
              value={analytics.totalRefreshes.toLocaleString()}
              icon={RefreshCw}
              description="Số lần refresh token"
              color="blue"
            />
            <MetricCard
              title="Tỷ lệ thành công"
              value={`${analytics.successRate.toFixed(1)}%`}
              trend={analytics.successRate - 95}
              icon={CheckCircle}
              description="Token refresh thành công"
              color="green"
            />
            <MetricCard
              title="Thời gian TB"
              value={`${analytics.averageRefreshDuration.toFixed(0)}ms`}
              icon={Clock}
              description="Avg refresh duration"
              color="purple"
            />
            <MetricCard
              title="Tỷ lệ lỗi"
              value={`${analytics.errorRate.toFixed(2)}%`}
              trend={-analytics.errorRate}
              icon={AlertCircle}
              description="Token errors"
              color={analytics.errorRate > 1 ? 'red' : 'orange'}
            />
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
              <CardDescription>
                Token validation và refresh performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">P50 Refresh Time</p>
                  <p className="text-2xl font-bold">{analytics.p50RefreshTime.toFixed(0)}ms</p>
                  <Badge variant={analytics.p50RefreshTime < 100 ? 'default' : 'secondary'} className="mt-1">
                    {analytics.p50RefreshTime < 100 ? 'Tốt' : 'OK'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">P95 Refresh Time</p>
                  <p className="text-2xl font-bold">{analytics.p95RefreshTime.toFixed(0)}ms</p>
                  <Badge variant={analytics.p95RefreshTime < 300 ? 'default' : 'secondary'} className="mt-1">
                    {analytics.p95RefreshTime < 300 ? 'Tốt' : 'Cần cải thiện'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">P99 Refresh Time</p>
                  <p className="text-2xl font-bold">{analytics.p99RefreshTime.toFixed(0)}ms</p>
                  <Badge variant={analytics.p99RefreshTime < 500 ? 'default' : 'destructive'} className="mt-1">
                    {analytics.p99RefreshTime < 500 ? 'Tốt' : 'Cần cải thiện'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Token Lifetime & Efficiency */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Token Lifetime</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {(analytics.averageTokenLifetime / 60000).toFixed(1)} phút
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Thời gian sống trung bình của token
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Refresh Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{analytics.refreshEfficiency.toFixed(0)}/100</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Hiệu suất refresh token
                </p>
                <Badge 
                  variant={analytics.refreshEfficiency >= 80 ? 'default' : 'secondary'} 
                  className="mt-2"
                >
                  {analytics.refreshEfficiency >= 80 ? 'Tốt' : 'Cần cải thiện'}
                </Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Token refresh patterns theo thời gian</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-3">Hourly Refresh Trend (24h)</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={analytics.refreshTrend.hourly.map((count, idx) => ({
                      hour: `${idx}h`,
                      refreshes: count,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="refreshes" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2">
                    Total: {analytics.refreshTrend.hourly.reduce((a, b) => a + b, 0)} refreshes trong 24h
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Daily Refresh Trend (7d)</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={analytics.refreshTrend.daily.map((count, idx) => ({
                      day: `Day ${idx + 1}`,
                      refreshes: count,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="refreshes" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2">
                    Total: {analytics.refreshTrend.daily.reduce((a, b) => a + b, 0)} refreshes trong 7 ngày
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Success/Error Rate Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Success vs Error Rates
              </CardTitle>
              <CardDescription>Tỷ lệ thành công và lỗi token refresh</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={[
                  {
                    name: 'Token Refresh',
                    'Success Rate (%)': analytics.successRate,
                    'Error Rate (%)': analytics.errorRate,
                  },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Success Rate (%)" fill="#10b981" />
                  <Bar dataKey="Error Rate (%)" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance Latency Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Performance Latency (P50/P95/P99)
              </CardTitle>
              <CardDescription>Token validation và refresh latency</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={[
                  { metric: 'P50', 'Actual Latency (ms)': analytics.p50RefreshTime, 'Target SLA (ms)': 100 },
                  { metric: 'P95', 'Actual Latency (ms)': analytics.p95RefreshTime, 'Target SLA (ms)': 300 },
                  { metric: 'P99', 'Actual Latency (ms)': analytics.p99RefreshTime, 'Target SLA (ms)': 500 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis label={{ value: 'Milliseconds', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Actual Latency (ms)" stroke="#8b5cf6" strokeWidth={2} />
                  <Line type="monotone" dataKey="Target SLA (ms)" stroke="#94a3b8" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Error Trends */}
          {Object.keys(analytics.errorTrend.byType).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Error Distribution</CardTitle>
                <CardDescription>Phân bố lỗi theo loại</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={Object.entries(analytics.errorTrend.byType).map(([type, count]) => ({
                    type,
                    count,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {insights.length > 0 ? (
              insights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))
            ) : (
              <Card className="col-span-2">
                <CardContent className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Không có insights nào. Hệ thống đang hoạt động tốt!
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {recommendations.length > 0 ? (
              recommendations.map((rec) => (
                <RecommendationCard key={rec.id} recommendation={rec} />
              ))
            ) : (
              <Card className="col-span-2">
                <CardContent className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <Shield className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Không có khuyến nghị nào. Hệ thống đã được tối ưu hóa!
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default TokenAnalyticsDashboard;

