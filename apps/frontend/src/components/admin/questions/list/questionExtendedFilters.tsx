/**
 * Question Extended Filters Component
 * Bộ lọc mở rộng cho câu hỏi
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
} from "@/components/ui";
import { Calendar, User } from "lucide-react";

// Import types từ lib/types
import type { QuestionFilters } from "@/types/question";

/**
 * Props for QuestionExtendedFilters component
 */
interface QuestionExtendedFiltersProps {
  filters: QuestionFilters & {
    grade?: string;
    subject?: string;
    level?: string;
    creator?: string;
    dateFrom?: string;
    dateTo?: string;
    usageRange?: string;
    pointsRange?: string;
  };
  onFilterChange: (key: string, value: unknown) => void;
  onToggleExtended: () => void;
  showExtended: boolean;
}

/**
 * Question Extended Filters Component
 * Advanced filtering options
 */
export function QuestionExtendedFilters({
  filters,
  onFilterChange,
  onToggleExtended,
  showExtended,
}: QuestionExtendedFiltersProps) {
  if (!showExtended) {
    return (
      <Button variant="outline" onClick={onToggleExtended}>
        Bộ lọc nâng cao
      </Button>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Bộ lọc nâng cao</CardTitle>
          <Button variant="ghost" size="sm" onClick={onToggleExtended}>
            Thu gọn
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Grade and Subject Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Lớp</Label>
            <Select
              value={filters.grade || ""}
              onValueChange={(value) => onFilterChange("grade", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn lớp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả lớp</SelectItem>
                <SelectItem value="10">Lớp 10</SelectItem>
                <SelectItem value="11">Lớp 11</SelectItem>
                <SelectItem value="12">Lớp 12</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Môn học</Label>
            <Select
              value={filters.subject || "all"}
              onValueChange={(value) => onFilterChange("subject", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn môn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả môn</SelectItem>
                <SelectItem value="P">Toán</SelectItem>
                <SelectItem value="L">Vật lý</SelectItem>
                <SelectItem value="H">Hóa học</SelectItem>
                <SelectItem value="S">Sinh học</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Creator and Date Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="creator">Người tạo</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="creator"
                placeholder="Tên người tạo..."
                value={filters.creator || ""}
                onChange={(e) => onFilterChange("creator", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateRange">Khoảng thời gian</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="dateRange"
                type="date"
                value={filters.dateFrom || ""}
                onChange={(e) => onFilterChange("dateFrom", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Usage and Points Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Số lần sử dụng</Label>
            <Select
              value={filters.usageRange || "all"}
              onValueChange={(value) => onFilterChange("usageRange", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn khoảng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="0">Chưa sử dụng</SelectItem>
                <SelectItem value="1-10">1-10 lần</SelectItem>
                <SelectItem value="11-50">11-50 lần</SelectItem>
                <SelectItem value="50+">Trên 50 lần</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Điểm số</Label>
            <Select
              value={filters.pointsRange || "all"}
              onValueChange={(value) => onFilterChange("pointsRange", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn khoảng điểm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="1-5">1-5 điểm</SelectItem>
                <SelectItem value="6-10">6-10 điểm</SelectItem>
                <SelectItem value="11-20">11-20 điểm</SelectItem>
                <SelectItem value="20+">Trên 20 điểm</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
