/**
 * Question Preview Component
 * Comprehensive preview component với LaTeX rendering và interactive features
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  // Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Alert,
  AlertDescription,
} from "@/components/ui";
import {
  Eye,
  EyeOff,
  Clock,
  User,
  Hash,
  Star,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BookOpen,
  Target,
  Zap,
  Copy,
  // Download,
  // Share2
} from "lucide-react";

// Import LaTeX components
import { QuestionLaTeXContent, LaTeXContent } from "@/components/latex";

// Import types
import { Question } from "@/types/question";
import { calculateQuestionQuality } from "@/lib/utils/question-management";

// ===== TYPES =====

export interface QuestionPreviewProps {
  question: Question;
  showAnswers?: boolean;
  showExplanation?: boolean;
  showMetadata?: boolean;
  showQualityScore?: boolean;
  interactive?: boolean;
  mode?: 'student' | 'teacher' | 'admin';
  onAnswerSelect?: (answerId: string) => void;
  onAction?: (action: string, data?: { questionId: string; actionType: string }) => void;
  className?: string;
}

// ===== HELPER FUNCTIONS =====

/**
 * Get question type display name
 */
function getQuestionTypeDisplay(type?: string) {
  const typeMap = {
    'MULTIPLE_CHOICE': 'Trắc nghiệm',
    'TRUE_FALSE': 'Đúng/Sai',
    'SHORT_ANSWER': 'Trả lời ngắn',
    'ESSAY': 'Tự luận',
    'MATCHING': 'Ghép đôi'
  };
  return typeMap[type as keyof typeof typeMap] || type || 'Không xác định';
}

/**
 * Get difficulty display
 */
function getDifficultyDisplay(difficulty?: string) {
  const difficultyMap = {
    'EASY': { label: 'Dễ', color: 'bg-green-100 text-green-800' },
    'MEDIUM': { label: 'Trung bình', color: 'bg-yellow-100 text-yellow-800' },
    'HARD': { label: 'Khó', color: 'bg-red-100 text-red-800' }
  };
  return difficultyMap[difficulty as keyof typeof difficultyMap] || 
    { label: difficulty || 'Chưa xác định', color: 'bg-gray-100 text-gray-800' };
}

/**
 * Get status display
 */
function getStatusDisplay(status?: string) {
  const statusMap = {
    'ACTIVE': { label: 'Hoạt động', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    'INACTIVE': { label: 'Không hoạt động', color: 'bg-gray-100 text-gray-800', icon: XCircle },
    'DRAFT': { label: 'Bản nháp', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
    'ARCHIVED': { label: 'Lưu trữ', color: 'bg-red-100 text-red-800', icon: XCircle }
  };
  return statusMap[status as keyof typeof statusMap] || 
    { label: status || 'Không xác định', color: 'bg-gray-100 text-gray-800', icon: AlertTriangle };
}

// ===== MAIN COMPONENT =====

export function QuestionPreview({
  question,
  showAnswers = false,
  showExplanation = false,
  showMetadata = true,
  showQualityScore = false,
  interactive = false,
  mode = 'teacher',
  onAnswerSelect,
  onAction,
  className = ""
}: QuestionPreviewProps) {
  // ===== STATE =====
  
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [showAnswersState, setShowAnswersState] = useState(showAnswers);
  const [showExplanationState, setShowExplanationState] = useState(showExplanation);
  
  // ===== COMPUTED VALUES =====
  
  const qualityScore = useMemo(() => 
    calculateQuestionQuality(question),
    [question]
  );
  
  const difficultyDisplay = getDifficultyDisplay(question.difficulty);
  const statusDisplay = getStatusDisplay(question.status);
  const StatusIcon = statusDisplay.icon;
  
  // ===== HANDLERS =====
  
  const handleAnswerSelect = (answerId: string) => {
    if (!interactive) return;
    
    setSelectedAnswerId(answerId);
    onAnswerSelect?.(answerId);
  };
  
  const handleAction = (action: string, data?: { questionId: string; actionType: string }) => {
    onAction?.(action, data);
  };
  
  // ===== RENDER HELPERS =====
  
  /**
   * Render question metadata
   */
  const renderMetadata = () => {
    if (!showMetadata) return null;
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Mã câu hỏi</div>
          <div className="flex items-center gap-1">
            <Hash className="h-3 w-3" />
            <span className="font-mono text-sm">{question.questionCodeId}</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Loại</div>
          <Badge variant="outline" className="text-xs">
            {getQuestionTypeDisplay(question.type)}
          </Badge>
        </div>
        
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Độ khó</div>
          <Badge className={`text-xs ${difficultyDisplay.color}`}>
            {difficultyDisplay.label}
          </Badge>
        </div>
        
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Trạng thái</div>
          <Badge className={`text-xs ${statusDisplay.color}`}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusDisplay.label}
          </Badge>
        </div>
        
        {question.creator && (
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Người tạo</div>
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="text-sm">{question.creator}</span>
            </div>
          </div>
        )}
        
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Ngày tạo</div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span className="text-sm">
              {new Date(question.createdAt).toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>
        
        {question.usageCount !== undefined && (
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Lượt sử dụng</div>
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span className="text-sm font-mono">{question.usageCount}</span>
            </div>
          </div>
        )}
        
        {showQualityScore && (
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Chất lượng</div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500" />
              <span className="text-sm font-bold">{qualityScore}/100</span>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  /**
   * Render question answers
   */
  const renderAnswers = () => {
    if (!question.answers || question.answers.length === 0) {
      return (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Câu hỏi chưa có đáp án
          </AlertDescription>
        </Alert>
      );
    }
    
    return (
      <div className="space-y-3">
        {question.answers.map((answer, index) => {
          // Type guard for AnswerOption
          const answerOption = answer as { id: string; content: string; isCorrect: boolean; explanation?: string };
          const answerId = answerOption.id || `answer-${index}`;
          const answerContent = answerOption.content || `Đáp án ${index + 1}`;
          const isCorrect = answerOption.isCorrect || false;
          const answerExplanation = answerOption.explanation;

          const isSelected = selectedAnswerId === answerId;
          const showCorrectness = showAnswersState && mode !== 'student';

          return (
            <div
              key={answerId}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              } ${
                showCorrectness && isCorrect ? 'border-green-500 bg-green-50' : ''
              } ${
                showCorrectness && !isCorrect && isSelected ? 'border-red-500 bg-red-50' : ''
              }`}
              onClick={() => handleAnswerSelect(answerId)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-medium">
                  {String.fromCharCode(65 + index)}
                </div>
                
                <div className="flex-1">
                  <LaTeXContent
                    content={answerContent}
                    safeMode={true}
                    className="text-sm"
                  />

                  {answerExplanation && showAnswersState && (
                    <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                      <LaTeXContent
                        content={answerExplanation}
                        safeMode={true}
                      />
                    </div>
                  )}
                </div>
                
                {showCorrectness && (
                  <div className="flex-shrink-0">
                    {isCorrect ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  /**
   * Render explanation
   */
  const renderExplanation = () => {
    if (!question.explanation && !question.solution) {
      return (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Câu hỏi chưa có lời giải
          </AlertDescription>
        </Alert>
      );
    }
    
    return (
      <div className="space-y-4">
        {question.explanation && (
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Giải thích
            </h4>
            <div className="p-4 bg-blue-50 rounded-lg">
              <LaTeXContent 
                content={question.explanation}
                safeMode={true}
                expandable={true}
              />
            </div>
          </div>
        )}
        
        {question.solution && (
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Lời giải chi tiết
            </h4>
            <div className="p-4 bg-green-50 rounded-lg">
              <LaTeXContent 
                content={question.solution}
                safeMode={true}
                expandable={true}
              />
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // ===== MAIN RENDER =====
  
  return (
    <Card className={`question-preview ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            <span>Xem trước câu hỏi</span>
          </div>
          
          <div className="flex items-center gap-2">
            {mode !== 'student' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAnswersState(!showAnswersState)}
                >
                  {showAnswersState ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showAnswersState ? 'Ẩn đáp án' : 'Hiện đáp án'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExplanationState(!showExplanationState)}
                >
                  <BookOpen className="h-4 w-4" />
                  Lời giải
                </Button>
              </>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('copy')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Metadata */}
        {renderMetadata()}
        
        {/* Question content */}
        <div>
          <h3 className="font-medium mb-3">Nội dung câu hỏi</h3>
          <div className="p-4 border rounded-lg bg-white">
            <QuestionLaTeXContent 
              content={question.content || 'Không có nội dung'}
              expandable={true}
            />
          </div>
        </div>
        
        {/* Tabs for answers and explanation */}
        <Tabs defaultValue="answers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="answers">
              Đáp án ({question.answers?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="explanation">
              Lời giải
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="answers" className="mt-4">
            {renderAnswers()}
          </TabsContent>
          
          <TabsContent value="explanation" className="mt-4">
            {showExplanationState ? renderExplanation() : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Nhấn &quot;Lời giải&quot; để xem giải thích chi tiết
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// ===== SPECIALIZED VARIANTS =====

/**
 * Student preview mode
 */
export function StudentQuestionPreview(props: Omit<QuestionPreviewProps, 'mode'>) {
  return (
    <QuestionPreview
      {...props}
      mode="student"
      showAnswers={false}
      showExplanation={false}
      interactive={true}
    />
  );
}

/**
 * Teacher preview mode
 */
export function TeacherQuestionPreview(props: Omit<QuestionPreviewProps, 'mode'>) {
  return (
    <QuestionPreview
      {...props}
      mode="teacher"
      showAnswers={true}
      showExplanation={true}
      showQualityScore={true}
    />
  );
}

/**
 * Compact preview
 */
export function CompactQuestionPreview(props: QuestionPreviewProps) {
  return (
    <QuestionPreview
      {...props}
      showMetadata={false}
      showQualityScore={false}
      className={`compact-preview ${props.className || ''}`}
    />
  );
}
