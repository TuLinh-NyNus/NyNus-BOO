"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, Settings, Play, Pause, RotateCcw } from "lucide-react";
import Link from "next/link";
import { FocusRoomService, type FocusRoom } from "@/services/grpc/focus-room.service";
import { useToast } from "@/hooks/ui/use-toast";

/**
 * Focus Room Detail Page
 * Trang chi tiết phòng học với Timer
 */
export default function FocusRoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const roomId = params.roomId as string;

  // Room data state
  const [room, setRoom] = useState<FocusRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Timer state
  const [timerMode, setTimerMode] = useState<"focus" | "shortBreak" | "longBreak">("focus");
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [currentTask, setCurrentTask] = useState("");

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

  // Timer durations
  const durations = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && activeSessionId) {
      // Timer ended - end session
      setIsRunning(false);
      playNotificationSound();
      
      // End session API call
      FocusRoomService.endSession(activeSessionId)
        .then((stats) => {
          toast({
            title: "🎉 Session hoàn tất!",
            description: `Thời gian: ${Math.floor(stats.totalDuration / 60)} phút`,
          });
          setActiveSessionId(null);
        })
        .catch((error) => {
          console.error("Failed to end session:", error);
        });
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, activeSessionId, toast]);

  const playNotificationSound = () => {
    // TODO: Play sound
    alert("⏰ Timer kết thúc!");
  };

  const handleTimerModeChange = (mode: "focus" | "shortBreak" | "longBreak") => {
    setTimerMode(mode);
    setTimeLeft(durations[mode]);
    setIsRunning(false);
  };

  const handleStartPause = async () => {
    if (!isRunning) {
      // Start session
      try {
        const durationType = timerMode === "focus" ? "focus" : 
                            timerMode === "shortBreak" ? "short_break" : "long_break";
        
        const session = await FocusRoomService.startSession({
          roomId,
          durationType,
          taskDescription: currentTask || "Focus session",
        });
        
        setActiveSessionId(session.id);
        setIsRunning(true);
        
        toast({
          title: "✅ Bắt đầu",
          description: `Đã bắt đầu ${getTimerModeLabel()}`,
        });
      } catch (error) {
        console.error("Failed to start session:", error);
        toast({
          title: "❌ Lỗi",
          description: "Không thể bắt đầu session",
          variant: "destructive",
        });
      }
    } else {
      // Pause session
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(durations[timerMode]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimerModeLabel = () => {
    switch (timerMode) {
      case "focus": return "🎯 Focus";
      case "shortBreak": return "☕ Short Break";
      case "longBreak": return "🌴 Long Break";
    }
  };

  const getTimerModeColor = () => {
    switch (timerMode) {
      case "focus": return "text-blue-600 dark:text-blue-400";
      case "shortBreak": return "text-green-600 dark:text-green-400";
      case "longBreak": return "text-purple-600 dark:text-purple-400";
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

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/focus-room/browse" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách phòng
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{room.name}</h1>
            <p className="text-muted-foreground mb-3">{room.description}</p>
            <div className="flex gap-2 items-center flex-wrap">
              <Badge variant="default">
                {room.roomType === "public" ? "🌐 Công khai" : "🔒 Riêng tư"}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                Tối đa {room.maxParticipants} người
              </Badge>
              <Badge variant={room.isActive ? "default" : "secondary"}>
                {room.isActive ? "🟢 Hoạt động" : "🔴 Đã đóng"}
              </Badge>
            </div>
          </div>
          
          <Button variant="outline" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer Section - Main */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-8 pb-12">
              {/* Timer Display */}
              <div className="text-center mb-8">
                <div className={`text-8xl font-bold mb-4 ${getTimerModeColor()}`}>
                  {formatTime(timeLeft)}
                </div>
                <div className="text-2xl font-semibold text-muted-foreground mb-2">
                  {getTimerModeLabel()}
                </div>
              </div>

              {/* Mode Tabs */}
              <div className="flex justify-center gap-2 mb-8">
                <Button
                  variant={timerMode === "focus" ? "default" : "outline"}
                  onClick={() => handleTimerModeChange("focus")}
                  disabled={isRunning}
                  className="min-w-[120px]"
                >
                  🎯 Focus
                  <span className="ml-2 text-xs opacity-70">25m</span>
                </Button>
                <Button
                  variant={timerMode === "shortBreak" ? "default" : "outline"}
                  onClick={() => handleTimerModeChange("shortBreak")}
                  disabled={isRunning}
                  className="min-w-[120px]"
                >
                  ☕ Short
                  <span className="ml-2 text-xs opacity-70">5m</span>
                </Button>
                <Button
                  variant={timerMode === "longBreak" ? "default" : "outline"}
                  onClick={() => handleTimerModeChange("longBreak")}
                  disabled={isRunning}
                  className="min-w-[120px]"
                >
                  🌴 Long
                  <span className="ml-2 text-xs opacity-70">15m</span>
                </Button>
              </div>

              {/* Task Input */}
              {timerMode === "focus" && (
                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="📝 Bạn đang làm gì? (optional)"
                    value={currentTask}
                    onChange={(e) => setCurrentTask(e.target.value)}
                    className="w-full text-center text-lg border-none focus:outline-none focus:ring-2 focus:ring-primary rounded-lg p-3 bg-muted"
                    disabled={isRunning}
                  />
                </div>
              )}

              {/* Controls */}
              <div className="flex justify-center gap-4">
                <Button
                  size="lg"
                  onClick={handleStartPause}
                  className="min-w-[200px] text-lg h-14"
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Tạm Dừng
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      {timeLeft === durations[timerMode] ? "Bắt Đầu" : "Tiếp Tục"}
                    </>
                  )}
                </Button>
                
                {!isRunning && timeLeft !== durations[timerMode] && (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleReset}
                    className="h-14"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Reset
                  </Button>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mt-8">
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-1000"
                    style={{
                      width: `${((durations[timerMode] - timeLeft) / durations[timerMode]) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Hôm nay</CardDescription>
                <CardTitle className="text-2xl">2h 30m</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Streak</CardDescription>
                <CardTitle className="text-2xl">🔥 7 ngày</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Sessions</CardDescription>
                <CardTitle className="text-2xl">5 phiên</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Tabs defaultValue="participants">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="participants">
                👥 Thành viên
              </TabsTrigger>
              <TabsTrigger value="chat">
                💬 Chat
              </TabsTrigger>
            </TabsList>

            <TabsContent value="participants" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    Thành viên
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-sm font-bold">
                        U{i}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">User {i}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {i % 2 === 0 ? "🎯 Đang focus..." : "☕ Đang nghỉ"}
                        </p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chat" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Chat Room</CardTitle>
                  <CardDescription className="text-xs">
                    Text only - Giữ yên tĩnh để tập trung
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4 max-h-[400px] overflow-y-auto">
                    <div className="text-xs text-center text-muted-foreground py-2">
                      Chat sẽ được cập nhật real-time với WebSocket 🚀
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    className="w-full p-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Leave Button */}
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => router.push("/focus-room/browse")}
          >
            🚪 Rời Phòng
          </Button>
        </div>
      </div>
    </div>
  );
}


