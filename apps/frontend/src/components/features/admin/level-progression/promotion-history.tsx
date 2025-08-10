"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/form/button";
import { Input } from "@/components/ui/form/input";
import { Badge } from "@/components/ui/display/badge";
import {
  Loader2,
  Search,
  History,
  User,
  TrendingUp,
  RefreshCw,
  Calendar,
  Target,
  Award,
  Settings,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Import mockdata
import {
  getProgressionHistory,
  type ProgressionHistoryEntry,
} from "@/lib/mockdata/level-progression";

/**
 * Interface cho promotion history props
 */
interface PromotionHistoryProps {
  userId?: string; // If provided, show history for specific user
  className?: string;
}

/**
 * Promotion History Component
 * Component để hiển thị promotion history cho users
 */
export function PromotionHistory({ userId, className = "" }: PromotionHistoryProps) {
  // State management
  const [historyEntries, setHistoryEntries] = useState<ProgressionHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEntries, setFilteredEntries] = useState<ProgressionHistoryEntry[]>([]);

  /**
   * Load progression history
   */
  const loadProgressionHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getProgressionHistory(userId);
      setHistoryEntries(data);
      setFilteredEntries(data);
    } catch (error) {
      console.error("Failed to load progression history:", error);
      toast({ title: "Lỗi khi tải progression history", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  /**
   * Filter entries based on search term
   */
  const filterEntries = useCallback((term: string) => {
    if (!term.trim()) {
      setFilteredEntries(historyEntries);
      return;
    }

    const filtered = historyEntries.filter((entry) => {
      const searchLower = term.toLowerCase();
      return (
        entry.user?.email?.toLowerCase().includes(searchLower) ||
        entry.user?.firstName?.toLowerCase().includes(searchLower) ||
        entry.user?.lastName?.toLowerCase().includes(searchLower) ||
        entry.previousRole.toLowerCase().includes(searchLower) ||
        entry.newRole.toLowerCase().includes(searchLower) ||
        entry.progressionType.toLowerCase().includes(searchLower) ||
        entry.reason?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredEntries(filtered);
  }, [historyEntries]);

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  /**
   * Get progression type badge color
   */
  const getProgressionTypeBadgeColor = (type: string) => {
    switch (type) {
      case "AUTOMATIC":
        return "bg-green-100 text-green-800";
      case "MANUAL_OVERRIDE":
        return "bg-blue-100 text-blue-800";
      case "ADMIN_PROMOTION":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  /**
   * Get progression type icon
   */
  const getProgressionTypeIcon = (type: string) => {
    switch (type) {
      case "AUTOMATIC":
        return <Settings className="h-3 w-3" />;
      case "MANUAL_OVERRIDE":
        return <User className="h-3 w-3" />;
      case "ADMIN_PROMOTION":
        return <Award className="h-3 w-3" />;
      default:
        return <TrendingUp className="h-3 w-3" />;
    }
  };

  /**
   * Get user display name
   */
  const getUserDisplayName = (entry: ProgressionHistoryEntry) => {
    if (entry.user) {
      return `${entry.user.firstName} ${entry.user.lastName}`;
    }
    return entry.userId;
  };

  /**
   * Get performed by display name
   */
  const getPerformedByDisplayName = (entry: ProgressionHistoryEntry) => {
    if (entry.performedByUser) {
      return `${entry.performedByUser.firstName} ${entry.performedByUser.lastName}`;
    }
    return entry.performedBy === 'system' ? 'System' : entry.performedBy;
  };

  // Effects
  useEffect(() => {
    loadProgressionHistory();
  }, [loadProgressionHistory]);

  useEffect(() => {
    filterEntries(searchTerm);
  }, [searchTerm, filterEntries]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6" />
            {userId ? "User Progression History" : "All Progression History"}
          </h2>
          <p className="text-muted-foreground">
            {userId
              ? "Lịch sử thay đổi role và level của user"
              : "Lịch sử tất cả thay đổi role và level trong hệ thống"}
          </p>
        </div>
        <Button onClick={loadProgressionHistory} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by user, role, type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredEntries.length} of {historyEntries.length} entries
        </div>
      </div>

      {/* History Entries */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Đang tải progression history...</span>
            </div>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <History className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                {searchTerm ? "Không tìm thấy kết quả phù hợp" : "Chưa có progression history nào"}
              </p>
            </div>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div key={entry.id} className="border rounded-lg p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{getUserDisplayName(entry)}</span>
                  </div>
                  {entry.user?.email && (
                    <span className="text-sm text-muted-foreground">({entry.user.email})</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${getProgressionTypeBadgeColor(entry.progressionType)}`}>
                    <span className="flex items-center gap-1">
                      {getProgressionTypeIcon(entry.progressionType)}
                      {entry.progressionType}
                    </span>
                  </Badge>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(entry.timestamp)}
                  </div>
                </div>
              </div>

              {/* Progression Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Role Progression</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{entry.previousRole}</Badge>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline">{entry.newRole}</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Level Progression</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Level {entry.previousLevel}</Badge>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline">Level {entry.newLevel}</Badge>
                  </div>
                </div>
              </div>

              {/* Criteria */}
              {entry.criteria && (
                <div className="space-y-2">
                  <div className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Criteria Met
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {entry.criteria.courseCompletionRate && (
                      <div>
                        <span className="text-muted-foreground">Course Completion:</span>{" "}
                        <span className="font-medium">{entry.criteria.courseCompletionRate}%</span>
                      </div>
                    )}
                    {entry.criteria.examAverageScore && (
                      <div>
                        <span className="text-muted-foreground">Exam Average:</span>{" "}
                        <span className="font-medium">{entry.criteria.examAverageScore}%</span>
                      </div>
                    )}
                    {entry.criteria.activeParticipationDays && (
                      <div>
                        <span className="text-muted-foreground">Active Days:</span>{" "}
                        <span className="font-medium">{entry.criteria.activeParticipationDays}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Reason */}
              {entry.reason && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Reason</div>
                  <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                    {entry.reason}
                  </div>
                </div>
              )}

              {/* Performed By */}
              <div className="text-xs text-muted-foreground">
                Performed by: <span className="font-medium">{getPerformedByDisplayName(entry)}</span>
                {entry.performedByUser?.email && (
                  <span> ({entry.performedByUser.email})</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
