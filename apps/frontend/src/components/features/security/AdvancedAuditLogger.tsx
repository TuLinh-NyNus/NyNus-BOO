/**
 * Advanced Audit Logger Component
 * Component để quản lý audit logs nâng cao
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Database,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  MapPin,
  Monitor,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

// ===== TYPES =====

export interface AdvancedAuditLoggerProps {
  className?: string;
}

interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress: string;
  userAgent?: string;
  sessionId?: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

interface AuditFilters {
  userId?: string;
  action?: string;
  resource?: string;
  success?: boolean;
  startDate?: string;
  endDate?: string;
  ipAddress?: string;
}

interface ComplianceReport {
  id: string;
  reportType: 'SECURITY_EVENTS' | 'USER_ACTIVITIES' | 'DATA_CHANGES' | 'SYSTEM_ACCESS';
  title: string;
  description: string;
  period: string;
  totalEvents: number;
  criticalEvents: number;
  generatedAt: Date;
  status: 'GENERATING' | 'COMPLETED' | 'FAILED';
}

// ===== CONSTANTS =====

const ACTION_TYPES = [
  'LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'DOWNLOAD',
  'UPLOAD', 'EXPORT', 'IMPORT', 'APPROVE', 'REJECT', 'SUSPEND', 'ACTIVATE'
];

const RESOURCE_TYPES = [
  'USER', 'COURSE', 'EXAM', 'QUESTION', 'ANSWER', 'SESSION', 'ROLE', 'PERMISSION'
];

const REPORT_TYPES = [
  { value: 'SECURITY_EVENTS', label: 'Sự kiện bảo mật' },
  { value: 'USER_ACTIVITIES', label: 'Hoạt động người dùng' },
  { value: 'DATA_CHANGES', label: 'Thay đổi dữ liệu' },
  { value: 'SYSTEM_ACCESS', label: 'Truy cập hệ thống' }
];

// ===== MAIN COMPONENT =====

export const AdvancedAuditLogger: React.FC<AdvancedAuditLoggerProps> = ({
  className
}) => {
  // ===== STATE =====

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([]);
  const [filters, setFilters] = useState<AuditFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ===== HANDLERS =====

  const loadAuditLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with real gRPC service call
      // const response = await AuditService.getAuditLogs({
      //   filters,
      //   page: currentPage,
      //   pageSize: 20
      // });

      // Mock data generation
      const logs: AuditLog[] = Array.from({ length: 20 }, (_, i) => ({
        id: `audit-${i}`,
        userId: Math.random() > 0.3 ? `user-${Math.floor(Math.random() * 100)}` : undefined,
        userEmail: Math.random() > 0.3 ? `user${Math.floor(Math.random() * 100)}@example.com` : undefined,
        action: ACTION_TYPES[Math.floor(Math.random() * ACTION_TYPES.length)],
        resource: RESOURCE_TYPES[Math.floor(Math.random() * RESOURCE_TYPES.length)],
        resourceId: `resource-${Math.floor(Math.random() * 1000)}`,
        oldValues: Math.random() > 0.5 ? { status: 'active', role: 'student' } : undefined,
        newValues: Math.random() > 0.5 ? { status: 'inactive', role: 'teacher' } : undefined,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: `session-${Math.floor(Math.random() * 1000)}`,
        success: Math.random() > 0.2,
        errorMessage: Math.random() > 0.8 ? 'Permission denied' : undefined,
        metadata: {
          duration: Math.floor(Math.random() * 5000),
          location: ['Hà Nội', 'TP.HCM', 'Đà Nẵng'][Math.floor(Math.random() * 3)]
        },
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      }));

      setAuditLogs(logs);
      setTotalPages(5); // Mock pagination
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadComplianceReports = useCallback(async () => {
    try {
      // TODO: Replace with real gRPC service call
      // const reports = await AuditService.getComplianceReports();

      // Mock data
      const reports: ComplianceReport[] = Array.from({ length: 5 }, (_, i) => ({
        id: `report-${i}`,
        reportType: REPORT_TYPES[Math.floor(Math.random() * REPORT_TYPES.length)].value as ComplianceReport['reportType'],
        title: `Báo cáo tuân thủ ${i + 1}`,
        description: 'Báo cáo chi tiết về các hoạt động và sự kiện bảo mật',
        period: `${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN')} - ${new Date().toLocaleDateString('vi-VN')}`,
        totalEvents: Math.floor(Math.random() * 10000),
        criticalEvents: Math.floor(Math.random() * 100),
        generatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        status: ['GENERATING', 'COMPLETED', 'FAILED'][Math.floor(Math.random() * 3)] as ComplianceReport['status']
      }));

      setComplianceReports(reports);
    } catch (error) {
      console.error('Failed to load compliance reports:', error);
    }
  }, []);

  const handleFilterChange = useCallback((key: keyof AuditFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: (value && value !== 'all') ? value : undefined
    }));
    setCurrentPage(1);
  }, []);

  const handleSearch = useCallback(() => {
    // Implement search logic
    loadAuditLogs();
  }, [loadAuditLogs]);

  const handleExportLogs = useCallback(async () => {
    try {
      // TODO: Replace with real export service
      // await AuditService.exportLogs(filters);
      
      console.log('Exporting audit logs with filters:', filters);
      // Mock export
      const csvContent = auditLogs.map(log => 
        `${log.id},${log.action},${log.resource},${log.success},${log.createdAt.toISOString()}`
      ).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export logs:', error);
    }
  }, [filters, auditLogs]);

  const handleGenerateReport = useCallback(async (reportType: string) => {
    try {
      // TODO: Replace with real gRPC service call
      // await AuditService.generateComplianceReport(reportType);

      console.log('Generating compliance report:', reportType);
      // Mock report generation
      const newReport: ComplianceReport = {
        id: `report-${Date.now()}`,
        reportType: reportType as ComplianceReport['reportType'],
        title: `Báo cáo ${REPORT_TYPES.find(t => t.value === reportType)?.label}`,
        description: 'Báo cáo được tạo tự động',
        period: `${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN')} - ${new Date().toLocaleDateString('vi-VN')}`,
        totalEvents: Math.floor(Math.random() * 10000),
        criticalEvents: Math.floor(Math.random() * 100),
        generatedAt: new Date(),
        status: 'GENERATING'
      };

      setComplianceReports(prev => [newReport, ...prev]);

      // Simulate report completion
      setTimeout(() => {
        setComplianceReports(prev =>
          prev.map(report =>
            report.id === newReport.id
              ? { ...report, status: 'COMPLETED' as const }
              : report
          )
        );
      }, 3000);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  }, []);

  // ===== EFFECTS =====

  useEffect(() => {
    loadAuditLogs();
    loadComplianceReports();
  }, [loadAuditLogs, loadComplianceReports]);

  // ===== RENDER FUNCTIONS =====

  const renderFilters = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Bộ lọc tìm kiếm
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <Label>Tìm kiếm</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Tìm kiếm trong logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button onClick={handleSearch} size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label>Hành động</Label>
            <Select onValueChange={(value) => handleFilterChange('action', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn hành động" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {ACTION_TYPES.map(action => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Tài nguyên</Label>
            <Select onValueChange={(value) => handleFilterChange('resource', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn tài nguyên" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {RESOURCE_TYPES.map(resource => (
                  <SelectItem key={resource} value={resource}>{resource}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Trạng thái</Label>
            <Select onValueChange={(value) => handleFilterChange('success', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="true">Thành công</SelectItem>
                <SelectItem value="false">Thất bại</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Từ ngày</Label>
            <Input
              type="date"
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          <div>
            <Label>Đến ngày</Label>
            <Input
              type="date"
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>

          <div>
            <Label>IP Address</Label>
            <Input
              placeholder="192.168.1.1"
              onChange={(e) => handleFilterChange('ipAddress', e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <Button onClick={handleExportLogs} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Xuất CSV
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderAuditLogs = () => (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Đang tải audit logs...</span>
        </div>
      ) : (
        <>
          {auditLogs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant={log.success ? 'default' : 'destructive'}>
                    {log.success ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    {log.success ? 'Thành công' : 'Thất bại'}
                  </Badge>
                  <Badge variant="outline">{log.action}</Badge>
                  <Badge variant="secondary">{log.resource}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {log.createdAt.toLocaleString('vi-VN')}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  {log.userEmail && (
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-3 w-3" />
                      <span>{log.userEmail}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-3 w-3" />
                    <span>{log.ipAddress}</span>
                  </div>
                  {log.sessionId && (
                    <div className="flex items-center gap-2">
                      <Monitor className="h-3 w-3" />
                      <span>Session: {log.sessionId}</span>
                    </div>
                  )}
                </div>

                <div>
                  {log.resourceId && (
                    <div className="mb-1">
                      <span className="font-medium">Resource ID:</span> {log.resourceId}
                    </div>
                  )}
                  {log.errorMessage && (
                    <div className="text-red-600">
                      <span className="font-medium">Error:</span> {log.errorMessage}
                    </div>
                  )}
                  {log.metadata?.duration && typeof log.metadata.duration === 'number' ? (
                    <div>
                      <span className="font-medium">Duration:</span> {log.metadata.duration}ms
                    </div>
                  ) : null}
                </div>
              </div>

              {(log.oldValues || log.newValues) && (
                <div className="mt-3 pt-3 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {log.oldValues && (
                      <div>
                        <div className="font-medium mb-1">Giá trị cũ:</div>
                        <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.oldValues, null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.newValues && (
                      <div>
                        <div className="font-medium mb-1">Giá trị mới:</div>
                        <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.newValues, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Trang {currentPage} / {totalPages}
            </div>
            <div className="flex gap-2">
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
        </>
      )}
    </div>
  );

  const renderComplianceReports = () => (
    <div className="space-y-6">
      {/* Generate Report Section */}
      <Card>
        <CardHeader>
          <CardTitle>Tạo báo cáo tuân thủ</CardTitle>
          <CardDescription>
            Tạo báo cáo tự động cho các yêu cầu tuân thủ và kiểm toán
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {REPORT_TYPES.map((reportType) => (
              <Button
                key={reportType.value}
                variant="outline"
                onClick={() => handleGenerateReport(reportType.value)}
                className="h-auto flex-col py-4"
              >
                <FileText className="h-6 w-6 mb-2" />
                <span className="text-sm">{reportType.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        {complianceReports.map((report) => (
          <Card key={report.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{report.title}</h4>
                    <Badge variant={
                      report.status === 'COMPLETED' ? 'default' :
                      report.status === 'GENERATING' ? 'secondary' : 'destructive'
                    }>
                      {report.status === 'COMPLETED' ? 'Hoàn thành' :
                       report.status === 'GENERATING' ? 'Đang tạo' : 'Thất bại'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {report.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {report.period}
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      {report.totalEvents} sự kiện
                    </span>
                    <span className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {report.criticalEvents} nghiêm trọng
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground mb-2">
                    {report.generatedAt.toLocaleString('vi-VN')}
                  </div>
                  {report.status === 'COMPLETED' && (
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      Tải về
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // ===== MAIN RENDER =====

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Audit Logs nâng cao</h2>
        <p className="text-muted-foreground">
          Quản lý và phân tích audit logs với khả năng tìm kiếm và báo cáo tuân thủ
        </p>
      </div>

      {/* Filters */}
      {renderFilters()}

      {/* Main Content */}
      <Tabs defaultValue="logs" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Audit Logs
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Báo cáo tuân thủ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách Audit Logs</CardTitle>
              <CardDescription>
                Chi tiết các hoạt động và thay đổi trong hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderAuditLogs()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <div>
            {renderComplianceReports()}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAuditLogger;
