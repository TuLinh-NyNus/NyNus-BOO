"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Flame, Clock, Target } from "lucide-react";
import { FocusRoomService } from "@/services/grpc/focus-room.service";
import { useToast } from "@/hooks/ui/use-toast";

/**
 * Analytics Page
 * Hiển thị thống kê học tập của user
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Streak Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Streak Hiện Tại
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{streakData?.currentStreak || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">ngày liên tiếp</p>
          </CardContent>
        </Card>

        {/* Longest Streak */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Streak Dài Nhất
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{streakData?.longestStreak || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">ngày kỷ lục</p>
          </CardContent>
        </Card>

        {/* Total Study Days */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-green-500" />
              Tổng Ngày Học
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{streakData?.totalStudyDays || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">ngày tích cóp</p>
          </CardContent>
        </Card>

        {/* Last Study */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-500" />
              Học Gần Nhất
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold">
              {streakData?.lastStudyDate
                ? new Date(streakData.lastStudyDate).toLocaleDateString("vi-VN")
                : "Chưa có"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">thời gian gần nhất</p>
          </CardContent>
        </Card>
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
