/**
 * User Behavior Analytics Dashboard
 * Analytics system để track user behavior patterns và insights
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Users,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Eye,
  Download,
  Play,
  BookOpen
} from 'lucide-react';

// Types cho user behavior analytics
interface UserSession {
  userId: string;
  sessionId: string;
  startTime: string;
  endTime?: string;
  duration: number; // in minutes
  pageViews: number;
  actionsPerformed: number;
  deviceType: 'DESKTOP' | 'MOBILE' | 'TABLET';
  browser: string;
  location: string;
  bounceRate: boolean;
}

interface UserEngagement {
  userId: string;
  email: string;
  totalSessions: number;
  totalTimeSpent: number; // in minutes
  averageSessionDuration: number;
  pageViewsPerSession: number;
  lastActivity: string;
  engagementScore: number;
  preferredDevice: string;
  mostActiveHour: number;
  favoriteFeatures: string[];
}

interface ContentAnalytics {
  contentId: string;
  contentType: 'VIDEO' | 'PDF' | 'QUIZ' | 'ARTICLE';
  title: string;
  views: number;
  uniqueViews: number;
  averageViewDuration: number;
  completionRate: number;
  downloadCount: number;
  shareCount: number;
  rating: number;
  engagementScore: number;
}

interface BehaviorPattern {
  pattern: string;
  description: string;
  userCount: number;
  frequency: number;
  trend: 'INCREASING' | 'DECREASING' | 'STABLE';
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendation: string;
}

interface AnalyticsMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  averageSessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  engagementRate: number;
}

export function UserBehaviorAnalytics() {
  // State management
  const [analyticsMetrics, setAnalyticsMetrics] = useState<AnalyticsMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    returningUsers: 0,
    averageSessionDuration: 0,
    bounceRate: 0,
    conversionRate: 0,
    engagementRate: 0
  });

  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [userEngagement, setUserEngagement] = useState<UserEngagement[]>([]);
  const [contentAnalytics, setContentAnalytics] = useState<ContentAnalytics[]>([]);
  const [behaviorPatterns, setBehaviorPatterns] = useState<BehaviorPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');

  // Mock data generation
  useEffect(() => {
    const generateMockData = () => {
      // Generate user sessions
      const sessions: UserSession[] = Array.from({ length: 200 }, (_, i) => ({
        userId: `user-${Math.floor(Math.random() * 50)}`,
        sessionId: `session-${i}`,
        startTime: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
        endTime: new Date(Date.now() - Math.random() * 86400000 * 7 + Math.random() * 3600000).toISOString(),
        duration: Math.floor(Math.random() * 120) + 5, // 5-125 minutes
        pageViews: Math.floor(Math.random() * 20) + 1,
        actionsPerformed: Math.floor(Math.random() * 50) + 1,
        deviceType: ['DESKTOP', 'MOBILE', 'TABLET'][Math.floor(Math.random() * 3)] as UserSession['deviceType'],
        browser: ['Chrome', 'Firefox', 'Safari', 'Edge'][Math.floor(Math.random() * 4)],
        location: ['Vietnam', 'USA', 'Singapore', 'Japan'][Math.floor(Math.random() * 4)],
        bounceRate: Math.random() > 0.7
      }));

      // Generate user engagement data
      const engagement: UserEngagement[] = Array.from({ length: 50 }, (_, i) => {
        const userSessions = sessions.filter(s => s.userId === `user-${i}`);
        const totalTimeSpent = userSessions.reduce((sum, s) => sum + s.duration, 0);
        const averageSessionDuration = userSessions.length > 0 ? totalTimeSpent / userSessions.length : 0;
        
        return {
          userId: `user-${i}`,
          email: `user${i}@example.com`,
          totalSessions: userSessions.length,
          totalTimeSpent,
          averageSessionDuration,
          pageViewsPerSession: userSessions.length > 0 ? userSessions.reduce((sum, s) => sum + s.pageViews, 0) / userSessions.length : 0,
          lastActivity: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          engagementScore: Math.floor(Math.random() * 100),
          preferredDevice: ['DESKTOP', 'MOBILE', 'TABLET'][Math.floor(Math.random() * 3)],
          mostActiveHour: Math.floor(Math.random() * 24),
          favoriteFeatures: ['Videos', 'Quizzes', 'PDFs', 'Articles'].slice(0, Math.floor(Math.random() * 4) + 1)
        };
      });

      // Generate content analytics
      const content: ContentAnalytics[] = Array.from({ length: 30 }, (_, i) => ({
        contentId: `content-${i}`,
        contentType: ['VIDEO', 'PDF', 'QUIZ', 'ARTICLE'][Math.floor(Math.random() * 4)] as ContentAnalytics['contentType'],
        title: `Content Title ${i + 1}`,
        views: Math.floor(Math.random() * 1000) + 50,
        uniqueViews: Math.floor(Math.random() * 800) + 30,
        averageViewDuration: Math.floor(Math.random() * 300) + 60, // seconds
        completionRate: Math.floor(Math.random() * 100),
        downloadCount: Math.floor(Math.random() * 200),
        shareCount: Math.floor(Math.random() * 50),
        rating: Math.floor(Math.random() * 50) + 50, // 50-100
        engagementScore: Math.floor(Math.random() * 100)
      }));

      // Generate behavior patterns
      const patterns: BehaviorPattern[] = [
        {
          pattern: 'Peak Usage Hours',
          description: 'Most users are active between 9 AM - 11 AM and 2 PM - 4 PM',
          userCount: 85,
          frequency: 92,
          trend: 'STABLE',
          impact: 'HIGH',
          recommendation: 'Schedule maintenance outside peak hours'
        },
        {
          pattern: 'Mobile-First Behavior',
          description: 'Increasing number of users prefer mobile devices for content consumption',
          userCount: 120,
          frequency: 78,
          trend: 'INCREASING',
          impact: 'HIGH',
          recommendation: 'Optimize mobile experience and responsive design'
        },
        {
          pattern: 'Video Content Preference',
          description: 'Users spend 60% more time on video content compared to text',
          userCount: 95,
          frequency: 85,
          trend: 'INCREASING',
          impact: 'MEDIUM',
          recommendation: 'Increase video content production'
        },
        {
          pattern: 'Quick Session Pattern',
          description: 'Many users have short sessions but high frequency visits',
          userCount: 65,
          frequency: 70,
          trend: 'STABLE',
          impact: 'MEDIUM',
          recommendation: 'Create bite-sized content for quick consumption'
        },
        {
          pattern: 'Weekend Learning',
          description: 'Significant increase in learning activities during weekends',
          userCount: 45,
          frequency: 60,
          trend: 'INCREASING',
          impact: 'LOW',
          recommendation: 'Promote weekend learning programs'
        }
      ];

      // Calculate analytics metrics
      const totalUsers = engagement.length;
      const activeUsers = engagement.filter(u => new Date(u.lastActivity) > new Date(Date.now() - 86400000)).length;
      const newUsers = Math.floor(totalUsers * 0.15);
      const returningUsers = totalUsers - newUsers;
      const averageSessionDuration = sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length;
      const bounceRate = (sessions.filter(s => s.bounceRate).length / sessions.length) * 100;
      const conversionRate = Math.floor(Math.random() * 20) + 10; // 10-30%
      const engagementRate = (engagement.filter(u => u.engagementScore > 60).length / engagement.length) * 100;

      const metrics: AnalyticsMetrics = {
        totalUsers,
        activeUsers,
        newUsers,
        returningUsers,
        averageSessionDuration,
        bounceRate,
        conversionRate,
        engagementRate
      };

      setUserSessions(sessions);
      setUserEngagement(engagement);
      setContentAnalytics(content);
      setBehaviorPatterns(patterns);
      setAnalyticsMetrics(metrics);
      setIsLoading(false);
    };

    generateMockData();
  }, [timeRange]);

  // Helper functions
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('vi-VN');
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'INCREASING': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'DECREASING': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'STABLE': return <Activity className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'HIGH': return 'bg-red-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Behavior Analytics</h1>
          <p className="text-gray-600">Insights về user behavior patterns và engagement</p>
        </div>
        <div className="flex items-center space-x-2">
          {(['24h', '7d', '30d', '90d'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              onClick={() => setTimeRange(range)}
              size="sm"
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Analytics Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsMetrics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsMetrics.newUsers} new users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analyticsMetrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((analyticsMetrics.activeUsers / analyticsMetrics.totalUsers) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatDuration(analyticsMetrics.averageSessionDuration)}
            </div>
            <p className="text-xs text-muted-foreground">Average duration</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(analyticsMetrics.engagementRate)}%
            </div>
            <Progress value={analyticsMetrics.engagementRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">User Engagement</TabsTrigger>
          <TabsTrigger value="content">Content Analytics</TabsTrigger>
          <TabsTrigger value="patterns">Behavior Patterns</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>New Users</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={(analyticsMetrics.newUsers / analyticsMetrics.totalUsers) * 100} className="w-20" />
                      <span className="text-sm">{analyticsMetrics.newUsers}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Returning Users</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={(analyticsMetrics.returningUsers / analyticsMetrics.totalUsers) * 100} className="w-20" />
                      <span className="text-sm">{analyticsMetrics.returningUsers}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Active Users</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={(analyticsMetrics.activeUsers / analyticsMetrics.totalUsers) * 100} className="w-20" />
                      <span className="text-sm">{analyticsMetrics.activeUsers}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['DESKTOP', 'MOBILE', 'TABLET'].map(device => {
                    const count = userSessions.filter(s => s.deviceType === device).length;
                    const percentage = (count / userSessions.length) * 100;
                    return (
                      <div key={device} className="flex items-center justify-between">
                        <span className="capitalize">{device.toLowerCase()}</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={percentage} className="w-20" />
                          <span className="text-sm">{Math.round(percentage)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Engagement Tab */}
        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Engaged Users</CardTitle>
              <CardDescription>Users với highest engagement scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userEngagement
                  .sort((a, b) => b.engagementScore - a.engagementScore)
                  .slice(0, 10)
                  .map((user) => (
                    <div key={user.userId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{user.email}</div>
                        <div className="text-sm text-gray-500">
                          {user.totalSessions} sessions • {formatDuration(user.totalTimeSpent)} total time
                        </div>
                        <div className="text-xs text-gray-400">
                          Preferred: {user.preferredDevice} • Most active: {user.mostActiveHour}:00
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-blue-500">
                          Score: {user.engagementScore}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          Avg: {formatDuration(user.averageSessionDuration)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Analytics Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Content</CardTitle>
              <CardDescription>Content với highest engagement và views</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentAnalytics
                  .sort((a, b) => b.engagementScore - a.engagementScore)
                  .slice(0, 10)
                  .map((content) => (
                    <div key={content.contentId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {content.contentType === 'VIDEO' && <Play className="h-4 w-4 text-blue-600" />}
                          {content.contentType === 'PDF' && <Download className="h-4 w-4 text-blue-600" />}
                          {content.contentType === 'QUIZ' && <BookOpen className="h-4 w-4 text-blue-600" />}
                          {content.contentType === 'ARTICLE' && <Eye className="h-4 w-4 text-blue-600" />}
                        </div>
                        <div>
                          <div className="font-medium">{content.title}</div>
                          <div className="text-sm text-gray-500">
                            {content.views} views • {content.uniqueViews} unique • {content.completionRate}% completion
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-500">
                          Engagement: {content.engagementScore}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          Rating: {content.rating}/100
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {formatTimestamp(new Date().toISOString())}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Behavior Patterns Tab */}
        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Identified Behavior Patterns</CardTitle>
              <CardDescription>Key patterns và insights từ user behavior data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {behaviorPatterns.map((pattern, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={getImpactColor(pattern.impact)}>
                          {pattern.impact} Impact
                        </Badge>
                        <span className="font-medium">{pattern.pattern}</span>
                        {getTrendIcon(pattern.trend)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {pattern.userCount} users • {pattern.frequency}% frequency
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{pattern.description}</p>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-sm font-medium text-blue-800 mb-1">Recommendation:</div>
                      <div className="text-sm text-blue-700">{pattern.recommendation}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
