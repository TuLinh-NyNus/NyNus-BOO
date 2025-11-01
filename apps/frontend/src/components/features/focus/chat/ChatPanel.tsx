/**
 * ChatPanel Component
 * Main chat container cho Focus Room
 * 
 * Features:
 * - Message list với auto-scroll
 * - Connection status indicator
 * - Online users count
 * - Empty state & loading state
 * - Integration với useWebSocket hook
 * - Smart scroll detection (pause auto-scroll khi user scroll up)
 * 
 * @author NyNus Development Team
 * @created 2025-02-01
 */

"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWebSocket } from "@/hooks/focus/useWebSocket";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

export interface ChatPanelProps {
  /** Room ID */
  roomId: string;
  
  /** Auth token */
  token: string;
  
  /** Current user ID */
  currentUserId: string;
  
  /** Custom className */
  className?: string;
}

export function ChatPanel({
  roomId,
  token,
  currentUserId,
  className,
}: ChatPanelProps) {
  
  // WebSocket hook integration
  const {
    isConnected,
    isReconnecting,
    messages,
    onlineUsers,
    sendMessage,
  } = useWebSocket({
    roomId,
    token,
    autoConnect: true,
  });

  // Scroll state
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showRateLimitWarning, setShowRateLimitWarning] = useState(false);

  /**
   * Auto-scroll to bottom khi có message mới
   * (chỉ khi user không scroll up)
   */
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, autoScroll]);

  /**
   * Detect user scroll
   * Pause auto-scroll nếu user scroll up
   */
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // If user scrolled more than 50px from bottom, pause auto-scroll
    setAutoScroll(distanceFromBottom < 50);
  };

  /**
   * Handle send message
   */
  const handleSendMessage = async (message: string) => {
    try {
      sendMessage(message);
      
      // Re-enable auto-scroll after sending
      setAutoScroll(true);
      
    } catch (error) {
      console.error("Failed to send message:", error);
      
      // Show rate limit warning if applicable
      if (error instanceof Error && error.message.includes("rate limit")) {
        setShowRateLimitWarning(true);
        setTimeout(() => setShowRateLimitWarning(false), 3000);
      }
    }
  };

  /**
   * Connection status indicator
   */
  const getConnectionStatus = () => {
    if (isConnected) {
      return {
        icon: <Wifi className="w-4 h-4" />,
        text: "Đã kết nối",
        color: "bg-green-500",
      };
    }
    if (isReconnecting) {
      return {
        icon: <WifiOff className="w-4 h-4 animate-pulse" />,
        text: "Đang kết nối lại...",
        color: "bg-yellow-500",
      };
    }
    return {
      icon: <WifiOff className="w-4 h-4" />,
      text: "Mất kết nối",
      color: "bg-red-500",
    };
  };

  const connectionStatus = getConnectionStatus();

  return (
    <Card className={cn("flex flex-col", className)}>
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Chat
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Online users count */}
            <Badge variant="secondary" className="text-xs">
              👥 {onlineUsers.length} online
            </Badge>
            
            {/* Connection status */}
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs flex items-center gap-1",
                connectionStatus.color
              )}
            >
              {connectionStatus.icon}
              {connectionStatus.text}
            </Badge>
          </div>
        </div>
        <CardDescription>
          Trò chuyện với những người đang học cùng bạn
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 pt-0">
        {/* Messages List */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto space-y-2 pr-2 min-h-[300px] max-h-[400px]"
        >
          {/* Loading state */}
          {!isConnected && messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">
                ⏳ Đang kết nối...
              </p>
            </div>
          )}

          {/* Empty state */}
          {isConnected && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <MessageSquare className="w-12 h-12 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground text-center">
                Chưa có tin nhắn nào<br />
                Hãy bắt đầu cuộc trò chuyện!
              </p>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, index) => (
            <ChatMessage
              key={`${msg.user_id}-${msg.timestamp}-${index}`}
              userId={msg.user_id}
              username={msg.user_id === currentUserId ? "Bạn" : `User ${msg.user_id.slice(0, 6)}`}
              message={msg.message}
              timestamp={msg.timestamp}
              isOwn={msg.user_id === currentUserId}
              isSystem={msg.message.includes("joined") || msg.message.includes("left")}
            />
          ))}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <ChatInput
          onSend={handleSendMessage}
          disabled={!isConnected}
          showRateLimitWarning={showRateLimitWarning}
          placeholder="Nhập tin nhắn..."
        />
      </CardContent>
    </Card>
  );
}
