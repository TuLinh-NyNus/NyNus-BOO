"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/forms/button";
import { Input } from "@/components/ui/forms/input";
import { Label } from "@/components/ui/forms/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/forms/select";
import { Badge } from "@/components/ui/data-display/badge";
import {
  Loader2,
  Search,
  Filter,
  Calendar,
  User,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  X,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Interface cho audit log entry
 */
interface AuditLogEntry {
  id: string;
  userId: string | null;
  action: string;
  resource: string | null;
  resourceId: string | null;
  details: any;
  ipAddress: string | null;
  userAgent: string | null;
  success: boolean;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
}

/**
 * Interface cho audit trail response
 */
interface AuditTrailResponse {
  logs: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Interface cho audit filters
 */
interface AuditFilters {
  action?: string;
  resource?: string;
  success?: boolean;
  userId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

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
  const [filters, setFilters] = useState<AuditFilters>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  // Available filter options
  const actionOptions = [
    "ROLE_PROMOTION",
    "ROLE_DEMOTION",
    "LEVEL_ADVANCEMENT",
    "MANUAL_LEVEL_OVERRIDE",
    "PERMISSION_UPDATE",
    "USER_STATUS_CHANGE",
    "BULK_OPERATION",
    "LOGIN",
    "LOGOUT",
    "PASSWORD_CHANGE",
  ];

  const resourceOptions = [
    "USER",
    "USER_ROLE",
    "USER_LEVEL",
    "PERMISSION",
    "PROGRESSION_SETTINGS",
    "SYSTEM_CONFIG",
  ];

  /**
   * Load audit logs
   */
  const loadAuditLogs = async (page: number = 1) => {
    setIsLoading(true);

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.action && { action: filters.action }),
        ...(filters.resource && { resource: filters.resource }),
        ...(filters.success !== undefined && { success: filters.success.toString() }),
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/v1/admin/audit-logs?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data: AuditTrailResponse = await response.json();
        setAuditLogs(data.logs);
        setPagination({
          page: data.page,
          limit: data.limit,
          total: data.total,
          totalPages: data.totalPages,
        });
      } else {
        toast.error("Không thể tải audit logs");
      }
    } catch (error) {
      console.error("Failed to load audit logs:", error);
      toast.error("Lỗi khi tải audit logs");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Apply filters
   */
  const applyFilters = () => {
    loadAuditLogs(1);
  };

  /**
   * Clear filters
   */
  const clearFilters = () => {
    setFilters({});
    setSearchTerm("");
    loadAuditLogs(1);
  };

  /**
   * Get action badge color
   */
  const getActionBadgeColor = (
    action: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    const colorMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      ROLE_PROMOTION: "default",
      ROLE_DEMOTION: "destructive",
      LEVEL_ADVANCEMENT: "secondary",
      MANUAL_LEVEL_OVERRIDE: "outline",
      PERMISSION_UPDATE: "default",
      LOGIN: "secondary",
      LOGOUT: "outline",
    };
    return colorMap[action] || "outline";
  };

  /**
   * Get success badge
   */
  const getSuccessBadge = (success: boolean) => {
    return success ? (
      <Badge variant="secondary" className="text-green-700 bg-green-100">
        <CheckCircle className="h-3 w-3 mr-1" />
        Success
      </Badge>
    ) : (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" />
        Failed
      </Badge>
    );
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  /**
   * Get user display name
   */
  const getUserDisplayName = (entry: AuditLogEntry): string => {
    if (entry.user) {
      return `${entry.user.firstName} ${entry.user.lastName}`;
    }
    return entry.userId || "System";
  };

  // Effects
  useEffect(() => {
    loadAuditLogs();
  }, []);

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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Action Filter */}
          <div>
            <Label>Action</Label>
            <Select
              value={filters.action || ""}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, action: value || undefined }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All actions</SelectItem>
                {actionOptions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Resource Filter */}
          <div>
            <Label>Resource</Label>
            <Select
              value={filters.resource || ""}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, resource: value || undefined }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All resources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All resources</SelectItem>
                {resourceOptions.map((resource) => (
                  <SelectItem key={resource} value={resource}>
                    {resource.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Success Filter */}
          <div>
            <Label>Status</Label>
            <Select
              value={filters.success?.toString() || ""}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, success: value ? value === "true" : undefined }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All status</SelectItem>
                <SelectItem value="true">Success</SelectItem>
                <SelectItem value="false">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div>
            <Label>Date Range</Label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={filters.startDate || ""}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, startDate: e.target.value || undefined }))
                }
                className="text-sm"
              />
              <Input
                type="date"
                value={filters.endDate || ""}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, endDate: e.target.value || undefined }))
                }
                className="text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={applyFilters} size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
          <Button onClick={clearFilters} variant="outline" size="sm">
            Clear All
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {auditLogs.length} of {pagination.total} audit logs
        </span>
        <span>
          Page {pagination.page} of {pagination.totalPages}
        </span>
      </div>

      {/* Audit Logs Table */}
      <div className="border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading audit logs...</span>
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="text-center p-8">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No audit logs found</p>
            <p className="text-muted-foreground">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
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
                      <div className="text-sm">{formatDate(entry.createdAt)}</div>
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
                      <Badge variant={getActionBadgeColor(entry.action)}>
                        {entry.action.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">{entry.resource?.replace(/_/g, " ") || "N/A"}</span>
                      {entry.resourceId && (
                        <div className="text-xs text-muted-foreground">ID: {entry.resourceId}</div>
                      )}
                    </td>
                    <td className="p-4">{getSuccessBadge(entry.success)}</td>
                    <td className="p-4">
                      <Button size="sm" variant="outline" onClick={() => setSelectedEntry(entry)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
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
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadAuditLogs(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
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
      )}

      {/* Audit Entry Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Audit Log Details</h3>
              <Button variant="outline" size="sm" onClick={() => setSelectedEntry(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Timestamp</Label>
                  <p className="text-sm">{formatDate(selectedEntry.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">User</Label>
                  <p className="text-sm">{getUserDisplayName(selectedEntry)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Action</Label>
                  <p className="text-sm">{selectedEntry.action}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Resource</Label>
                  <p className="text-sm">{selectedEntry.resource || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div>{getSuccessBadge(selectedEntry.success)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">IP Address</Label>
                  <p className="text-sm">{selectedEntry.ipAddress || "N/A"}</p>
                </div>
              </div>

              {selectedEntry.details && (
                <div>
                  <Label className="text-sm font-medium">Details</Label>
                  <pre className="text-xs bg-muted p-3 rounded mt-1 overflow-x-auto">
                    {JSON.stringify(selectedEntry.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
