import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Force dynamic for real-time data
export const dynamic = 'force-dynamic';

/**
 * Focus Room Landing Page
 * Trang chủ của Focus Room - hiển thị danh sách phòng học
 */
export default function FocusRoomPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">🎯 Focus Room</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Không gian học tập tập trung - Pomodoro Timer & Study Together
        </p>
        
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/focus-room/create">
            <Button size="lg" className="text-lg">
              🏠 Tạo Phòng Mới
            </Button>
          </Link>
          <Link href="/focus-room/browse">
            <Button size="lg" variant="outline" className="text-lg">
              🔍 Duyệt Phòng
            </Button>
          </Link>
          <Link href="/focus-room/analytics">
            <Button size="lg" variant="outline" className="text-lg">
              📊 Thống Kê
            </Button>
          </Link>
          <Link href="/focus-room/leaderboard">
            <Button size="lg" variant="outline" className="text-lg">
              🏆 Xếp Hạng
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⏰ Pomodoro Timer
            </CardTitle>
            <CardDescription>
              Timer 25/5/15 phút giúp tập trung hiệu quả
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Kỹ thuật Pomodoro giúp bạn duy trì sự tập trung và năng suất cao
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              👥 Study Together
            </CardTitle>
            <CardDescription>
              Học cùng nhau trong không gian yên tĩnh
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Join phòng học với bạn bè, text chat only để không bị xao nhãng
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Analytics & Streaks
            </CardTitle>
            <CardDescription>
              Theo dõi tiến độ học tập của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Contribution graph như GitHub, streak system, và leaderboard
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎵 Ambient Sounds
            </CardTitle>
            <CardDescription>
              Âm thanh nền giúp tập trung
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              15+ âm thanh: mưa, sóng biển, quán cà phê, thư viện, và nhiều hơn
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ✅ Task Manager
            </CardTitle>
            <CardDescription>
              Quản lý công việc đơn giản
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              To-do list cơ bản, tag theo môn học, link với pomodoro sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🏆 Leaderboard
            </CardTitle>
            <CardDescription>
              Thi đua và động lực học tập
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Xếp hạng global, theo lớp, theo trường, và với bạn bè
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Start Guide */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 Bắt Đầu Nhanh</CardTitle>
          <CardDescription>
            Hướng dẫn sử dụng Focus Room
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Tạo phòng mới hoặc join phòng có sẵn</li>
            <li>Chọn chế độ timer: Focus (25 phút), Short Break (5 phút), hoặc Long Break (15 phút)</li>
            <li>Nhập task bạn đang làm (optional)</li>
            <li>Click "Start Focus" để bắt đầu</li>
            <li>Tập trung làm việc cho đến khi timer hết</li>
            <li>Nghỉ ngơi khi break time, sau đó tiếp tục</li>
            <li>Theo dõi streak và analytics của bạn</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}


