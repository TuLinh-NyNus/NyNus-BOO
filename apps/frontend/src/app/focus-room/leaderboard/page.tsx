"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Trophy, Medal, Target } from "lucide-react";
import { useToast } from "@/hooks/ui/use-toast";

/**
 * Leaderboard Page
 * Hiển thị xếp hạng người chơi
 */
export default function LeaderboardPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "all-time">("weekly");
  const [entries, setEntries] = useState<any[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);

  // Mock data for demonstration
  const mockEntries = [
    {
      rank: 1,
      userId: "user1",
      userName: "Nguyễn Văn A",
      focusTime: 7200,
      sessions: 12,
      streak: 15,
      score: 18500,
      isCurrentUser: false,
    },
    {
      rank: 2,
      userId: "user2",
      userName: "Trần Thị B",
      focusTime: 6300,
      sessions: 10,
      streak: 10,
      score: 16200,
      isCurrentUser: false,
    },
    {
      rank: 3,
      userId: "user3",
      userName: "Lê Văn C",
      focusTime: 5400,
      sessions: 9,
      streak: 8,
      score: 14800,
      isCurrentUser: true, // Current user
    },
    {
      rank: 4,
      userId: "user4",
      userName: "Phạm Thị D",
      focusTime: 4500,
      sessions: 7,
      streak: 6,
      score: 12300,
      isCurrentUser: false,
    },
    {
      rank: 5,
      userId: "user5",
      userName: "Võ Văn E",
      focusTime: 3600,
      sessions: 6,
      streak: 5,
      score: 10100,
      isCurrentUser: false,
    },
  ];

  // Load leaderboard data
  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setLoading(true);
        // TODO: Replace with real API call
        // const data = await FocusRoomService.getLeaderboard(period);
        // setEntries(data);

        // Mock delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setEntries(mockEntries);
        setUserRank(3); // Mock user rank
      } catch (error) {
        console.error("Failed to load leaderboard:", error);
        toast({
          title: "❌ Lỗi",
          description: "Không thể tải bảng xếp hạng",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [period, toast]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank.toString();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="text-center py-20">
          <p className="text-2xl text-muted-foreground">⏳ Đang tải bảng xếp hạng...</p>
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
          <h1 className="text-3xl font-bold mb-2">🏆 Bảng Xếp Hạng</h1>
          <p className="text-muted-foreground">
            Cạnh tranh với những người học khác và chinh phục vị trí hàng đầu
          </p>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["daily", "weekly", "monthly", "all-time"] as const).map((p) => (
          <Button
            key={p}
            variant={period === p ? "default" : "outline"}
            onClick={() => setPeriod(p)}
            size="sm"
          >
            {p === "daily"
              ? "Hôm Nay"
              : p === "weekly"
              ? "Tuần Này"
              : p === "monthly"
              ? "Tháng Này"
              : "Toàn Thời Gian"}
          </Button>
        ))}
      </div>

      {/* Current User Rank Card */}
      {userRank && (
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Vị Trí Của Bạn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Xếp Hạng</p>
                <p className="text-2xl font-bold">#{userRank}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Điểm</p>
                <p className="text-2xl font-bold">14,800</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Thời Gian Focus</p>
                <p className="text-2xl font-bold">90 phút</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Streak Hiện Tại</p>
                <p className="text-2xl font-bold">
                  <span className="text-orange-500">🔥</span> 8 ngày
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Learners</CardTitle>
          <CardDescription>
            {period === "daily"
              ? "Xếp hạng hôm nay"
              : period === "weekly"
              ? "Xếp hạng tuần này"
              : period === "monthly"
              ? "Xếp hạng tháng này"
              : "Xếp hạng tất cả thời gian"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12">Xếp Hạng</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead className="text-right">Focus Time</TableHead>
                  <TableHead className="text-right">Sessions</TableHead>
                  <TableHead className="text-right">Streak</TableHead>
                  <TableHead className="text-right">Điểm</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow
                    key={entry.rank}
                    className={entry.isCurrentUser ? "bg-blue-50/50 dark:bg-blue-950/20 font-semibold" : ""}
                  >
                    <TableCell className="font-bold text-lg">{getRankBadge(entry.rank)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                          {entry.userName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{entry.userName}</p>
                          {entry.isCurrentUser && (
                            <Badge variant="secondary" className="text-xs">
                              Bạn
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatTime(entry.focusTime)}
                    </TableCell>
                    <TableCell className="text-right">{entry.sessions}</TableCell>
                    <TableCell className="text-right">
                      <span className="text-orange-500">🔥</span> {entry.streak}
                    </TableCell>
                    <TableCell className="text-right font-bold text-lg">
                      {entry.score.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>💡 Cách Tính Điểm</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span><strong>Focus Time:</strong> 1 giây = 1 điểm</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span><strong>Sessions:</strong> 300 điểm cho mỗi session hoàn thành</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span><strong>Streak:</strong> 1000 điểm cho mỗi ngày streak</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span><strong>Tasks:</strong> 500 điểm cho mỗi task hoàn thành</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Back Button */}
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
