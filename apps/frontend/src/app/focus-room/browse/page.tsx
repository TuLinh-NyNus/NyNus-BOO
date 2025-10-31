"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FocusRoomService, type FocusRoom } from "@/services/grpc/focus-room.service";
import { RoomList } from "@/components/features/focus/room/RoomList";

/**
 * Browse Focus Rooms Page
 * Duyệt và tìm kiếm phòng học
 * Refactored: Sử dụng RoomList và RoomCard components
 */
export default function BrowseRoomsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roomTypeFilter, setRoomTypeFilter] = useState("all");
  const [rooms, setRooms] = useState<FocusRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch rooms from API
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const filters = {
          roomType: roomTypeFilter !== "all" ? roomTypeFilter : undefined,
          page: 1,
          pageSize: 20,
        };
        
        const result = await FocusRoomService.listRooms(filters);
        setRooms(result.rooms);
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
        setError("Không thể tải danh sách phòng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [roomTypeFilter]);

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">🔍 Duyệt Phòng Học</h1>
            <p className="text-muted-foreground">
              Tìm và tham gia phòng học phù hợp với bạn
            </p>
          </div>
          <Link href="/focus-room/create">
            <Button>
              ➕ Tạo Phòng Mới
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <Input
            placeholder="🔎 Tìm kiếm phòng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
          
          <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Loại phòng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="public">Công khai</SelectItem>
              <SelectItem value="private">Riêng tư</SelectItem>
              <SelectItem value="class">Lớp học</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Room List - Refactored to use RoomList component */}
      <RoomList
        rooms={filteredRooms}
        loading={loading}
        error={error}
        layout="grid"
        showCreateLink={true}
      />

      {/* Info Card */}
      {filteredRooms.length > 0 && (
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>💡 Mẹo Sử Dụng</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Chọn phòng có số người phù hợp để tránh quá đông hoặc quá vắng</li>
              <li>Đọc mô tả phòng để hiểu mục đích và quy tắc</li>
              <li>Tôn trọng không gian yên tĩnh của mọi người</li>
              <li>Sử dụng chat để giao tiếp khi cần thiết, nhưng đừng spam</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


