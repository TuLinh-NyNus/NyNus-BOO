'use client';

import { Badge } from "@/components/ui/display/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/form/label";
import { Textarea } from "@/components/ui/form/textarea";
import { QuestionIdDetails, SubcountDetails, EditableAnswer, MapIDResult } from '@/lib/types/latex-parser';
import { ExtractedQuestion } from '@/types/question';
import { KaTeXRenderer } from './katex-renderer';

interface LatexPreviewProps {
  extractionResult: ExtractedQuestion | null;
  error: string | null;
  decodedMapID: MapIDResult | null;
  editableQuestionId: string | null;
  editableQuestionIdDetails: QuestionIdDetails | null;
  editableSubcount: SubcountDetails | null;
  editableSource: string | null;
  editableSolution: string | null;
  editableanswers: EditableAnswer[] | null;
  onQuestionIdChange: (value: string) => void;
  onQuestionIdDetailsChange: (field: keyof QuestionIdDetails, value: string) => void;
  onSubcountChange: (field: keyof SubcountDetails, value: string) => void;
  onSourceChange: (value: string) => void;
  onSolutionChange: (value: string) => void;
  onanswersChange: (answers: EditableAnswer[]) => void;
}

/**
 * Component chuyên xử lý preview và rendering của LaTeX extraction results
 * Tách từ LatexExtractor để tăng tính modular
 */
export function LatexPreview({
  extractionResult,
  error,
  decodedMapID,
  editableQuestionId,
  editableQuestionIdDetails,
  editableSubcount,
  editableSource,
  editableSolution,
  editableanswers,
  onQuestionIdChange,
  onQuestionIdDetailsChange,
  onSubcountChange,
  onSourceChange,
  onSolutionChange,
  onanswersChange
}: LatexPreviewProps) {

  // Helper functions cho display
  const getQuestionTypeName = (type: string): string => {
    const typeMap: {[key: string]: string} = {
      'MC': 'Trắc nghiệm',
      'TF': 'Đúng/Sai',
      'SA': 'Trả lời ngắn',
      'ES': 'Tự luận',
      'MT': 'Ghép đôi',
      'OR': 'Sắp xếp',
      'FB': 'Điền vào chỗ trống',
      'multiple-choice': 'Trắc nghiệm',
      'true-false': 'Đúng/Sai',
      'short-answer': 'Trả lời ngắn',
      'essay': 'Tự luận',
      'matching': 'Ghép đôi',
      'ordering': 'Sắp xếp',
      'fill-in-blank': 'Điền vào chỗ trống'
    };
    return typeMap[type] || 'Không xác định';
  };

  const getQuestionTypeColor = (type: string): string => {
    const colorMap: {[key: string]: string} = {
      'multiple-choice': 'bg-blue-500/10 text-blue-600',
      'true-false': 'bg-green-500/10 text-green-600',
      'short-answer': 'bg-yellow-500/10 text-yellow-600',
      'essay': 'bg-purple-500/10 text-purple-600',
      'matching': 'bg-orange-500/10 text-orange-600',
      'ordering': 'bg-pink-500/10 text-pink-600',
      'fill-in-blank': 'bg-indigo-500/10 text-indigo-600'
    };
    return colorMap[type] || 'bg-gray-500/10 text-gray-600';
  };

  const getQuestionTypeIcon = (type: string): string => {
    const iconMap: {[key: string]: string} = {
      'multiple-choice': '🔴',
      'true-false': '✅',
      'short-answer': '✏️',
      'essay': '📝',
      'matching': '🔗',
      'ordering': '📊',
      'fill-in-blank': '⬜'
    };
    return iconMap[type] || '❓';
  };

  const getAnswerTypeColor = (type: string): string => {
    const colorMap: {[key: string]: string} = {
      'multiple-choice': 'bg-blue-500/15 text-blue-600',
      'true-false': 'bg-green-500/15 text-green-600',
      'short-answer': 'bg-yellow-500/15 text-yellow-600',
      'essay': 'bg-purple-500/15 text-purple-600',
      'matching': 'bg-orange-500/15 text-orange-600',
      'ordering': 'bg-pink-500/15 text-pink-600',
      'fill-in-blank': 'bg-indigo-500/15 text-indigo-600'
    };
    return colorMap[type] || 'bg-gray-500/15 text-gray-600';
  };

  const getAnswerHighlightColor = (type: string): string => {
    const colorMap: {[key: string]: string} = {
      'multiple-choice': 'bg-blue-50/10',
      'true-false': 'bg-green-50/10',
      'short-answer': 'bg-yellow-50/10',
      'essay': 'bg-purple-50/10',
      'matching': 'bg-orange-50/10',
      'ordering': 'bg-pink-50/10',
      'fill-in-blank': 'bg-indigo-50/10'
    };
    return colorMap[type] || 'bg-gray-50/10';
  };

  // Handle answer changes
  const handleAnswerChange = (answerId: string, field: keyof EditableAnswer, value: string | boolean) => {
    if (!editableanswers) return;

    const updatedanswers = editableanswers.map(answer => 
      answer.id === answerId 
        ? { ...answer, [field]: value }
        : answer
    );
    onanswersChange(updatedanswers);
  };

  // Add new answer
  const addNewAnswer = () => {
    if (!editableanswers) return;

    const newAnswer: EditableAnswer = {
      id: `answer-${Date.now()}`,
      content: '',
      isCorrect: false
    };

    onanswersChange([...editableanswers, newAnswer]);
  };

  // Remove answer
  const removeAnswer = (answerId: string) => {
    if (!editableanswers) return;

    const updatedanswers = editableanswers.filter(answer => answer.id !== answerId);
    onanswersChange(updatedanswers);
  };

  // Render error state
  if (error) {
    return (
      <div className="h-full flex flex-col LatexPreview">
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-600">
          <div className="font-medium mb-2">Lỗi phân tích LaTeX:</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    );
  }

  // Render empty state
  if (!extractionResult) {
    return (
      <div className="h-full flex flex-col LatexPreview">
        <div className="p-8 text-center text-gray-500">
          <div className="text-lg font-medium mb-2">Chưa có dữ liệu LaTeX</div>
          <div className="text-sm">Nhập nội dung LaTeX để xem kết quả trích xuất</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col LatexPreview">
      <div className="space-y-3 overflow-y-auto flex-grow pb-4 max-h-[400px]">
        {/* Question Type and ID Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* 1. Loại câu hỏi */}
          <div className="p-2 border rounded">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Loại câu hỏi:</span>
              <Badge className={getQuestionTypeColor(extractionResult.type)}>
                {getQuestionTypeIcon(extractionResult.type)} {getQuestionTypeName(extractionResult.type)}
              </Badge>
            </div>
          </div>

          {/* 2. QuestionID */}
          <div className="p-2 border rounded">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">QuestionID:</span>
              {editableQuestionId ? (
                <Badge variant="outline">{editableQuestionId}</Badge>
              ) : (
                <span className="text-gray-500 italic text-sm">Không tìm thấy</span>
              )}
            </div>
          </div>
        </div>

        {/* 3. Nội dung câu hỏi */}
        <div className="p-2 border rounded">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Nội dung câu hỏi:</span>
            <Badge variant="outline" className="text-xs">{extractionResult.content.length} ký tự</Badge>
          </div>
          <div className="bg-muted p-2 rounded-md whitespace-pre-wrap overflow-auto max-h-20 text-sm">
            {extractionResult.content}
          </div>
        </div>

        {/* 4. Đáp án */}
        {extractionResult.answers && extractionResult.answers.length > 0 && (
          <div className="p-2 border rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Đáp án:</span>
              <Badge variant="outline" className="text-xs">
                {extractionResult.answers.length} đáp án
              </Badge>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {extractionResult.answers.map((answer, index) => (
                <div 
                  key={answer.id || index} 
                  className={`p-2 rounded text-sm border-l-2 ${
                    answer.isCorrect 
                      ? 'border-green-500 bg-green-50/50' 
                      : 'border-gray-300 bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex-1">
                      <KaTeXRenderer content={answer.content || `Đáp án ${index + 1}`} />
                    </span>
                    {answer.isCorrect && (
                      <Badge className={getAnswerTypeColor(extractionResult.type)} size="sm">
                        Đúng
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Thông tin bổ sung */}
        <Accordion type="single" collapsible className="w-full">
          {/* QuestionID Details */}
          {editableQuestionIdDetails && (
            <AccordionItem value="questionid-details">
              <AccordionTrigger className="text-sm">Chi tiết QuestionID</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="fullId" className="text-xs">Full ID</Label>
                      <Input
                        id="fullId"
                        value={editableQuestionIdDetails.fullId || ''}
                        onChange={(e) => onQuestionIdDetailsChange('fullId', e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>
                    <div>
                      <Label htmlFor="format" className="text-xs">Format</Label>
                      <Input
                        id="format"
                        value={editableQuestionIdDetails.format || ''}
                        onChange={(e) => onQuestionIdDetailsChange('format', e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Subcount Details */}
          {editableSubcount && (
            <AccordionItem value="subcount-details">
              <AccordionTrigger className="text-sm">Chi tiết Subcount</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="prefix" className="text-xs">Prefix</Label>
                      <Input
                        id="prefix"
                        value={editableSubcount.prefix || ''}
                        onChange={(e) => onSubcountChange('prefix', e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>
                    <div>
                      <Label htmlFor="number" className="text-xs">Number</Label>
                      <Input
                        id="number"
                        value={editableSubcount.number || ''}
                        onChange={(e) => onSubcountChange('number', e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subcountFullId" className="text-xs">Full ID</Label>
                      <Input
                        id="subcountFullId"
                        value={editableSubcount.fullId || ''}
                        onChange={(e) => onSubcountChange('fullId', e.target.value)}
                        className="text-xs h-8"
                      />
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Source */}
          {editableSource && (
            <AccordionItem value="source">
              <AccordionTrigger className="text-sm">Nguồn</AccordionTrigger>
              <AccordionContent>
                <Textarea
                  value={editableSource}
                  onChange={(e) => onSourceChange(e.target.value)}
                  className="text-xs min-h-[60px]"
                  placeholder="Nguồn câu hỏi..."
                />
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Solution */}
          {editableSolution && (
            <AccordionItem value="solution">
              <AccordionTrigger className="text-sm">Lời giải</AccordionTrigger>
              <AccordionContent>
                <Textarea
                  value={editableSolution}
                  onChange={(e) => onSolutionChange(e.target.value)}
                  className="text-xs min-h-[80px]"
                  placeholder="Lời giải chi tiết..."
                />
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Decoded MapID */}
          {decodedMapID && (
            <AccordionItem value="decoded-mapid">
              <AccordionTrigger className="text-sm">Thông tin MapID</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-blue-50 rounded">
                      <div className="font-medium">Lớp:</div>
                      <div>{decodedMapID.grade?.description || 'N/A'}</div>
                    </div>
                    <div className="p-2 bg-green-50 rounded">
                      <div className="font-medium">Môn học:</div>
                      <div>{decodedMapID.subject?.description || 'N/A'}</div>
                    </div>
                    <div className="p-2 bg-yellow-50 rounded">
                      <div className="font-medium">Chương:</div>
                      <div>{decodedMapID.chapter?.description || 'N/A'}</div>
                    </div>
                    <div className="p-2 bg-purple-50 rounded">
                      <div className="font-medium">Mức độ:</div>
                      <div>{decodedMapID.difficulty?.description || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>
    </div>
  );
}
