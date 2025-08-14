/**
 * Question Form Demo Page
 * Comprehensive demo cho question form capabilities
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Alert, AlertDescription } from "@/components/ui";
import { AlertTriangle } from "lucide-react";
import {
  IntegratedQuestionForm,
  // QuestionForm,
  LaTeXEditor
} from "@/components/admin/questions/forms";
import { SimpleQuestionForm } from "@/components/admin/questions/forms/simple-question-form";
import {
  QuestionPreview,
  QuestionValidationPanel
} from "@/components/admin/questions/management";
import { Question, QuestionType, QuestionDifficulty, QuestionStatus, AnswerOption } from "@/lib/types/question";
import { FormQuestion, createSampleFormQuestion, questionToFormQuestion } from "@/lib/types/form-compatibility";

// ===== SAMPLE DATA =====

// Use compatibility layer for form demo
const SAMPLE_FORM_QUESTION: FormQuestion = createSampleFormQuestion();

// Convert to Question type for preview components
const SAMPLE_QUESTION: Question = {
  id: "sample-1",
  questionCodeId: "1A1N1",
  rawContent: "Giải phương trình bậc hai: $ax^2 + bx + c = 0$ với $a \\neq 0$",
  content: "Giải phương trình bậc hai: $ax^2 + bx + c = 0$ với $a \\neq 0$",
  type: QuestionType.MC,
  difficulty: QuestionDifficulty.MEDIUM,
  status: QuestionStatus.PENDING,
  answers: [
    {
      content: "$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$",
      isCorrect: true,
      explanation: "Đây là công thức nghiệm của phương trình bậc hai"
    },
    {
      content: "$x = \\frac{-b \\pm \\sqrt{b^2 + 4ac}}{2a}$",
      isCorrect: false,
      explanation: "Sai dấu trong biệt thức"
    },
    {
      content: "$x = \\frac{b \\pm \\sqrt{b^2 - 4ac}}{2a}$",
      isCorrect: false,
      explanation: "Thiếu dấu âm trước b"
    }
  ] as AnswerOption[],
  explanation: "Phương trình bậc hai có dạng $ax^2 + bx + c = 0$ với $a \\neq 0$",
  solution: "Sử dụng công thức nghiệm: $$x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$$ với $\\Delta = b^2 - 4ac$",
  tag: ["algebra", "quadratic"],
  source: "Sách giáo khoa Toán 9",
  timeLimit: 300,
  points: 2,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  creator: "Demo User",
  usageCount: 0,
  feedback: 0
};

// ===== MAIN COMPONENT =====

export default function QuestionFormDemoPage() {
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [currentQuestion, setCurrentQuestion] = useState<FormQuestion | undefined>(undefined);
  const [submittedData, setSubmittedData] = useState<unknown>(null);
  const [latexContent, setLatexContent] = useState("$f(x) = x^2 + 2x + 1$");
  
  // ===== HANDLERS =====
  
  const handleFormSubmit = async (data: unknown) => {
    console.log('Form submitted:', data);
    setSubmittedData(data);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    alert('Câu hỏi đã được lưu thành công!');
  };
  
  const handleSaveDraft = async (data: unknown) => {
    console.log('Draft saved:', data);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    alert('Bản nháp đã được lưu!');
  };
  
  const handleCancel = () => {
    if (confirm('Bạn có chắc chắn muốn hủy? Dữ liệu chưa lưu sẽ bị mất.')) {
      setCurrentQuestion(undefined);
      setMode('create');
    }
  };
  
  const handleEditSample = () => {
    setCurrentQuestion(SAMPLE_FORM_QUESTION);
    setMode('edit');
  };

  const handleCreateNew = () => {
    setCurrentQuestion(undefined);
    setMode('create');
  };
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Question Form Demo</h1>
        <p className="text-lg text-muted-foreground">
          Comprehensive question creation và editing với LaTeX support
        </p>
      </div>
      
      {/* Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle>🎮 Demo Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant={mode === 'create' ? 'default' : 'outline'}
              onClick={handleCreateNew}
            >
              Tạo câu hỏi mới
            </Button>
            
            <Button
              variant={mode === 'edit' ? 'default' : 'outline'}
              onClick={handleEditSample}
            >
              Chỉnh sửa mẫu
            </Button>
            
            <Badge variant="outline">
              Mode: {mode === 'create' ? 'Tạo mới' : 'Chỉnh sửa'}
            </Badge>
          </div>
          
          {Boolean(submittedData) && (
            <Alert>
              <AlertDescription>
                <strong>Dữ liệu đã submit:</strong>
                <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                  {JSON.stringify(submittedData as Record<string, unknown>, null, 2)}
                </pre>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {/* LaTeX Editor Demo */}
      <Card>
        <CardHeader>
          <CardTitle>✏️ LaTeX Editor Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <LaTeXEditor
            value={latexContent}
            onChange={setLatexContent}
            placeholder="Thử nghiệm LaTeX editor..."
            height="300px"
            showPreview={true}
            showToolbar={true}
            showValidation={true}
          />
        </CardContent>
      </Card>
      
      {/* Simple Question Form */}
      <Card>
        <CardHeader>
          <CardTitle>📝 Simple Question Form (TypeScript Compatible)</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleQuestionForm
            question={currentQuestion}
            mode={mode}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>

      {/* Advanced Question Form (with type issues) */}
      <Card>
        <CardHeader>
          <CardTitle>🔧 Advanced Question Form (Under Development)</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Advanced form components đang được fix TypeScript compatibility issues.
              Sử dụng Simple Form ở trên cho testing.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
      
      {/* Sample Question Preview */}
      <Card>
        <CardHeader>
          <CardTitle>👁️ Question Preview Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <QuestionPreview
            question={SAMPLE_QUESTION}
            showAnswers={true}
            showExplanation={true}
            showMetadata={true}
            showQualityScore={true}
            mode="teacher"
          />
        </CardContent>
      </Card>
      
      {/* Validation Demo */}
      <Card>
        <CardHeader>
          <CardTitle>✅ Validation Panel Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <QuestionValidationPanel
            question={SAMPLE_QUESTION}
            showQualityScore={true}
            showSuggestions={true}
            showDetails={true}
          />
        </CardContent>
      </Card>
      
      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 Features Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded">
              <div className="text-2xl font-bold text-green-600">LaTeX</div>
              <div className="text-sm text-green-700">Real-time rendering</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded">
              <div className="text-2xl font-bold text-blue-600">Validation</div>
              <div className="text-sm text-blue-700">Real-time validation</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded">
              <div className="text-2xl font-bold text-purple-600">Preview</div>
              <div className="text-sm text-purple-700">Live preview</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded">
              <div className="text-2xl font-bold text-orange-600">Forms</div>
              <div className="text-sm text-orange-700">Advanced forms</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded">
              <div className="text-2xl font-bold text-red-600">Answers</div>
              <div className="text-sm text-red-700">Dynamic answers</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded">
              <div className="text-2xl font-bold text-yellow-600">Quality</div>
              <div className="text-sm text-yellow-700">Quality scoring</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded">
            <h4 className="font-semibold mb-2">✨ Key Features:</h4>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• <strong>Real-time LaTeX rendering</strong> với KaTeX integration</li>
              <li>• <strong>Advanced form validation</strong> với Zod schema</li>
              <li>• <strong>Dynamic answer management</strong> với drag-and-drop</li>
              <li>• <strong>Live preview</strong> với teacher và student modes</li>
              <li>• <strong>Quality scoring</strong> và validation feedback</li>
              <li>• <strong>Draft saving</strong> và auto-save functionality</li>
              <li>• <strong>Responsive design</strong> - mobile và desktop friendly</li>
              <li>• <strong>Accessibility</strong> - WCAG compliant</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
