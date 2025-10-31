"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Flame, Clock, Target } from "lucide-react";
import { FocusRoomService } from "@/services/grpc/focus-room.service";
import { useToast } from "@/hooks/ui/use-toast";
import { StatsCard } from "@/components/features/focus/analytics/StatsCard";

/**
 * Analytics Page
 * Hiển thị thống kê học tập của user
 * Refactored: Sử dụng StatsCard component
 */
export default function AnalyticsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [streakData, setStreakData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("week");

  // Fetch streak data
  useEffect(() => {
    const fetchStreak = async () => {
      try {
        setLoading(true);
        const streak = await FocusRoomService.getStreak();
        setStreakData(streak);
      } catch (error) {
        console.error("Failed to fetch streak:", error);
        toast({
          title: "❌ Lỗi",
          description: "Không thể tải thống kê",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStreak();
  }, [toast]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="text-center py-20">
          <p className="text-2xl text-muted-foreground">⏳ Đang tải thống kê...</p>
        </div>
      </div>
    );
  }

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

      {/* Stats Grid - Refactored to use StatsCard component */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Streak Hiện Tại"
          icon={Flame}
          iconColor="text-orange-500"
          value={streakData?.currentStreak || 0}
          unit="ngày liên tiếp"
          loading={loading}
        />
        
        <StatsCard
          title="Streak Dài Nhất"
          icon={TrendingUp}
          iconColor="text-blue-500"
          value={streakData?.longestStreak || 0}
          unit="ngày kỷ lục"
          loading={loading}
        />
        
        <StatsCard
          title="Tổng Ngày Học"
          icon={Target}
          iconColor="text-green-500"
          value={streakData?.totalStudyDays || 0}
          unit="ngày tích cóp"
          loading={loading}
        />
        
        <StatsCard
          title="Học Gần Nhất"
          icon={Clock}
          iconColor="text-purple-500"
          value={
            streakData?.lastStudyDate
              ? new Date(streakData.lastStudyDate).toLocaleDateString("vi-VN")
              : "Chưa có"
          }
          unit="thời gian gần nhất"
          loading={loading}
        />
      </div>

      {/* Contribution Graph Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>🎯 Biểu Đồ Hoạt Động (365 Ngày)</CardTitle>
          <CardDescription>
            Màu sắc đậm hơn = bạn học nhiều hơn trong ngày đó
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-6 rounded-lg text-center">
            <p className="text-muted-foreground">
              💡 Biểu đồ sẽ được hiển thị khi có đủ dữ liệu
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Hãy hoàn thành vài sessions để xem biểu đồ
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Mẹo Tăng Productivity</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2">
              <span className="text-blue-500">✓</span>
              <span>Học ít nhất 30 phút mỗi ngày để duy trì streak</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">✓</span>
              <span>Sử dụng Pomodoro timer (25 phút focus) để hiệu quả hơn</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">✓</span>
              <span>Tham gia group study rooms để tăng motivation</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">✓</span>
              <span>Ghi lại task trước khi học để tập trung tốt hơn</span>
            </li>
          </ul>
        </CardContent>
      </Card>

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
