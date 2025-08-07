"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/forms/button";
import { Input } from "@/components/ui/forms/input";
import { Label } from "@/components/ui/forms/label";
import { Badge } from "@/components/ui/data-display/badge";
import {
  Loader2,
  Search,
  TrendingUp,
  TrendingDown,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  History,
} from "lucide-react";
import { UserRole, USER_ROLE_LABELS } from "@/types/admin-user";
import { toast } from "sonner";

/**
 * Interface cho progression history entry
 */
interface ProgressionHistoryEntry {
  id: string;
  userId: string;
  previousRole: UserRole;
  previousLevel: number;
  newRole: UserRole;
  newLevel: number;
  progressionType: "AUTOMATIC" | "MANUAL_OVERRIDE" | "ADMIN_PROMOTION";
  reason?: string;
  performedBy: string;
  timestamp: string;
  criteria?: {
    courseCompletionRate?: number;
    examAverageScore?: number;
    activeParticipationDays?: number;
  };
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  performedByUser?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

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
  const loadProgressionHistory = async () => {
    setIsLoading(true);

    try {
      const endpoint = userId
        ? `/api/v1/admin/users/${userId}/progression-history`
        : "/api/v1/admin/progression-history"; // This would be a new endpoint for all users

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data: ProgressionHistoryEntry[] = await response.json();
        setHistoryEntries(data);
        setFilteredEntries(data);
      } else {
        toast.error("Không thể tải progression history");
      }
    } catch (error) {
      console.error("Failed to load progression history:", error);
      toast.error("Lỗi khi tải progression history");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Filter entries based on search term
   */
  const filterEntries = (term: string) => {
    if (!term.trim()) {
      setFilteredEntries(historyEntries);
      return;
    }

    const filtered = historyEntries.filter((entry) => {
      const searchText = term.toLowerCase();
      return (
        entry.user?.firstName?.toLowerCase().includes(searchText) ||
        entry.user?.lastName?.toLowerCase().includes(searchText) ||
        entry.user?.email?.toLowerCase().includes(searchText) ||
        entry.previousRole.toLowerCase().includes(searchText) ||
        entry.newRole.toLowerCase().includes(searchText) ||
        entry.progressionType.toLowerCase().includes(searchText) ||
        entry.reason?.toLowerCase().includes(searchText)
      );
    });

    setFilteredEntries(filtered);
  };

  /**
   * Get progression type badge
   */
  const getProgressionTypeBadge = (type: string) => {
    const badgeProps = {
      AUTOMATIC: { variant: "secondary" as const, icon: CheckCircle, text: "Automatic" },
      MANUAL_OVERRIDE: { variant: "outline" as const, icon: User, text: "Manual Override" },
      ADMIN_PROMOTION: { variant: "default" as const, icon: TrendingUp, text: "Admin Promotion" },
    };

    const props = badgeProps[type as keyof typeof badgeProps] || badgeProps.AUTOMATIC;
    const IconComponent = props.icon;

    return (
      <Badge variant={props.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {props.text}
      </Badge>
    );
  };

  /**
   * Get role badge color
   */
  const getRoleBadgeColor = (
    role: UserRole
  ): "default" | "secondary" | "destructive" | "outline" => {
    const colorMap: Record<UserRole, "default" | "secondary" | "destructive" | "outline"> = {
      GUEST: "outline",
      STUDENT: "secondary",
      TUTOR: "default",
      TEACHER: "default",
      ADMIN: "destructive",
    };
    return colorMap[role] || "default";
  };

  /**
   * Get progression direction icon
   */
  const getProgressionIcon = (entry: ProgressionHistoryEntry) => {
    const isRolePromotion = entry.newRole !== entry.previousRole;
    const isLevelIncrease = entry.newLevel > entry.previousLevel;

    if (isRolePromotion || isLevelIncrease) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
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
  const getUserDisplayName = (user?: {
    firstName: string;
    lastName: string;
    email: string;
  }): string => {
    if (!user) return "Unknown User";
    return `${user.firstName} ${user.lastName}`;
  };

  // Effects
  useEffect(() => {
    loadProgressionHistory();
  }, [userId]);

  useEffect(() => {
    filterEntries(searchTerm);
  }, [searchTerm, historyEntries]);

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
        <div className="flex-1">
          <Label htmlFor="search">Search History</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by user, role, type, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredEntries.length} of {historyEntries.length} progression entries
      </div>

      {/* History Timeline */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading progression history...</span>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center p-8">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No progression history found</p>
            <p className="text-muted-foreground">
              {searchTerm
                ? "Try adjusting your search terms"
                : "No progression events have occurred yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Progression Icon */}
                  <div className="mt-1">{getProgressionIcon(entry)}</div>

                  {/* Main Content */}
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {!userId && entry.user && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{getUserDisplayName(entry.user)}</span>
                            <span className="text-sm text-muted-foreground">
                              ({entry.user.email})
                            </span>
                          </div>
                        )}
                        {getProgressionTypeBadge(entry.progressionType)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(entry.timestamp)}
                      </div>
                    </div>

                    {/* Progression Details */}
                    <div className="flex items-center gap-4">
                      {/* Previous State */}
                      <div className="flex items-center gap-2">
                        <Badge variant={getRoleBadgeColor(entry.previousRole)}>
                          {USER_ROLE_LABELS[entry.previousRole]}
                        </Badge>
                        <span className="text-sm">Level {entry.previousLevel}</span>
                      </div>

                      {/* Arrow */}
                      <span className="text-muted-foreground">→</span>

                      {/* New State */}
                      <div className="flex items-center gap-2">
                        <Badge variant={getRoleBadgeColor(entry.newRole)}>
                          {USER_ROLE_LABELS[entry.newRole]}
                        </Badge>
                        <span className="text-sm">Level {entry.newLevel}</span>
                      </div>
                    </div>

                    {/* Reason */}
                    {entry.reason && (
                      <div className="text-sm">
                        <span className="font-medium">Reason: </span>
                        <span className="text-muted-foreground">{entry.reason}</span>
                      </div>
                    )}

                    {/* Criteria (for automatic progressions) */}
                    {entry.criteria && entry.progressionType === "AUTOMATIC" && (
                      <div className="text-sm">
                        <span className="font-medium">Criteria met: </span>
                        <div className="flex items-center gap-4 mt-1">
                          {entry.criteria.courseCompletionRate && (
                            <span className="text-muted-foreground">
                              Course: {entry.criteria.courseCompletionRate}%
                            </span>
                          )}
                          {entry.criteria.examAverageScore && (
                            <span className="text-muted-foreground">
                              Exam: {entry.criteria.examAverageScore}%
                            </span>
                          )}
                          {entry.criteria.activeParticipationDays && (
                            <span className="text-muted-foreground">
                              Participation: {entry.criteria.activeParticipationDays} days
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Performed By */}
                    {entry.progressionType !== "AUTOMATIC" && entry.performedByUser && (
                      <div className="text-sm">
                        <span className="font-medium">Performed by: </span>
                        <span className="text-muted-foreground">
                          {getUserDisplayName(entry.performedByUser)} ({entry.performedByUser.email}
                          )
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      {historyEntries.length > 0 && (
        <div className="border rounded-lg p-4 bg-muted/50">
          <h3 className="font-semibold mb-3">Summary Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {historyEntries.filter((e) => e.progressionType === "AUTOMATIC").length}
              </div>
              <div className="text-sm text-muted-foreground">Automatic</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {historyEntries.filter((e) => e.progressionType === "MANUAL_OVERRIDE").length}
              </div>
              <div className="text-sm text-muted-foreground">Manual Override</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {historyEntries.filter((e) => e.progressionType === "ADMIN_PROMOTION").length}
              </div>
              <div className="text-sm text-muted-foreground">Admin Promotion</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {new Set(historyEntries.map((e) => e.userId)).size}
              </div>
              <div className="text-sm text-muted-foreground">Unique Users</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
