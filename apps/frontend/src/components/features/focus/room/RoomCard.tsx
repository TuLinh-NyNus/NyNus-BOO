/**
 * RoomCard Component
 * Card component hiển thị thông tin focus room
 * 
 * Features:
 * - Room name & description
 * - Participant count & capacity
 * - Room type badge (Public/Private/Class)
 * - Active status indicator
 * - Join button
 * 
 * @author NyNus Development Team
 * @created 2025-01-30
 */

"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FocusRoom } from "@/services/grpc/focus-room.service";
import { cn } from "@/lib/utils";

export interface RoomCardProps {
  // Room data
  room: FocusRoom;
  
  // Optional custom join handler (if not provided, navigates to room page)
  onJoin?: (roomId: string) => void;
  
  // Custom className
  className?: string;
  
  // Show/hide join button
  showJoinButton?: boolean;
}

export function RoomCard({
  room,
  onJoin,
  className,
  showJoinButton = true,
}: RoomCardProps) {
  
  /**
   * Get room type label
   */
  const getRoomTypeLabel = (type: string): string => {
    switch (type) {
      case "public": return "🌐 Công khai";
      case "private": return "🔒 Riêng tư";
      case "class": return "🎓 Lớp học";
      default: return type;
    }
  };
  
  /**
   * Get room type badge variant
   */
  const getRoomTypeBadgeVariant = (type: string): "default" | "secondary" | "outline" => {
    return type === "public" ? "default" : "secondary";
  };
  
  /**
   * Handle join button click
   */
  const handleJoin = () => {
    if (onJoin) {
      onJoin(room.id);
    }
    // If no custom handler, Link component will handle navigation
  };
  
  return (
    <Card className={cn("hover:shadow-lg transition-shadow", className)}>
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-xl">{room.name}</CardTitle>
          <Badge variant={getRoomTypeBadgeVariant(room.roomType)}>
            {getRoomTypeLabel(room.roomType)}
          </Badge>
        </div>
        <CardDescription>{room.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* Capacity */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Sức chứa:</span>
            <span className="font-medium">
              Tối đa {room.maxParticipants} người
            </span>
          </div>
          
          {/* Active Status */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Trạng thái:</span>
            <Badge variant={room.isActive ? "default" : "secondary"}>
              {room.isActive ? "🟢 Hoạt động" : "🔴 Đã đóng"}
            </Badge>
          </div>
          
          {/* Join Button */}
          {showJoinButton && (
            <div className="pt-2">
              {onJoin ? (
                <Button 
                  className="w-full" 
                  variant="default" 
                  disabled={!room.isActive}
                  onClick={handleJoin}
                >
                  🚪 Vào Phòng
                </Button>
              ) : (
                <Link href={`/focus-room/${room.id}`}>
                  <Button 
                    className="w-full" 
                    variant="default" 
                    disabled={!room.isActive}
                  >
                    🚪 Vào Phòng
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

