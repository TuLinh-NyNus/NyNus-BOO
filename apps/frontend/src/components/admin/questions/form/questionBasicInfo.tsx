/**
 * Question Basic Info Component
 * Form fields cho thông tin cơ bản của câu hỏi
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
  Textarea,
} from "@/components/ui";

// Import types từ lib/types
import { 
  QuestionType, 
  QuestionDifficulty 
} from "@/lib/types/question";

/**
 * Props for QuestionBasicInfo component
 */
interface QuestionBasicInfoProps {
  content: string;
  onContentChange: (value: string) => void;
  type: QuestionType;
  onTypeChange: (value: QuestionType) => void;
  difficulty: QuestionDifficulty;
  onDifficultyChange: (value: QuestionDifficulty) => void;
  points: number;
  onPointsChange: (value: number) => void;
  errors: Record<string, string>;
}

/**
 * Question Basic Info Component
 * Handles basic question information fields
 */
export function QuestionBasicInfo({
  content,
  onContentChange,
  type,
  onTypeChange,
  difficulty,
  onDifficultyChange,
  points,
  onPointsChange,
  errors,
}: QuestionBasicInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin cơ bản</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Question Content */}
        <div className="space-y-2">
          <Label htmlFor="content">Nội dung câu hỏi *</Label>
          <Textarea
            id="content"
            placeholder="Nhập nội dung câu hỏi..."
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            className={errors.content ? "border-red-500" : ""}
            rows={4}
          />
          {errors.content && (
            <p className="text-sm text-red-500">{errors.content}</p>
          )}
        </div>

        {/* Question Type and Difficulty */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Loại câu hỏi *</Label>
            <Select
              value={type}
              onValueChange={(value) => onTypeChange(value as QuestionType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={QuestionType.MC}>Trắc nghiệm</SelectItem>
                <SelectItem value={QuestionType.TF}>Đúng/Sai</SelectItem>
                <SelectItem value={QuestionType.SA}>Trả lời ngắn</SelectItem>
                <SelectItem value={QuestionType.ES}>Tự luận</SelectItem>
                <SelectItem value={QuestionType.MA}>Ghép đôi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Độ khó</Label>
            <Select
              value={difficulty}
              onValueChange={(value) => onDifficultyChange(value as QuestionDifficulty)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={QuestionDifficulty.EASY}>Dễ</SelectItem>
                <SelectItem value={QuestionDifficulty.MEDIUM}>Trung bình</SelectItem>
                <SelectItem value={QuestionDifficulty.HARD}>Khó</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="points">Điểm</Label>
            <Input
              id="points"
              type="number"
              min="1"
              max="100"
              value={points}
              onChange={(e) => onPointsChange(parseInt(e.target.value) || 10)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
