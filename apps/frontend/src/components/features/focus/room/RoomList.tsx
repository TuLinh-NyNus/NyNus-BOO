/**
 * RoomList Component
 * Grid layout component để hiển thị danh sách rooms
 * 
 * Features:
 * - Grid/List layout
 * - Loading state
 * - Error state
 * - Empty state
 * - Responsive design
 * 
 * @author NyNus Development Team
 * @created 2025-01-30
 */

"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RoomCard } from "./RoomCard";
import type { FocusRoom } from "@/services/grpc/focus-room.service";
import { cn } from "@/lib/utils";

export interface RoomListProps {
  // Room data
  rooms: FocusRoom[];
  
  // Loading state
  loading?: boolean;
  
  // Error message
  error?: string | null;
  
  // Layout mode
  layout?: "grid" | "list";
  
  // Custom className
  className?: string;
  
  // Custom join handler
  onRoomJoin?: (roomId: string) => void;
  
  // Show create room link in empty state
  showCreateLink?: boolean;
}

export function RoomList({
  rooms,
  loading = false,
  error = null,
  layout = "grid",
  className,
  onRoomJoin,
  showCreateLink = true,
}: RoomListProps) {
  
  /**
   * Get layout classes
   */
  const getLayoutClasses = () => {
    if (layout === "list") {
      return "flex flex-col gap-4";
    }
    return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
  };
  
  // Loading state
  if (loading) {
    return (
      <div className={cn(getLayoutClasses(), className)}>
        <div className="col-span-full text-center py-12">
          <p className="text-xl text-muted-foreground">
            ⏳ Đang tải danh sách phòng...
          </p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className={cn(getLayoutClasses(), className)}>
        <div className="col-span-full text-center py-12">
          <p className="text-xl text-red-500 mb-4">
            ❌ {error}
          </p>
          <Button onClick={() => window.location.reload()}>
            🔄 Thử lại
          </Button>
        </div>
      </div>
    );
  }
  
  // Empty state
  if (rooms.length === 0) {
    return (
      <div className={cn(getLayoutClasses(), className)}>
        <div className="col-span-full text-center py-12">
          <p className="text-xl text-muted-foreground mb-4">
            😔 Không tìm thấy phòng nào
          </p>
          {showCreateLink && (
            <Link href="/focus-room/create">
              <Button>Tạo phòng đầu tiên</Button>
            </Link>
          )}
        </div>
      </div>
    );
  }
  
  // Room list
  return (
    <div className={cn(getLayoutClasses(), className)}>
      {rooms.map((room) => (
        <RoomCard 
          key={room.id} 
          room={room}
          onJoin={onRoomJoin}
        />
      ))}
    </div>
  );
}

