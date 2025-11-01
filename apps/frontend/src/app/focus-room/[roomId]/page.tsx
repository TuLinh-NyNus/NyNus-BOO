"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { FocusRoomService, type FocusRoom } from "@/services/grpc/focus-room.service";
import { useToast } from "@/hooks/ui/use-toast";
import { PomodoroTimer } from "@/components/features/focus/timer/PomodoroTimer";
import { RoomHeader } from "@/components/features/focus/room/RoomHeader";
import { ParticipantList, type Participant } from "@/components/features/focus/room/ParticipantList";
import { SoundMixer } from "@/components/features/focus/sound";
import { ChatPanel } from "@/components/features/focus/chat";
import { TaskList } from "@/components/features/focus/tasks";
import { formatDuration } from "@/lib/focus/time.utils";
import { AuthHelpers } from "@/lib/utils/auth-helpers";
import { useAuth } from "@/contexts/auth-context-grpc";

/**
 * Focus Room Detail Page
 * Trang chi tiết phòng học với PomodoroTimer component
 * Refactored: Timer logic + Room components (RoomHeader, ParticipantList)
 */
export default function FocusRoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const roomId = params.roomId as string;
  
  // Get auth token for WebSocket
  const authToken = AuthHelpers.getAccessToken() || "";
  const currentUserId = user?.id?.toString() || "";

  // Room data state
  const [room, setRoom] = useState<FocusRoom | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch room data
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const roomData = await FocusRoomService.getRoom(roomId);
        setRoom(roomData);
      } catch (error) {
        console.error("Failed to fetch room:", error);
        toast({
          title: "❌ Lỗi",
          description: "Không thể tải thông tin phòng",
          variant: "destructive",
        });
        router.push("/focus-room/browse");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId, router, toast]);

  /**
   * Handle session start - gọi backend API
   */
  const handleSessionStart = async (_tempSessionId: string): Promise<void> => {
    try {
      const session = await FocusRoomService.startSession({
        roomId,
        durationType: "focus", // Default to focus
        taskDescription: "Focus session",
      });
      
      toast({
        title: "✅ Bắt đầu",
        description: `Đã bắt đầu session focus (ID: ${session.id.slice(0, 8)}...)`,
      });
    } catch (error) {
      console.error("Failed to start session:", error);
      toast({
        title: "❌ Lỗi",
        description: "Không thể bắt đầu session",
        variant: "destructive",
      });
      throw error;
    }
  };

  /**
   * Handle timer complete - gọi backend API
   */
  const handleTimerComplete = async (sessionId: string, _duration: number) => {
    try {
      const stats = await FocusRoomService.endSession(sessionId);
      
      toast({
        title: "🎉 Session hoàn tất!",
        description: `Thời gian: ${formatDuration(stats.totalDuration)}`,
      });
    } catch (error) {
      console.error("Failed to end session:", error);
      toast({
        title: "⚠️ Cảnh báo",
        description: "Không thể lưu session, nhưng timer đã hoàn tất",
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="text-center py-20">
          <p className="text-2xl text-muted-foreground">⏳ Đang tải phòng học...</p>
        </div>
      </div>
    );
  }

  // Room not found
  if (!room) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="text-center py-20">
          <p className="text-2xl text-red-500 mb-4">❌ Không tìm thấy phòng</p>
          <Link href="/focus-room/browse">
            <Button>Quay lại danh sách</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Mock participants data (typed with Participant interface)
  // TODO: Replace with real-time data from WebSocket once presence tracking is fully integrated
  const mockParticipants: Participant[] = [
    { id: 1, name: "User 1", avatar: "👤", status: "focusing", task: "Học Toán" },
    { id: 2, name: "User 2", avatar: "👨", status: "online", task: "" },
    { id: 3, name: "User 3", avatar: "👩", status: "focusing", task: "Ôn Lý" },
  ];

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Room Header - Refactored to RoomHeader component */}
      <RoomHeader
        room={room}
        showBackButton={true}
        showSettingsButton={true}
        onSettingsClick={() => {
          toast({
            title: "🔧 Cài đặt",
            description: "Tính năng đang phát triển",
          });
        }}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer Section - Main */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-8 pb-12">
              {/* Pomodoro Timer Component */}
              <PomodoroTimer
                roomId={roomId}
                onSessionStart={handleSessionStart}
                onTimerComplete={handleTimerComplete}
                showTaskInput={true}
              />
            </CardContent>
          </Card>

          {/* Participants List - Refactored to ParticipantList component */}
          <ParticipantList
            participants={mockParticipants}
            variant="card"
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Chat Panel - Phase 2.2 ✅ */}
          {authToken ? (
            <ChatPanel
              roomId={roomId}
              token={authToken}
              currentUserId={currentUserId}
              className="h-[600px]"
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>💬 Chat</CardTitle>
                <CardDescription>Vui lòng đăng nhập để sử dụng chat</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-center text-muted-foreground py-4">
                  Đang tải...
                </p>
              </CardContent>
            </Card>
          )}

          {/* Sound Mixer - Phase 2.1 Sprint ✅ */}
          <SoundMixer />

          {/* Tasks Panel - Phase 3.1 ✅ */}
          <TaskList />
        </div>
      </div>
    </div>
  );
}
