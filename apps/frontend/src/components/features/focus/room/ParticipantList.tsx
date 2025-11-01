/**
 * ParticipantList Component
 * Hiển thị danh sách participants trong focus room
 * 
 * Features:
 * - Participant avatar, name
 * - Current task (if focusing)
 * - Focusing status indicator
 * - Empty state
 * - Loading state
 * 
 * @author NyNus Development Team
 * @created 2025-01-31
 */

"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Participant {
  id: number | string;
  name: string;
  avatar?: string; // Emoji or image URL
  isFocusing?: boolean;
  task?: string; // Current task description
  status?: 'online' | 'focusing' | 'away' | 'offline'; // Presence status
}

export interface ParticipantListProps {
  // Participant data
  participants: Participant[];
  
  // Loading state
  loading?: boolean;
  
  // Custom title
  title?: string;
  
  // Custom description
  description?: string;
  
  // Show as card or plain list
  variant?: "card" | "plain";
  
  // Custom className
  className?: string;
}

export function ParticipantList({
  participants,
  loading = false,
  title = "Participants",
  description = "Những người đang học cùng bạn",
  variant = "card",
  className,
}: ParticipantListProps) {
  
  /**
   * Render participant item
   */
  const renderParticipantItem = (participant: Participant) => {
    // Determine status indicator
    const status = participant.status || (participant.isFocusing ? 'focusing' : 'online');
    const statusConfig = {
      online: { color: 'bg-green-500', label: 'Online', emoji: '🟢' },
      focusing: { color: 'bg-red-500', label: 'Focusing', emoji: '🎯' },
      away: { color: 'bg-yellow-500', label: 'Away', emoji: '🟡' },
      offline: { color: 'bg-gray-400', label: 'Offline', emoji: '⚪' },
    };
    const config = statusConfig[status] || statusConfig.online;

    return (
      <div 
        key={participant.id} 
        className="flex items-center justify-between p-3 bg-muted rounded-lg"
      >
        <div className="flex items-center gap-3">
          {/* Avatar với Status Indicator */}
          <div className="relative">
            <span className="text-2xl">
              {participant.avatar || "👤"}
            </span>
            {/* Online Status Dot */}
            {status !== 'offline' && (
              <span
                className={cn(
                  "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background",
                  config.color
                )}
                title={config.label}
              />
            )}
          </div>
          
          {/* Name & Task */}
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{participant.name}</p>
              {status === 'focusing' && (
                <span className="text-xs text-muted-foreground">🎯</span>
              )}
            </div>
            {participant.task && (
              <p className="text-sm text-muted-foreground">{participant.task}</p>
            )}
          </div>
        </div>
        
        {/* Status Badge */}
        {(status === 'focusing' || participant.isFocusing) && (
          <Badge variant="default" className="bg-green-600">
            🎯 Focusing
          </Badge>
        )}
      </div>
    );
  };
  
  /**
   * Render content
   */
  const renderContent = () => {
    // Loading state
    if (loading) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">⏳ Đang tải...</p>
        </div>
      );
    }
    
    // Empty state
    if (participants.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Chưa có ai trong phòng
          </p>
        </div>
      );
    }
    
    // Participant list
    return (
      <div className="space-y-3">
        {participants.map(renderParticipantItem)}
      </div>
    );
  };
  
  // Plain variant (no card wrapper)
  if (variant === "plain") {
    return (
      <div className={className}>
        {renderContent()}
      </div>
    );
  }
  
  // Card variant (default)
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          {title} ({participants.length})
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}

