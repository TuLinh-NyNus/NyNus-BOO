'use client';

import { Edit, Info, BookOpen, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState, useEffect, useCallback, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/display/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/overlay/tooltip";
import logger from '@/lib/utils/logger';

// Types
interface QuestionIDField {
  value?: string;
  description?: string;
  id?: string;
  name?: string;
  level?: number;
}

interface QuestionID {
  format?: string;
  fullId?: string;
  grade?: QuestionIDField;
  subject?: QuestionIDField;
  chapter?: QuestionIDField | null;
  level?: QuestionIDField;
  difficulty?: QuestionIDField;
  lesson?: QuestionIDField | null;
  form?: QuestionIDField;
  [key: string]: unknown;
}

interface UnifiedQuestionIDInfoProps {
  questionID: QuestionID;
  mode?: 'basic' | 'detailed' | 'meaning';
  onEdit?: () => void;
  showEditButton?: boolean;
  className?: string;
}

/**
 * Unified QuestionID Info Component
 * Consolidates QuestionIDMeaning, QuestionIDDetailedMeaning, and QuestionIDInfo
 */
const UnifiedQuestionIDInfoComponent = React.memo(function UnifiedQuestionIDInfo({
  questionID,
  mode = 'detailed',
  onEdit,
  showEditButton = false,
  className = ''
}: UnifiedQuestionIDInfoProps) {
  const [showEditBtn, setShowEditBtn] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mapIDDetails, setMapIDDetails] = useState<any>(null);

  // Check if we have basic info - memoized
  const hasBasicInfo = useMemo(() =>
    questionID.grade?.value &&
    questionID.subject?.value &&
    questionID.chapter?.value &&
    questionID.level?.value,
    [questionID.grade?.value, questionID.subject?.value, questionID.chapter?.value, questionID.level?.value]
  );

  // Create ID from parameters - memoized
  const createID = useCallback(() => {
    if (!hasBasicInfo) return 'ID chưa đủ thông tin';

    let id = `${questionID.grade?.value}${questionID.subject?.value}${questionID.chapter?.value}${questionID.level?.value}`;

    if (questionID.lesson?.value) {
      id += questionID.lesson.value;
    }

    if (questionID.form?.value) {
      id += `-${questionID.form.value}`;
    }

    return id;
  }, [hasBasicInfo, questionID.grade?.value, questionID.subject?.value, questionID.chapter?.value, questionID.level?.value, questionID.lesson?.value, questionID.form?.value]);

  // Create formatted ID - memoized
  const createFormattedID = useCallback(() => {
    if (!hasBasicInfo) return 'ID chưa đủ thông tin';

    const parts = [
      questionID.grade?.value,
      questionID.subject?.value,
      questionID.chapter?.value,
      questionID.level?.value,
      questionID.lesson?.value || '',
    ];

    let id = parts.join('-');

    if (questionID.form?.value) {
      id += `-${questionID.form.value}`;
    }

    return id;
  }, [hasBasicInfo, questionID.grade?.value, questionID.subject?.value, questionID.chapter?.value, questionID.level?.value, questionID.lesson?.value, questionID.form?.value]);

  // Load MapID details
  useEffect(() => {
    const loadMapIDDetails = async () => {
      if (!hasBasicInfo) return;

      try {
        // Mock MapID details for frontend-only app
        const mockDetails = {
          grade: { code: questionID.grade?.value, description: questionID.grade?.description || 'Lớp 12' },
          subject: { code: questionID.subject?.value, description: questionID.subject?.description || 'Toán' },
          chapter: { code: questionID.chapter?.value, description: questionID.chapter?.description || 'Hàm số' },
          difficulty: { code: questionID.level?.value, description: questionID.level?.description || 'Trung bình' },
          lesson: { code: questionID.lesson?.value, description: questionID.lesson?.description || 'Khái niệm hàm số' },
          form: questionID.form?.value ? { code: questionID.form.value, description: questionID.form.label || form.description || 'Trắc nghiệm' } : null
        };
        setMapIDDetails(mockDetails);
      } catch (error) {
        logger.error('Lỗi khi tải thông tin Map ID:', error);
      }
    };

    loadMapIDDetails();
  }, [questionID, hasBasicInfo]);

  if (!hasBasicInfo) {
    return (
      <div className={`w-full ${className}`}>
        <div className="p-3 border border-slate-200 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-slate-600">
              Điền đầy đủ các trường để xem thông tin QuestionID
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Basic mode - simple display
  if (mode === 'basic') {
    return (
      <div className={`w-full ${className}`}>
        <div className="p-3 border border-slate-200 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {createID()}
            </Badge>
            <span className="text-sm text-muted-foreground">→</span>
            <span className="text-sm text-slate-600">
              {mapIDDetails?.grade?.description} - {mapIDDetails?.subject?.description}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Detailed mode - full component
  return (
    <div className={`w-full ${className}`}
         onMouseEnter={() => setShowEditBtn(true)}
         onMouseLeave={() => setShowEditBtn(false)}>
      <Card className="border-slate-300">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">
              {mode === 'meaning' ? 'Ý nghĩa QuestionID' : 'Thông tin QuestionID'}
            </CardTitle>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDetails(!showDetails)}
                      className="h-8 px-2 text-muted-foreground hover:text-primary"
                    >
                      <BookOpen className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Xem chi tiết từ Map ID.tex</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {(showEditBtn || showEditButton) && onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEdit}
                  className="h-8 px-2 text-muted-foreground hover:text-primary"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Chỉnh sửa
                </Button>
              )}
            </div>
          </div>
          <CardDescription>
            Thông tin chi tiết về các tham số trong QuestionID
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="text-base px-3 py-1">
              {createID()}
            </Badge>
            <span className="text-sm text-muted-foreground">→</span>
            <Badge variant="outline" className="text-base px-3 py-1">
              {createFormattedID()}
            </Badge>
          </div>

          <div className="space-y-3">
            {/* Grade */}
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="min-w-[30px] text-center mt-0.5">
                {questionID.grade?.value || '?'}
              </Badge>
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-sm font-medium">Lớp:</span>
                  <span className="text-sm text-slate-600 ml-2">
                    {questionID.grade?.description || mapIDDetails?.grade?.description || 'Chưa xác định'}
                  </span>
                </div>
                {showDetails && mapIDDetails?.grade && (
                  <div className="mt-1 text-xs text-slate-500 bg-slate-50 p-2 rounded-md">
                    <p><strong>Tham số 1:</strong> Lớp</p>
                    <p><strong>Giá trị:</strong> {questionID.grade?.value} - {mapIDDetails.grade.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Subject */}
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="min-w-[30px] text-center mt-0.5">
                {questionID.subject?.value || '?'}
              </Badge>
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-sm font-medium">Môn học:</span>
                  <span className="text-sm text-slate-600 ml-2">
                    {questionID.subject?.description || mapIDDetails?.subject?.description || 'Chưa xác định'}
                  </span>
                </div>
                {showDetails && mapIDDetails?.subject && (
                  <div className="mt-1 text-xs text-slate-500 bg-slate-50 p-2 rounded-md">
                    <p><strong>Tham số 2:</strong> Môn</p>
                    <p><strong>Giá trị:</strong> {questionID.subject?.value} - {mapIDDetails.subject.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chapter */}
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="min-w-[30px] text-center mt-0.5">
                {questionID.chapter?.value || '?'}
              </Badge>
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-sm font-medium">Chương:</span>
                  <span className="text-sm text-slate-600 ml-2">
                    {questionID.chapter?.description || mapIDDetails?.chapter?.description || 'Chưa xác định'}
                  </span>
                </div>
                {showDetails && mapIDDetails?.chapter && (
                  <div className="mt-1 text-xs text-slate-500 bg-slate-50 p-2 rounded-md">
                    <p><strong>Tham số 3:</strong> Chương</p>
                    <p><strong>Giá trị:</strong> {questionID.chapter?.value} - {mapIDDetails.chapter.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Level/Difficulty */}
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="min-w-[30px] text-center mt-0.5">
                {questionID.level?.value || '?'}
              </Badge>
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-sm font-medium">Độ khó:</span>
                  <span className="text-sm text-slate-600 ml-2">
                    {questionID.level?.description || mapIDDetails?.difficulty?.description || 'Chưa xác định'}
                  </span>
                </div>
                {showDetails && mapIDDetails?.difficulty && (
                  <div className="mt-1 text-xs text-slate-500 bg-slate-50 p-2 rounded-md">
                    <p><strong>Tham số 4:</strong> Mức độ</p>
                    <p><strong>Giá trị:</strong> {questionID.level?.value} - {mapIDDetails.difficulty.description}</p>
                    <p className="mt-1">
                      <strong>Các mức độ:</strong> N (Nhận biết), H (Thông Hiểu), V (Vận dụng), C (Vận dụng Cao)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Lesson */}
            {questionID.lesson?.value && (
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="min-w-[30px] text-center mt-0.5">
                  {questionID.lesson.value}
                </Badge>
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="text-sm font-medium">Bài học:</span>
                    <span className="text-sm text-slate-600 ml-2">
                      {questionID.lesson.description || mapIDDetails?.lesson?.description || 'Chưa xác định'}
                    </span>
                  </div>
                  {showDetails && mapIDDetails?.lesson && (
                    <div className="mt-1 text-xs text-slate-500 bg-slate-50 p-2 rounded-md">
                      <p><strong>Tham số 5:</strong> Bài</p>
                      <p><strong>Giá trị:</strong> {questionID.lesson.value} - {mapIDDetails.lesson.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Form */}
            {questionID.form?.value && (
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="min-w-[30px] text-center mt-0.5">
                  {questionID.form.value}
                </Badge>
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="text-sm font-medium">Dạng câu hỏi:</span>
                    <span className="text-sm text-slate-600 ml-2">
                      {questionID.form.label || form.description || mapIDDetails?.form?.description || 'Chưa xác định'}
                    </span>
                  </div>
                  {showDetails && mapIDDetails?.form && (
                    <div className="mt-1 text-xs text-slate-500 bg-slate-50 p-2 rounded-md">
                      <p><strong>Tham số 6:</strong> Dạng</p>
                      <p><strong>Giá trị:</strong> {questionID.form.value} - {mapIDDetails.form.label || form.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {showDetails && (
            <div className="mt-4 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Thông tin từ Map ID.tex</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 p-0 text-xs text-blue-500"
                  onClick={() => window.open('/3141592654/admin/questions/map-id', '_blank')}
                >
                  Xem đầy đủ Map ID
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

export { UnifiedQuestionIDInfoComponent as UnifiedQuestionIDInfo };
export default UnifiedQuestionIDInfoComponent;
