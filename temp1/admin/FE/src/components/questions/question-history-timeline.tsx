/**
 * Question History Timeline Component
 *
 * Displays comprehensive workflow history cho questions với timeline format
 * Leverages existing audit trail patterns với question-specific enhancements
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  Skeleton,
} from "@/components/ui";
import {
  Clock,
  User,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter,
  Calendar,
  Activity,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Download,
  Eye,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

/**
 * Workflow history entry interface
 */
interface WorkflowHistoryEntry {
  id: string;
  timestamp: Date;
  eventType: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  action: string;
  description: string;
  oldValues?: any;
  newValues?: any;
  metadata?: any;
  success: boolean;
  errorMessage?: string;
  ipAddress: string;
  context: {
    questionId?: string;
    operationType?: string;
    reason?: string;
    transitionType?: string;
    processingTimeMs?: number;
  };
}

/**
 * History response interface
 */
interface HistoryResponse {
  entries: WorkflowHistoryEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: {
    totalEvents: number;
    successfulEvents: number;
    failedEvents: number;
    eventsByType: Record<string, number>;
    timeRange: {
      earliest?: Date;
      latest?: Date;
    };
  };
}

/**
 * Component props
 */
interface QuestionHistoryTimelineProps {
  questionId: string;
  className?: string;
}

/**
 * Filter state interface
 */
interface FilterState {
  eventTypes: string[];
  success?: boolean;
  startDate?: string;
  endDate?: string;
  search: string;
}

export function QuestionHistoryTimeline({
  questionId,
  className = "",
}: QuestionHistoryTimelineProps) {
  // State management
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<WorkflowHistoryEntry | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    eventTypes: [],
    search: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
  });

  // Available event types (would be fetched from API)
  const eventTypes = [
    {
      value: "QUESTION_STATUS_TRANSITION",
      label: "Status Transition",
      category: "Status Management",
    },
    {
      value: "QUESTION_BULK_STATUS_TRANSITION",
      label: "Bulk Status Transition",
      category: "Status Management",
    },
    { value: "QUESTION_RETRY_SUCCESS", label: "Retry Success", category: "Retry Operations" },
    { value: "QUESTION_RETRY_FAILED", label: "Retry Failed", category: "Retry Operations" },
    { value: "AUTO_RETRY_PENDING_QUESTIONS", label: "Auto-retry Pending", category: "Auto-retry" },
    { value: "AUTO_RETRY_FAILED_IMAGES", label: "Auto-retry Images", category: "Auto-retry" },
  ];

  /**
   * Load question history
   */
  const loadHistory = async (page: number = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.eventTypes.length > 0) {
        filters.eventTypes.forEach((type) => params.append("eventTypes", type));
      }

      if (filters.success !== undefined) {
        params.set("success", filters.success.toString());
      }

      if (filters.startDate) {
        params.set("startDate", filters.startDate);
      }

      if (filters.endDate) {
        params.set("endDate", filters.endDate);
      }

      // Mock API call - replace with actual API call
      const response = await fetch(`/api/admin/questions/history/${questionId}?${params}`);

      if (!response.ok) {
        throw new Error("Failed to load question history");
      }

      const data: HistoryResponse = await response.json();
      setHistory(data);
      setPagination((prev) => ({ ...prev, page }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle filter changes
   */
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  /**
   * Apply filters
   */
  const applyFilters = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    loadHistory(1);
  };

  /**
   * Reset filters
   */
  const resetFilters = () => {
    setFilters({
      eventTypes: [],
      search: "",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
    loadHistory(1);
  };

  /**
   * Get event type badge
   */
  const getEventTypeBadge = (eventType: string) => {
    const type = eventTypes.find((t) => t.value === eventType);
    const category = type?.category || "Other";

    const variants: Record<string, string> = {
      "Status Management": "bg-blue-100 text-blue-800",
      "Retry Operations": "bg-yellow-100 text-yellow-800",
      "Auto-retry": "bg-purple-100 text-purple-800",
      "Question Management": "bg-green-100 text-green-800",
    };

    return (
      <Badge className={variants[category] || "bg-gray-100 text-gray-800"}>
        {type?.label || eventType}
      </Badge>
    );
  };

  /**
   * Get success status badge
   */
  const getSuccessBadge = (success: boolean) => {
    return success ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Success
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">
        <XCircle className="h-3 w-3 mr-1" />
        Failed
      </Badge>
    );
  };

  /**
   * Format timestamp
   */
  const formatTimestamp = (timestamp: Date) => {
    return format(new Date(timestamp), "dd/MM/yyyy HH:mm:ss", { locale: vi });
  };

  /**
   * Get user display name
   */
  const getUserDisplayName = (entry: WorkflowHistoryEntry) => {
    if (entry.userName) return entry.userName;
    if (entry.userEmail) return entry.userEmail;
    if (entry.userId) return `User ${entry.userId}`;
    return "System";
  };

  // Load initial data
  useEffect(() => {
    loadHistory();
  }, [questionId]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Workflow History
          </h3>
          <p className="text-sm text-muted-foreground">
            Comprehensive tracking của question workflow events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {showFilters ? (
              <ChevronUp className="h-4 w-4 ml-2" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-2" />
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={() => loadHistory(pagination.page)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      {history?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                  <p className="text-lg font-semibold">{history.summary.totalEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Successful</p>
                  <p className="text-lg font-semibold">{history.summary.successfulEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <p className="text-lg font-semibold">{history.summary.failedEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Time Range</p>
                  <p className="text-sm font-medium">
                    {history.summary.timeRange.earliest && history.summary.timeRange.latest
                      ? `${Math.ceil((new Date(history.summary.timeRange.latest).getTime() - new Date(history.summary.timeRange.earliest).getTime()) / (1000 * 60 * 60 * 24))} days`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Event Types Filter */}
              <div>
                <Label className="text-sm font-medium">Event Types</Label>
                <Select
                  value={filters.eventTypes.join(",")}
                  onValueChange={(value) =>
                    handleFilterChange({
                      eventTypes: value ? value.split(",") : [],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All event types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All event types</SelectItem>
                    {eventTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Success Filter */}
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <Select
                  value={filters.success?.toString() || ""}
                  onValueChange={(value) =>
                    handleFilterChange({
                      success: value === "" ? undefined : value === "true",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="true">Success only</SelectItem>
                    <SelectItem value="false">Failed only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search */}
              <div>
                <Label className="text-sm font-medium">Search</Label>
                <Input
                  placeholder="Search descriptions..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange({ search: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" onClick={applyFilters}>
                Apply Filters
              </Button>
              <Button size="sm" variant="outline" onClick={resetFilters}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center p-8">
              <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <p className="text-lg font-medium text-red-600">Error loading history</p>
              <p className="text-muted-foreground">{error}</p>
              <Button className="mt-4" onClick={() => loadHistory(pagination.page)}>
                Try Again
              </Button>
            </div>
          ) : !history?.entries.length ? (
            <div className="text-center p-8">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No workflow history found</p>
              <p className="text-muted-foreground">
                No workflow events have been recorded for this question yet
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Timeline entries */}
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border"></div>

                {/* Timeline entries */}
                <div className="space-y-6">
                  {history.entries.map((entry, index) => (
                    <div key={entry.id} className="relative flex items-start gap-4">
                      {/* Timeline dot */}
                      <div
                        className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background ${
                          entry.success ? "border-green-500" : "border-red-500"
                        }`}
                      >
                        {entry.success ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>

                      {/* Entry content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getEventTypeBadge(entry.eventType)}
                              {getSuccessBadge(entry.success)}
                            </div>
                            <p className="text-sm font-medium">{entry.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {getUserDisplayName(entry)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTimestamp(entry.timestamp)}
                              </span>
                              {entry.context.processingTimeMs && (
                                <span>Processing: {entry.context.processingTimeMs}ms</span>
                              )}
                            </div>
                            {entry.errorMessage && (
                              <p className="text-xs text-red-600 mt-1">
                                Error: {entry.errorMessage}
                              </p>
                            )}
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Event Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">Event Type</Label>
                                    <p className="text-sm">{entry.eventType}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Timestamp</Label>
                                    <p className="text-sm">{formatTimestamp(entry.timestamp)}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">User</Label>
                                    <p className="text-sm">{getUserDisplayName(entry)}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Status</Label>
                                    <div>{getSuccessBadge(entry.success)}</div>
                                  </div>
                                </div>

                                {entry.context.reason && (
                                  <div>
                                    <Label className="text-sm font-medium">Reason</Label>
                                    <p className="text-sm">{entry.context.reason}</p>
                                  </div>
                                )}

                                {entry.metadata && (
                                  <div>
                                    <Label className="text-sm font-medium">Metadata</Label>
                                    <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                                      {JSON.stringify(entry.metadata, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination */}
              {history.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(pagination.page * pagination.limit, history.total)} of {history.total}{" "}
                    entries
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => loadHistory(pagination.page - 1)}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {pagination.page} of {history.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= history.totalPages}
                      onClick={() => loadHistory(pagination.page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
