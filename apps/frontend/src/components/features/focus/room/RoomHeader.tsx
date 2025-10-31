/**
 * RoomHeader Component
 * Header component cho focus room page
 * 
 * Features:
 * - Room name & description
 * - Room type badge (Public/Private/Class)
 * - Capacity & status badges
 * - Back button (optional)
 * - Settings button (optional, owner only)
 * 
 * @author NyNus Development Team
 * @created 2025-01-31
 */

"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Settings } from "lucide-react";
import type { FocusRoom } from "@/services/grpc/focus-room.service";
import { cn } from "@/lib/utils";

export interface RoomHeaderProps {
  // Room data
  room: FocusRoom;
  
  // Show back button (navigate to browse page)
  showBackButton?: boolean;
  
  // Back button URL (default: /focus-room/browse)
  backButtonUrl?: string;
  
  // Show settings button
  showSettingsButton?: boolean;
  
  // Settings button click handler
  onSettingsClick?: () => void;
  
  // Custom className
  className?: string;
}

export function RoomHeader({
  room,
  showBackButton = true,
  backButtonUrl = "/focus-room/browse",
  showSettingsButton = false,
  onSettingsClick,
  className,
}: RoomHeaderProps) {
  
  /**
   * Get room type label with emoji
   */
  const getRoomTypeLabel = (type: string): string => {
    switch (type) {
      case "public": return "🌐 Công khai";
      case "private": return "🔒 Riêng tư";
      case "class": return "🎓 Lớp học";
      default: return type;
    }
  };
  
  return (
    <div className={cn("mb-8", className)}>
      {/* Back Button */}
      {showBackButton && (
        <Link 
          href={backButtonUrl}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách phòng
        </Link>
      )}
      
      {/* Header Content */}
      <div className="flex items-start justify-between">
        <div>
          {/* Room Name */}
          <h1 className="text-3xl font-bold mb-2">{room.name}</h1>
          
          {/* Room Description */}
          <p className="text-muted-foreground mb-3">{room.description}</p>
          
          {/* Badges */}
          <div className="flex gap-2 items-center flex-wrap">
            {/* Room Type Badge */}
            <Badge variant="default">
              {getRoomTypeLabel(room.roomType)}
            </Badge>
            
            {/* Capacity Badge */}
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              Tối đa {room.maxParticipants} người
            </Badge>
            
            {/* Active Status Badge */}
            <Badge variant={room.isActive ? "default" : "secondary"}>
              {room.isActive ? "🟢 Hoạt động" : "🔴 Đã đóng"}
            </Badge>
          </div>
        </div>
        
        {/* Settings Button */}
        {showSettingsButton && (
          <Button 
            variant="outline" 
            size="icon"
            onClick={onSettingsClick}
            title="Cài đặt phòng"
          >
            <Settings className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

