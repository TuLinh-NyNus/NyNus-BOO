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
  const renderParticipantItem = (participant: Participant) => (
    <div 
      key={participant.id} 
      className="flex items-center justify-between p-3 bg-muted rounded-lg"
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <span className="text-2xl">
          {participant.avatar || "👤"}
        </span>
        
        {/* Name & Task */}
        <div>
          <p className="font-medium">{participant.name}</p>
          {participant.task && (
            <p className="text-sm text-muted-foreground">{participant.task}</p>
          )}
        </div>
      </div>
      
      {/* Focusing Status */}
      {participant.isFocusing && (
        <Badge variant="default" className="bg-green-600">
          🎯 Focusing
        </Badge>
      )}
    </div>
  );
  
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

