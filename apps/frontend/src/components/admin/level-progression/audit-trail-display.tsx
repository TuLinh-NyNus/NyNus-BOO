"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/form/button";
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/form/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/form/select";
import { Badge } from "@/components/ui/display/badge";
import {
  Loader2,
  Search,
  Filter,

  User,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  X,
} from "lucide-react";
import { toast } from '@/hooks';

// Import mockdata
import {
  getAuditLogs,
  type AuditLogEntry,
} from "@/lib/mockdata/level-progression";

/**
 * Audit Trail Display Component
 * Component để hiển thị comprehensive audit logs
 */
export function AuditTrailDisplay() {
  // State management
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  });

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    action: "all",
    resource: "all",
    status: "all",
    userId: "",
  });

  const [showFilters, setShowFilters] = useState(false);

  /**
   * Load audit logs với pagination và filters
   */
  const loadAuditLogs = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    try {
      const response = await getAuditLogs(page, pagination.limit);
      setAuditLogs(response.logs);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Error loading audit logs:", error);
      toast({ title: "Không thể tải audit logs", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [pagination.limit]);

  /**
   * Handle filter change
   */
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setFilters({
      search: "",
      action: "all",
      resource: "all",
      status: "all",
      userId: "",
    });
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  /**
   * Get status badge color
   */
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "bg-green-100 text-green-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  /**
   * Get status icon
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle className="h-4 w-4" />;
      case "FAILED":
        return <XCircle className="h-4 w-4" />;
      case "PENDING":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  /**
   * Get user display name
   */
  const getUserDisplayName = (entry: AuditLogEntry) => {
    if (entry.user) {
      return `${entry.user.firstName} ${entry.user.lastName}`;
    }
    return entry.userId;
  };

  // Load audit logs on mount
  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Audit Trail
          </h2>
          <p className="text-muted-foreground">
            Comprehensive tracking của all admin actions và system events
          </p>
        </div>
        <Button onClick={() => loadAuditLogs(pagination.page)} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filters</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Hide" : "Show"}
          </Button>
          {Object.values(filters).some(v => v) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Action</Label>
              <Select value={filters.action} onValueChange={(value) => handleFilterChange("action", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  <SelectItem value="USER_ROLE_UPDATE">User Role Update</SelectItem>
                  <SelectItem value="PROGRESSION_SETTINGS_UPDATE">Settings Update</SelectItem>
                  <SelectItem value="QUESTION_CREATE">Question Create</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Resource</Label>
              <Select value={filters.resource} onValueChange={(value) => handleFilterChange("resource", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All resources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All resources</SelectItem>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="SETTINGS">Settings</SelectItem>
                  <SelectItem value="QUESTION">Question</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="SUCCESS">Success</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>User ID</Label>
              <Input
                placeholder="User ID..."
                value={filters.userId}
                onChange={(e) => handleFilterChange("userId", e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Audit Logs Table */}
      <div className="border rounded-lg">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Đang tải audit logs...</span>
            </div>
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Không có audit logs nào</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/25">
                <tr>
                  <th className="text-left p-4 font-medium">Timestamp</th>
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium">Action</th>
                  <th className="text-left p-4 font-medium">Resource</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((entry, index) => (
                  <tr key={entry.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/25"}>
                    <td className="p-4">
                      <div className="text-sm">{formatDate(entry.timestamp)}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{getUserDisplayName(entry)}</span>
                      </div>
                      {entry.user?.email && (
                        <div className="text-xs text-muted-foreground">{entry.user.email}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="text-xs">
                        {entry.action}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{entry.resource}</div>
                      <div className="text-xs text-muted-foreground">ID: {entry.resourceId}</div>
                    </td>
                    <td className="p-4">
                      <Badge className={`text-xs ${getStatusBadgeColor(entry.status)}`}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(entry.status)}
                          {entry.status}
                        </span>
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadAuditLogs(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadAuditLogs(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
