/**
 * Question Answers Component
 * Component quản lý đáp án cho câu hỏi trắc nghiệm
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
  Button,
  Alert,
  Checkbox,
} from "@/components/ui";
import {
  Plus,
  Trash2,
  AlertCircle
} from "lucide-react";

// Import types từ lib/types
import { 
  QuestionType, 
  AnswerOption 
} from "@/lib/types/question";

/**
 * Props for QuestionAnswers component
 */
interface QuestionAnswersProps {
  questionType: QuestionType;
  answers: AnswerOption[];
  onAnswersChange: (answers: AnswerOption[]) => void;
  error?: string;
}

/**
 * Question Answers Component
 * Specialized component cho quản lý đáp án
 */
export function QuestionAnswers({
  questionType,
  answers,
  onAnswersChange,
  error,
}: QuestionAnswersProps) {
  /**
   * Handle answer option change
   */
  const handleAnswerChange = (index: number, field: keyof AnswerOption, value: unknown) => {
    const newAnswers = [...answers];
    newAnswers[index] = { ...newAnswers[index], [field]: value };
    onAnswersChange(newAnswers);
  };

  /**
   * Add new answer option
   */
  const addAnswerOption = () => {
    const newAnswer: AnswerOption = {
      id: `answer-${Date.now()}`,
      content: "",
      isCorrect: false,
    };
    
    onAnswersChange([...answers, newAnswer]);
  };

  /**
   * Remove answer option
   */
  const removeAnswerOption = (index: number) => {
    const newAnswers = answers.filter((_, i) => i !== index);
    onAnswersChange(newAnswers);
  };

  // Don't render for non-MC/TF questions
  if (questionType !== QuestionType.MC && questionType !== QuestionType.TF) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đáp án</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {answers.map((answer, index) => (
          <div key={answer.id} className="flex items-center gap-3 p-3 border rounded-lg">
            <Checkbox
              checked={answer.isCorrect}
              onCheckedChange={(checked) => 
                handleAnswerChange(index, "isCorrect", checked)
              }
            />
            
            <div className="flex-1">
              <Input
                placeholder={`Đáp án ${index + 1}`}
                value={answer.content}
                onChange={(e) => handleAnswerChange(index, "content", e.target.value)}
              />
            </div>

            {questionType === QuestionType.MC && answers.length > 2 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeAnswerOption(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        {questionType === QuestionType.MC && (
          <Button
            type="button"
            variant="outline"
            onClick={addAnswerOption}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm đáp án
          </Button>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <div>{error}</div>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
