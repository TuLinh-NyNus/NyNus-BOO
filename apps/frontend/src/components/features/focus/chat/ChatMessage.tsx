/**
 * ChatMessage Component
 * Hiển thị một tin nhắn trong chat panel
 * 
 * Features:
 * - User avatar & username
 * - Message content với word-wrap
 * - Timestamp (relative time)
 * - System message styling
 * - Own message vs others styling
 * 
 * @author NyNus Development Team
 * @created 2025-02-01
 */

"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";

export interface ChatMessageProps {
  /** Message ID (for React key) */
  id?: string;
  
  /** User ID của người gửi */
  userId: string;
  
  /** Username của người gửi */
  username?: string;
  
  /** Avatar (emoji hoặc URL) */
  avatar?: string;
  
  /** Nội dung tin nhắn */
  message: string;
  
  /** Timestamp (Unix milliseconds) */
  timestamp: number;
  
  /** Có phải tin nhắn của chính mình không */
  isOwn?: boolean;
  
  /** Có phải system message không (user joined/left) */
  isSystem?: boolean;
  
  /** Custom className */
  className?: string;
}

export function ChatMessage({
  userId,
  username = "Anonymous",
  avatar = "👤",
  message,
  timestamp,
  isOwn = false,
  isSystem = false,
  className,
}: ChatMessageProps) {
  
  /**
   * Format timestamp to relative time
   */
  const getRelativeTime = () => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: vi,
      });
    } catch (error) {
      return "vừa xong";
    }
  };

  /**
   * System message (user joined/left)
   */
  if (isSystem) {
    return (
      <div className={cn("flex justify-center py-2", className)}>
        <p className="text-xs text-muted-foreground text-center px-4 py-1 bg-muted rounded-full">
          {message}
        </p>
      </div>
    );
  }

  /**
   * Regular message
   */
  return (
    <div
      className={cn(
        "flex gap-3 p-3 rounded-lg",
        isOwn ? "bg-primary/10 ml-8" : "bg-muted mr-8",
        className
      )}
    >
      {/* Avatar (chỉ hiển thị cho tin nhắn của người khác) */}
      {!isOwn && (
        <div className="flex-shrink-0">
          <span className="text-2xl" title={username}>
            {avatar}
          </span>
        </div>
      )}

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Username & Timestamp */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className={cn(
            "font-medium text-sm",
            isOwn ? "text-primary" : "text-foreground"
          )}>
            {isOwn ? "Bạn" : username}
          </span>
          <span className="text-xs text-muted-foreground">
            {getRelativeTime()}
          </span>
        </div>

        {/* Message Text */}
        <p className="text-sm whitespace-pre-wrap break-words">
          {message}
        </p>
      </div>

      {/* Avatar for own messages (right side) */}
      {isOwn && (
        <div className="flex-shrink-0">
          <span className="text-2xl" title="Bạn">
            {avatar}
          </span>
        </div>
      )}
    </div>
  );
}
