"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FocusRoomService, type FocusRoom } from "@/services/grpc/focus-room.service";

/**
 * Browse Focus Rooms Page
 * Duyệt và tìm kiếm phòng học
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

      {/* Room List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12">
            <p className="text-xl text-muted-foreground">
              ⏳ Đang tải danh sách phòng...
            </p>
          </div>
        ) : error ? (
          <div className="col-span-full text-center py-12">
            <p className="text-xl text-red-500 mb-4">
              ❌ {error}
            </p>
            <Button onClick={() => window.location.reload()}>
              🔄 Thử lại
            </Button>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-xl text-muted-foreground mb-4">
              😔 Không tìm thấy phòng nào
            </p>
            <Link href="/focus-room/create">
              <Button>Tạo phòng đầu tiên</Button>
            </Link>
          </div>
        ) : (
          filteredRooms.map((room) => (
            <Card key={room.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-xl">{room.name}</CardTitle>
                  <Badge variant={room.roomType === "public" ? "default" : "secondary"}>
                    {room.roomType === "public" ? "🌐 Công khai" : "🔒 Riêng tư"}
                  </Badge>
                </div>
                <CardDescription>{room.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Sức chứa:</span>
                    <span className="font-medium">
                      Tối đa {room.maxParticipants} người
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Trạng thái:</span>
                    <Badge variant={room.isActive ? "default" : "secondary"}>
                      {room.isActive ? "🟢 Hoạt động" : "🔴 Đã đóng"}
                    </Badge>
                  </div>

                  <div className="pt-2">
                    <Link href={`/focus-room/${room.id}`}>
                      <Button className="w-full" variant="default" disabled={!room.isActive}>
                        🚪 Vào Phòng
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

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


