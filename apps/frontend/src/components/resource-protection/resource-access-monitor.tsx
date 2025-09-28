/**
 * Resource Access Monitor Component
 * Component để monitor và hiển thị resource access activities
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useResourceProtection } from '@/hooks/use-resource-protection';
import { ResourceAccess, SuspiciousActivity } from '@/services/grpc/resource-protection.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Ban, 
  CheckCircle,
  RefreshCw,
  Search,
  Download,
  Play,
  FileText,
  Video,
  BookOpen,
  TrendingUp,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Resource Type Icon Component
 */
function ResourceTypeIcon({ type }: { type: string }) {
  const iconProps = { className: "h-4 w-4" };
  
  switch (type) {
    case 'VIDEO': return <Video {...iconProps} className="h-4 w-4 text-blue-500" />;
    case 'PDF': return <FileText {...iconProps} className="h-4 w-4 text-red-500" />;
    case 'COURSE': return <BookOpen {...iconProps} className="h-4 w-4 text-green-500" />;
    case 'EXAM': return <FileText {...iconProps} className="h-4 w-4 text-purple-500" />;
    default: return <FileText {...iconProps} className="h-4 w-4 text-gray-500" />;
  }
}

/**
 * Action Icon Component
 */
function ActionIcon({ action }: { action: string }) {
  const iconProps = { className: "h-4 w-4" };
  
  switch (action) {
    case 'DOWNLOAD': return <Download {...iconProps} className="h-4 w-4 text-orange-500" />;
    case 'STREAM': return <Play {...iconProps} className="h-4 w-4 text-blue-500" />;
    case 'VIEW': return <Eye {...iconProps} className="h-4 w-4 text-green-500" />;
    default: return <Eye {...iconProps} className="h-4 w-4 text-gray-500" />;
  }
}

/**
 * Risk Score Badge Component
 */
function RiskScoreBadge({ score }: { score: number }) {
  const { getRiskLevel } = useResourceProtection();
  const level = getRiskLevel(score);
  
  const variants = {
    low: 'default' as const,
    medium: 'secondary' as const,
    high: 'destructive' as const,
    critical: 'destructive' as const
  };

  return (
    <Badge variant={variants[level]} className="text-xs">
      {score}/100
    </Badge>
  );
}

/**
 * Access Status Badge Component
 */
function AccessStatusBadge({ isValid }: { isValid: boolean }) {
  return (
    <Badge variant={isValid ? 'default' : 'destructive'} className="text-xs">
      {isValid ? 'Hợp lệ' : 'Đáng nghi'}
    </Badge>
  );
}

/**
 * Resource Access Table Component
 */
interface ResourceAccessTableProps {
  accesses: ResourceAccess[];
  loading: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
}

function ResourceAccessTable({ accesses, loading, onLoadMore, hasMore }: ResourceAccessTableProps) {
  if (loading && accesses.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (accesses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500">
        <Shield className="h-12 w-12 mb-2 text-gray-300" />
        <p>Không có dữ liệu truy cập</p>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thời gian</TableHead>
              <TableHead>Người dùng</TableHead>
              <TableHead>Tài nguyên</TableHead>
              <TableHead>Hành động</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Điểm rủi ro</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thời lượng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accesses.map((access) => (
              <TableRow key={access.id}>
                <TableCell className="text-sm">
                  {formatDistanceToNow(new Date(access.createdAt), {
                    addSuffix: true,
                    locale: vi
                  })}
                </TableCell>
                <TableCell className="font-medium">
                  {access.userId.substring(0, 8)}...
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <ResourceTypeIcon type={access.resourceType} />
                    <span className="text-sm">{access.resourceType}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <ActionIcon action={access.action} />
                    <span className="text-sm">{access.action}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm font-mono">
                  {access.ipAddress}
                </TableCell>
                <TableCell>
                  <RiskScoreBadge score={access.riskScore} />
                </TableCell>
                <TableCell>
                  <AccessStatusBadge isValid={access.isValidAccess} />
                </TableCell>
                <TableCell className="text-sm">
                  {access.duration ? `${access.duration}ms` : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {hasMore && (
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                Đang tải...
              </>
            ) : (
              'Tải thêm'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Suspicious Activities Table Component
 */
interface SuspiciousActivitiesTableProps {
  activities: SuspiciousActivity[];
  loading: boolean;
  onBlockUser: (userId: string) => void;
  onUnblockUser: (userId: string) => void;
}

function SuspiciousActivitiesTable({ 
  activities, 
  loading, 
  onBlockUser, 
  onUnblockUser 
}: SuspiciousActivitiesTableProps) {
  const { toast } = useToast();

  const handleBlockUser = async (userId: string) => {
    try {
      await onBlockUser(userId);
      toast({
        title: 'Thành công',
        description: 'Đã chặn người dùng',
      });
    } catch (error) {
      console.error('Failed to block user:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể chặn người dùng',
        variant: 'destructive',
      });
    }
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      await onUnblockUser(userId);
      toast({
        title: 'Thành công',
        description: 'Đã bỏ chặn người dùng',
      });
    } catch (error) {
      console.error('Failed to unblock user:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể bỏ chặn người dùng',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Đang tải hoạt động đáng nghi ngờ...</span>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500">
        <CheckCircle className="h-12 w-12 mb-2 text-green-300" />
        <p>Không có hoạt động đáng nghi ngờ</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Người dùng</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Điểm rủi ro</TableHead>
            <TableHead>Hoạt động gần đây</TableHead>
            <TableHead>Lần truy cập cuối</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.map((activity) => (
            <TableRow key={activity.userId}>
              <TableCell className="font-medium">
                {activity.userId.substring(0, 8)}...
              </TableCell>
              <TableCell>{activity.userEmail}</TableCell>
              <TableCell>
                <RiskScoreBadge score={activity.riskScore} />
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">{activity.recentAccessCount}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm">
                {formatDistanceToNow(new Date(activity.lastAccessAt), {
                  addSuffix: true,
                  locale: vi
                })}
              </TableCell>
              <TableCell>
                <Badge variant={activity.isBlocked ? 'destructive' : 'secondary'}>
                  {activity.isBlocked ? 'Đã chặn' : 'Hoạt động'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  {activity.isBlocked ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Bỏ chặn người dùng</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc chắn muốn bỏ chặn người dùng này?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleUnblockUser(activity.userId)}>
                            Bỏ chặn
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Ban className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Chặn người dùng</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc chắn muốn chặn người dùng này do hoạt động đáng nghi ngờ?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleBlockUser(activity.userId)}>
                            Chặn
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/**
 * Main Resource Access Monitor Component
 */
export function ResourceAccessMonitor() {
  const {
    accessLogs,
    accessLogsLoading,
    loadAccessLogs,
    suspiciousActivities,
    suspiciousLoading,
    loadSuspiciousActivities,
    blockUser,
    unblockUser
  } = useResourceProtection();

  const [activeTab, setActiveTab] = useState('access-logs');
  const [searchQuery, setSearchQuery] = useState('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('');
  const [riskScoreFilter, setRiskScoreFilter] = useState('');

  // Load initial data
  useEffect(() => {
    loadAccessLogs();
    loadSuspiciousActivities();
  }, [loadAccessLogs, loadSuspiciousActivities]);

  const handleSearch = () => {
    const params: Record<string, string | number> = {};
    
    if (searchQuery) {
      params.search = searchQuery;
    }
    
    if (resourceTypeFilter) {
      params.resourceType = resourceTypeFilter;
    }
    
    if (riskScoreFilter) {
      params.minRiskScore = parseInt(riskScoreFilter);
    }

    if (activeTab === 'access-logs') {
      loadAccessLogs(params);
    } else {
      loadSuspiciousActivities(params);
    }
  };

  const handleLoadMore = () => {
    const currentPage = Math.floor(accessLogs.length / 20) + 1;
    loadAccessLogs({ page: currentPage + 1 });
  };

  const handleBlockUser = async (userId: string) => {
    await blockUser(userId, 'Suspicious activity detected', 24);
  };

  const handleUnblockUser = async (userId: string) => {
    await unblockUser(userId);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Giám sát truy cập tài nguyên</CardTitle>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadAccessLogs();
              loadSuspiciousActivities();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Làm mới
          </Button>
        </div>
        
        <CardDescription>
          Theo dõi và phân tích hoạt động truy cập tài nguyên để phát hiện hành vi đáng nghi ngờ
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Search and Filter */}
        <div className="flex items-center space-x-2 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Tìm kiếm theo user ID, IP address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <Select value={resourceTypeFilter} onValueChange={setResourceTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Loại tài nguyên" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tất cả</SelectItem>
              <SelectItem value="VIDEO">Video</SelectItem>
              <SelectItem value="PDF">PDF</SelectItem>
              <SelectItem value="COURSE">Khóa học</SelectItem>
              <SelectItem value="EXAM">Đề thi</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={riskScoreFilter} onValueChange={setRiskScoreFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Điểm rủi ro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tất cả</SelectItem>
              <SelectItem value="70">Cao (≥70)</SelectItem>
              <SelectItem value="40">Trung bình (≥40)</SelectItem>
              <SelectItem value="0">Thấp (≥0)</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-1" />
            Tìm kiếm
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="access-logs" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Nhật ký truy cập</span>
            </TabsTrigger>
            <TabsTrigger value="suspicious" className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Hoạt động đáng nghi</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="access-logs" className="mt-6">
            <ResourceAccessTable
              accesses={accessLogs}
              loading={accessLogsLoading}
              onLoadMore={handleLoadMore}
              hasMore={accessLogs.length % 20 === 0 && accessLogs.length > 0}
            />
          </TabsContent>

          <TabsContent value="suspicious" className="mt-6">
            <SuspiciousActivitiesTable
              activities={suspiciousActivities}
              loading={suspiciousLoading}
              onBlockUser={handleBlockUser}
              onUnblockUser={handleUnblockUser}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
