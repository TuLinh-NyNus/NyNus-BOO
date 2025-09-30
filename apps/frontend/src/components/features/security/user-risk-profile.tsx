/**
 * User Risk Profile Component
 * Component để hiển thị risk profile của user và các thông tin bảo mật
 */

'use client';

import React, { useEffect } from 'react';
import { useResourceProtection } from '@/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  Globe, 
  Download, 
  XCircle, 
  RefreshCw,
  CheckCircle,
  Clock,
  Eye,
  BarChart3
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Risk Level Indicator Component
 */
interface RiskLevelIndicatorProps {
  riskScore: number;
  size?: 'sm' | 'md' | 'lg';
}

function RiskLevelIndicator({ riskScore, size = 'md' }: RiskLevelIndicatorProps) {
  const { getRiskLevel, getRiskColor } = useResourceProtection();
  const level = getRiskLevel(riskScore);
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-red-500';
    if (score >= 70) return 'bg-orange-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'critical': return 'Rất cao';
      case 'high': return 'Cao';
      case 'medium': return 'Trung bình';
      case 'low': return 'Thấp';
      default: return 'Không xác định';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Mức độ rủi ro</span>
        <span className={`text-sm font-semibold ${getRiskColor(riskScore)}`}>
          {getLevelText(level)} ({riskScore}/100)
        </span>
      </div>
      <div className="relative">
        <Progress 
          value={riskScore} 
          className={`${sizeClasses[size]} bg-gray-200`}
        />
        <div 
          className={`absolute top-0 left-0 ${sizeClasses[size]} ${getProgressColor(riskScore)} rounded-full transition-all duration-300`}
          style={{ width: `${riskScore}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Risk Factors Display Component
 */
interface RiskFactorsProps {
  factors: {
    recentAccessCount: number;
    uniqueIPCount: number;
    downloadCount: number;
    failedAttemptCount: number;
    averageRiskScore: number;
    suspiciousPatterns: string[];
  };
}

function RiskFactorsDisplay({ factors }: RiskFactorsProps) {
  const riskFactors = [
    {
      icon: Activity,
      label: 'Truy cập gần đây',
      value: factors.recentAccessCount,
      threshold: 50,
      unit: 'lần'
    },
    {
      icon: Globe,
      label: 'Địa chỉ IP khác nhau',
      value: factors.uniqueIPCount,
      threshold: 5,
      unit: 'IP'
    },
    {
      icon: Download,
      label: 'Lượt tải xuống',
      value: factors.downloadCount,
      threshold: 20,
      unit: 'lần'
    },
    {
      icon: XCircle,
      label: 'Thất bại',
      value: factors.failedAttemptCount,
      threshold: 10,
      unit: 'lần'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {riskFactors.map((factor, index) => {
        const Icon = factor.icon;
        const isHigh = factor.value >= factor.threshold;
        
        return (
          <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border">
            <div className={`p-2 rounded-full ${isHigh ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{factor.label}</p>
              <p className="text-lg font-semibold">
                {factor.value} {factor.unit}
              </p>
            </div>
            {isHigh && (
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Recent Access Activities Component
 */
interface RecentAccessActivitiesProps {
  accesses: Array<{
    id: string;
    resourceType: string;
    resourceId: string;
    action: string;
    riskScore: number;
    isValidAccess: boolean;
    createdAt: string;
  }>;
}

function RecentAccessActivities({ accesses }: RecentAccessActivitiesProps) {
  if (accesses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-gray-500">
        <Eye className="h-8 w-8 mb-2 text-gray-300" />
        <p className="text-sm">Chưa có hoạt động truy cập</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {accesses.slice(0, 5).map((access) => (
        <div key={access.id} className="flex items-center justify-between p-3 rounded-lg border">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${access.isValidAccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {access.isValidAccess ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">
                {access.action} {access.resourceType}
              </p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(access.createdAt), {
                  addSuffix: true,
                  locale: vi
                })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={access.riskScore > 70 ? 'destructive' : access.riskScore > 40 ? 'secondary' : 'default'}>
              {access.riskScore}
            </Badge>
          </div>
        </div>
      ))}
      
      {accesses.length > 5 && (
        <p className="text-xs text-gray-500 text-center">
          Và {accesses.length - 5} hoạt động khác...
        </p>
      )}
    </div>
  );
}

/**
 * Security Recommendations Component
 */
interface SecurityRecommendationsProps {
  riskScore: number;
  suspiciousPatterns: string[];
  isBlocked: boolean;
}

function SecurityRecommendations({ riskScore, suspiciousPatterns, isBlocked }: SecurityRecommendationsProps) {
  const recommendations = [];

  if (isBlocked) {
    recommendations.push({
      type: 'error',
      title: 'Tài khoản bị tạm khóa',
      description: 'Tài khoản của bạn đã bị tạm khóa do hoạt động đáng nghi ngờ. Vui lòng liên hệ admin để được hỗ trợ.'
    });
  }

  if (riskScore > 70) {
    recommendations.push({
      type: 'warning',
      title: 'Điểm rủi ro cao',
      description: 'Hoạt động của bạn đang có điểm rủi ro cao. Hãy sử dụng hệ thống một cách bình thường để tránh bị khóa tài khoản.'
    });
  }

  if (suspiciousPatterns.length > 0) {
    recommendations.push({
      type: 'warning',
      title: 'Phát hiện hoạt động bất thường',
      description: `Hệ thống phát hiện: ${suspiciousPatterns.join(', ')}. Vui lòng kiểm tra lại hoạt động của bạn.`
    });
  }

  if (riskScore < 30) {
    recommendations.push({
      type: 'success',
      title: 'Hoạt động bình thường',
      description: 'Hoạt động của bạn đang diễn ra bình thường. Hãy tiếp tục sử dụng hệ thống một cách hợp lý.'
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: 'info',
      title: 'Không có khuyến nghị đặc biệt',
      description: 'Hoạt động của bạn đang ở mức độ bình thường. Hãy tiếp tục sử dụng hệ thống một cách có trách nhiệm.'
    });
  }

  return (
    <div className="space-y-3">
      {recommendations.map((rec, index) => (
        <Alert key={index} className={
          rec.type === 'error' ? 'border-red-200 bg-red-50' :
          rec.type === 'warning' ? 'border-orange-200 bg-orange-50' :
          rec.type === 'success' ? 'border-green-200 bg-green-50' :
          'border-blue-200 bg-blue-50'
        }>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-1">{rec.title}</div>
            <div className="text-sm">{rec.description}</div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}

/**
 * Main User Risk Profile Component
 */
interface UserRiskProfileProps {
  userId?: string;
  showTitle?: boolean;
}

export function UserRiskProfile({ userId, showTitle = true }: UserRiskProfileProps) {
  const {
    userRiskProfile,
    riskProfileLoading,
    loadUserRiskProfile
  } = useResourceProtection();

  useEffect(() => {
    loadUserRiskProfile(userId);
  }, [userId, loadUserRiskProfile]);

  const handleRefresh = () => {
    loadUserRiskProfile(userId);
  };

  if (riskProfileLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Đang tải thông tin rủi ro...</span>
        </CardContent>
      </Card>
    );
  }

  if (!userRiskProfile) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-8 text-gray-500">
          <Shield className="h-12 w-12 mb-2 text-gray-300" />
          <p>Không thể tải thông tin rủi ro</p>
          <Button variant="outline" onClick={handleRefresh} className="mt-2">
            <RefreshCw className="h-4 w-4 mr-1" />
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <CardTitle>Hồ sơ rủi ro bảo mật</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Làm mới
              </Button>
            </div>
            <CardDescription>
              Thông tin về mức độ rủi ro và hoạt động bảo mật của tài khoản
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Risk Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Tổng quan điểm rủi ro</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RiskLevelIndicator riskScore={userRiskProfile.currentRiskScore} size="lg" />
        </CardContent>
      </Card>

      {/* Risk Factors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Các yếu tố rủi ro</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RiskFactorsDisplay factors={userRiskProfile.riskFactors} />
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Hoạt động gần đây</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RecentAccessActivities accesses={userRiskProfile.recentAccesses} />
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Khuyến nghị bảo mật</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SecurityRecommendations
            riskScore={userRiskProfile.currentRiskScore}
            suspiciousPatterns={userRiskProfile.riskFactors.suspiciousPatterns}
            isBlocked={userRiskProfile.isBlocked}
          />
        </CardContent>
      </Card>
    </div>
  );
}
