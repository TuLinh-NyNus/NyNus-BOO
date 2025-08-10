/**
 * Question Metadata Component
 * Form fields cho metadata của câu hỏi (code, source, tags)
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
  Badge,
  Textarea,
} from "@/components/ui";

/**
 * Props for QuestionMetadata component
 */
interface QuestionMetadataProps {
  questionCodeId: string;
  onQuestionCodeIdChange: (value: string) => void;
  source: string;
  onSourceChange: (value: string) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  explanation: string;
  onExplanationChange: (value: string) => void;
  errors: Record<string, string>;
}

/**
 * Question Metadata Component
 * Handles question metadata fields
 */
export function QuestionMetadata({
  questionCodeId,
  onQuestionCodeIdChange,
  source,
  onSourceChange,
  tags,
  onTagsChange,
  explanation,
  onExplanationChange,
  errors,
}: QuestionMetadataProps) {
  /**
   * Handle tag input change
   */
  const handleTagsChange = (tagsString: string) => {
    const newTags = tagsString.split(",").map(tag => tag.trim()).filter(tag => tag);
    onTagsChange(newTags);
  };

  return (
    <>
      {/* Question Code and Source */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin bổ sung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="questionCodeId">Mã câu hỏi *</Label>
              <Input
                id="questionCodeId"
                placeholder="VD: 2P5VN"
                value={questionCodeId}
                onChange={(e) => onQuestionCodeIdChange(e.target.value)}
                className={errors.questionCodeId ? "border-red-500" : ""}
              />
              {errors.questionCodeId && (
                <p className="text-sm text-red-500">{errors.questionCodeId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Nguồn</Label>
              <Input
                id="source"
                placeholder="VD: Sách giáo khoa Toán 12"
                value={source}
                onChange={(e) => onSourceChange(e.target.value)}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (phân cách bằng dấu phẩy)</Label>
            <Input
              id="tags"
              placeholder="VD: Hàm số, Cực trị, Lớp 12"
              value={tags.join(", ")}
              onChange={(e) => handleTagsChange(e.target.value)}
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Explanation Section */}
      <Card>
        <CardHeader>
          <CardTitle>Lời giải (tùy chọn)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Nhập lời giải chi tiết..."
            value={explanation}
            onChange={(e) => onExplanationChange(e.target.value)}
            rows={4}
          />
        </CardContent>
      </Card>
    </>
  );
}
