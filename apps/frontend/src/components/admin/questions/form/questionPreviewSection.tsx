/**
 * Question Preview Section Component
 * Preview section cho form câu hỏi
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
} from "@/components/ui";
import { CheckCircle } from "lucide-react";

// Import types từ lib/types
import { 
  QuestionType,
  AnswerOption 
} from "@/lib/types/question";

/**
 * Props for QuestionPreviewSection component
 */
interface QuestionPreviewSectionProps {
  content: string;
  type: QuestionType;
  answers: AnswerOption[];
  explanation: string;
}

/**
 * Question Preview Section Component
 * Shows preview of question content
 */
export function QuestionPreviewSection({
  content,
  type,
  answers,
  explanation,
}: QuestionPreviewSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Xem trước</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <h4 className="font-medium mb-2">Câu hỏi:</h4>
            <p>{content || "Chưa có nội dung"}</p>
          </div>

          {(type === QuestionType.MC || type === QuestionType.TF) && 
           answers && answers.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Đáp án:</h4>
              <div className="space-y-2">
                {answers.map((answer, index) => (
                  <div key={answer.id} className="flex items-center gap-2">
                    <span className="font-mono text-sm">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className={answer.isCorrect ? "font-medium text-green-600" : ""}>
                      {answer.content || `Đáp án ${index + 1}`}
                    </span>
                    {answer.isCorrect && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {explanation && (
            <div>
              <h4 className="font-medium mb-2">Lời giải:</h4>
              <p className="text-sm text-muted-foreground">{explanation}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
