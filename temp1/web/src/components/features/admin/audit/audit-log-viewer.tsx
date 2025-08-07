'use client';

import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Eye, 
  AlertTriangle, 
  Shield, 
  User,
  Calendar,
  MapPin,
  Monitor
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import {
  Button,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui';
import logger from '@/lib/utils/logger';

/**
 * Audit Log Viewer Component
 * 
 * Hiển thị và quản lý audit logs:
 * - Real-time log viewing
 * - Advanced filtering
 * - Export functionality
 * - Detailed log inspection
 */

interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: Date;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface AuditLogFilters {
  search: string;
  action: string;
  severity: string;
  userId: string;
  dateFrom: string;
  dateTo: string;
}

export function AuditLogViewer(): JSX.Element {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [filters, setFilters] = useState<AuditLogFilters>({
    search: '',
    action: '',
    severity: '',
    userId: '',
    dateFrom: '',
    dateTo: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch audit logs
  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockLogs: AuditLog[] = [
        {
          id: '1',
          userId: 'user123',
          action: 'LOGIN_SUCCESS',
          details: 'Đăng nhập thành công từ Chrome trên Windows',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          severity: 'LOW',
          createdAt: new Date('2024-01-15T10:30:00'),
          user: {
            firstName: 'Nguyễn',
            lastName: 'Văn A',
            email: 'nguyenvana@example.com',
          },
        },
        {
          id: '2',
          userId: 'user456',
          action: 'LOGIN_FAILED',
          details: 'Đăng nhập thất bại - sai mật khẩu',
          ipAddress: '203.162.4.191',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
          severity: 'MEDIUM',
          createdAt: new Date('2024-01-15T10:25:00'),
          user: {
            firstName: 'Trần',
            lastName: 'Thị B',
            email: 'tranthib@example.com',
          },
        },
        {
          id: '3',
          action: 'SUSPICIOUS_ACTIVITY',
          details: 'Nhiều lần đăng nhập thất bại từ IP lạ',
          ipAddress: '45.77.38.101',
          userAgent: 'curl/7.68.0',
          severity: 'HIGH',
          createdAt: new Date('2024-01-15T10:20:00'),
        },
        {
          id: '4',
          userId: 'user789',
          action: 'TWO_FACTOR_ENABLED',
          details: 'Kích hoạt xác thực 2 lớp',
          ipAddress: '192.168.1.105',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          severity: 'LOW',
          createdAt: new Date('2024-01-15T10:15:00'),
          user: {
            firstName: 'Lê',
            lastName: 'Văn C',
            email: 'levanc@example.com',
          },
        },
        {
          id: '5',
          action: 'IP_BLOCKED',
          details: 'Chặn IP do hoạt động đáng ngờ',
          ipAddress: '45.77.38.101',
          userAgent: 'automated-scanner',
          severity: 'CRITICAL',
          createdAt: new Date('2024-01-15T10:10:00'),
        },
      ];

      setLogs(mockLogs);
      setTotalPages(Math.ceil(mockLogs.length / 10));
    } catch (error) {
      logger.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters, currentPage]);

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get action icon
  const getActionIcon = (action: string) => {
    if (action.includes('LOGIN')) return <User className="h-4 w-4" />;
    if (action.includes('SECURITY') || action.includes('TWO_FACTOR')) return <Shield className="h-4 w-4" />;
    if (action.includes('SUSPICIOUS') || action.includes('BLOCKED')) return <AlertTriangle className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  // Handle filter change
  const handleFilterChange = (key: keyof AuditLogFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Export logs
  const exportLogs = () => {
    const csvContent = [
      ['Thời gian', 'Người dùng', 'Hành động', 'Chi tiết', 'IP', 'Mức độ'].join(','),
      ...logs.map(log => [
        format(log.createdAt, 'dd/MM/yyyy HH:mm:ss', { locale: vi }),
        log.user ? `${log.user.firstName} ${log.user.lastName}` : 'N/A',
        log.action,
        log.details.replace(/,/g, ';'),
        log.ipAddress,
        log.severity,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">
            Theo dõi và quản lý nhật ký hoạt động hệ thống
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchLogs}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
          <Button variant="outline" onClick={exportLogs}>
            <Download className="mr-2 h-4 w-4" />
            Xuất CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm trong logs..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Hành động</label>
              <Select value={filters.action} onValueChange={(value) => handleFilterChange('action', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn hành động" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả</SelectItem>
                  <SelectItem value="LOGIN_SUCCESS">Đăng nhập thành công</SelectItem>
                  <SelectItem value="LOGIN_FAILED">Đăng nhập thất bại</SelectItem>
                  <SelectItem value="LOGOUT">Đăng xuất</SelectItem>
                  <SelectItem value="TWO_FACTOR_ENABLED">Kích hoạt 2FA</SelectItem>
                  <SelectItem value="SUSPICIOUS_ACTIVITY">Hoạt động đáng ngờ</SelectItem>
                  <SelectItem value="IP_BLOCKED">Chặn IP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mức độ nghiêm trọng</label>
              <Select value={filters.severity} onValueChange={(value) => handleFilterChange('severity', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn mức độ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả</SelectItem>
                  <SelectItem value="LOW">Thấp</SelectItem>
                  <SelectItem value="MEDIUM">Trung bình</SelectItem>
                  <SelectItem value="HIGH">Cao</SelectItem>
                  <SelectItem value="CRITICAL">Nghiêm trọng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Từ ngày</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Đến ngày</label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">User ID</label>
              <Input
                placeholder="Nhập User ID"
                value={filters.userId}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Nhật ký hoạt động</CardTitle>
          <CardDescription>
            Hiển thị {logs.length} bản ghi - Trang {currentPage} / {totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Đang tải...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Hành động</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Mức độ</TableHead>
                    <TableHead>Chi tiết</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {format(log.createdAt, 'dd/MM HH:mm:ss', { locale: vi })}
                      </TableCell>
                      <TableCell>
                        {log.user ? (
                          <div>
                            <div className="font-medium">
                              {log.user.firstName} {log.user.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {log.user.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getActionIcon(log.action)}
                          <span className="font-medium">{log.action}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{log.ipAddress}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(log.severity)}>
                          {log.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {log.details}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Hiển thị {logs.length} bản ghi
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Chi tiết Audit Log</span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedLog(null)}>
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ID</label>
                  <p className="font-mono">{selectedLog.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Thời gian</label>
                  <p>{format(selectedLog.createdAt, 'dd/MM/yyyy HH:mm:ss', { locale: vi })}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Hành động</label>
                  <p className="font-medium">{selectedLog.action}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Mức độ</label>
                  <Badge className={getSeverityColor(selectedLog.severity)}>
                    {selectedLog.severity}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">IP Address</label>
                  <p className="font-mono">{selectedLog.ipAddress}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">User ID</label>
                  <p>{selectedLog.userId || 'N/A'}</p>
                </div>
              </div>
              
              {selectedLog.user && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Thông tin người dùng</label>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p><strong>Tên:</strong> {selectedLog.user.firstName} {selectedLog.user.lastName}</p>
                    <p><strong>Email:</strong> {selectedLog.user.email}</p>
                  </div>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">User Agent</label>
                <p className="text-sm bg-gray-50 p-2 rounded font-mono break-all">
                  {selectedLog.userAgent}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Chi tiết</label>
                <p className="bg-gray-50 p-3 rounded-lg">{selectedLog.details}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
