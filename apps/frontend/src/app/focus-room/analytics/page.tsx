"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/ui/use-toast";
import { 
  ContributionGraph, 
  DailyChart, 
  SubjectBreakdown,
  StreakDisplay
} from "@/components/features/focus/analytics";
import { 
  useDailyStats, 
  useWeeklyStats, 
  useMonthlyStats, 
  useContributionGraph 
} from "@/hooks/focus/useAnalytics";
import { FocusRoomService } from "@/services/grpc";
import { useQuery } from "@tanstack/react-query";

/**
 * Analytics Page
 * Hiển thị thống kê học tập của user với charts
 */
export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("week");

  // Fetch data with React Query
  const { data: streakData, isLoading: streakLoading } = useQuery({
    queryKey: ['focus', 'streak'],
    queryFn: () => FocusRoomService.getStreak(),
  });

  const { data: weeklyStats, isLoading: weeklyLoading } = useWeeklyStats();
  const { data: monthlyStats, isLoading: monthlyLoading } = useMonthlyStats();
  const { data: contributionData, isLoading: contributionLoading } = useContributionGraph();

  // Get daily breakdown from weekly stats for chart
  const dailyBreakdown = weeklyStats?.dailyBreakdown || [];

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/focus-room" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Link>

        <div>
          <h1 className="text-3xl font-bold mb-2">📊 Thống Kê Học Tập</h1>
          <p className="text-muted-foreground">
            Theo dõi tiến độ học tập và thành tích của bạn
          </p>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 mb-6">
        {(["day", "week", "month"] as const).map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? "default" : "outline"}
            onClick={() => setTimeRange(range)}
            size="sm"
          >
            {range === "day" ? "Hôm Nay" : range === "week" ? "Tuần Này" : "Tháng Này"}
          </Button>
        ))}
      </div>

      {/* Streak Display */}
      <div className="mb-8">
        <StreakDisplay 
          streakData={streakData} 
          isLoading={streakLoading} 
        />
      </div>

      {/* Contribution Graph */}
      <div className="mb-8">
        <ContributionGraph 
          data={contributionData || []} 
          isLoading={contributionLoading} 
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DailyChart 
          data={dailyBreakdown} 
          isLoading={weeklyLoading} 
        />
        
        <SubjectBreakdown 
          subjects={monthlyStats?.topSubjects || []} 
          isLoading={monthlyLoading} 
        />
      </div>

      {/* Back to Room */}
      <div className="mt-8 text-center">
        <Link href="/focus-room">
          <Button size="lg">
            ← Quay Lại Phòng Học
          </Button>
        </Link>
      </div>
    </div>
  );
}
