"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { FocusRoomService } from "@/services/grpc/focus-room.service";
import { useToast } from "@/hooks/ui/use-toast";

/**
 * Create Focus Room Page
 * Tạo phòng học mới
 */
export default function CreateRoomPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    roomType: "public",
    maxParticipants: "50",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên phòng",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Call API to create room
      const room = await FocusRoomService.createRoom({
        name: formData.name,
        description: formData.description,
        roomType: formData.roomType,
        maxParticipants: parseInt(formData.maxParticipants),
      });

      toast({
        title: "✅ Thành công!",
        description: `Đã tạo phòng "${room.name}"`,
      });

      // Redirect to the created room
      router.push(`/focus-room/${room.id}`);
    } catch (error) {
      console.error("Failed to create room:", error);
      toast({
        title: "❌ Lỗi",
        description: "Không thể tạo phòng. Vui lòng thử lại!",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      {/* Back Button */}
      <Link href="/focus-room" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay lại
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🏠 Tạo Phòng Học Mới</h1>
        <p className="text-muted-foreground">
          Tạo không gian học tập riêng cho bạn và nhóm của bạn
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Thông Tin Phòng</CardTitle>
          <CardDescription>
            Điền các thông tin cơ bản về phòng học của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Room Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Tên Phòng <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="VD: Luyện Thi Đại Học 2025"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                Tên phòng nên ngắn gọn và dễ hiểu
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Mô Tả
              </Label>
              <Textarea
                id="description"
                placeholder="Mô tả ngắn gọn về mục đích và quy tắc của phòng..."
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/500 ký tự
              </p>
            </div>

            {/* Room Type */}
            <div className="space-y-2">
              <Label htmlFor="roomType">
                Loại Phòng <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.roomType}
                onValueChange={(value) => handleChange("roomType", value)}
              >
                <SelectTrigger id="roomType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    🌐 Công khai - Ai cũng có thể vào
                  </SelectItem>
                  <SelectItem value="private">
                    🔒 Riêng tư - Chỉ mời mới vào được
                  </SelectItem>
                  <SelectItem value="class">
                    🎓 Lớp học - Theo class ID
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Max Participants */}
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">
                Số Người Tối Đa
              </Label>
              <Select
                value={formData.maxParticipants}
                onValueChange={(value) => handleChange("maxParticipants", value)}
              >
                <SelectTrigger id="maxParticipants">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 người</SelectItem>
                  <SelectItem value="25">25 người</SelectItem>
                  <SelectItem value="50">50 người (mặc định)</SelectItem>
                  <SelectItem value="100">100 người</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Số lượng người có thể tham gia cùng lúc
              </p>
            </div>

            {/* Timer Settings Info */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-sm">⏰ Cài Đặt Timer Mặc Định</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p>• Focus: 25 phút</p>
                <p>• Short Break: 5 phút</p>
                <p>• Long Break: 15 phút</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Bạn có thể tùy chỉnh sau khi tạo phòng
                </p>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                size="lg"
                disabled={loading || !formData.name}
                className="flex-1"
              >
                {loading ? "Đang tạo..." : "🚀 Tạo Phòng"}
              </Button>
              <Link href="/focus-room" className="flex-1">
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  Hủy
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">💡 Mẹo Tạo Phòng Hiệu Quả</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>✓ Đặt tên phòng rõ ràng, dễ tìm kiếm</p>
          <p>✓ Viết mô tả ngắn gọn về mục đích và quy tắc</p>
          <p>✓ Chọn loại phòng phù hợp với nhóm của bạn</p>
          <p>✓ Điều chỉnh số người tối đa để phù hợp</p>
        </CardContent>
      </Card>
    </div>
  );
}


