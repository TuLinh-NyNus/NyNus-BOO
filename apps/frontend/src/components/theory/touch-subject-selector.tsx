/**
 * Touch Subject Selector Component
 * Component chọn môn học và lớp được tối ưu cho touch interface
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Button } from "@/components/ui/form/button";
import { Badge } from "@/components/ui/display/badge";
import {
  BookOpen,
  GraduationCap,
  ChevronRight,
  Check,
  Grid3X3,
  List
} from "lucide-react";
import { cn } from "@/lib/utils";

// ===== TYPES =====

export interface SubjectInfo {
  id: string;
  name: string;
  code: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
  chapterCount?: number;
  isAvailable?: boolean;
}

export interface GradeInfo {
  id: string;
  name: string;
  level: number;
  description?: string;
  subjectCount?: number;
  isAvailable?: boolean;
}

export interface TouchSubjectSelectorProps {
  /** Available subjects */
  subjects: SubjectInfo[];
  
  /** Available grades */
  grades: GradeInfo[];
  
  /** Currently selected subject */
  selectedSubject?: string;
  
  /** Currently selected grade */
  selectedGrade?: string;
  
  /** Enable large touch targets */
  enableLargeTouchTargets?: boolean;
  
  /** Display mode: grid hoặc list */
  displayMode?: 'grid' | 'list';
  
  /** Show selection summary */
  showSummary?: boolean;
  
  /** Handler khi subject thay đổi */
  onSubjectChange: (subject: string) => void;
  
  /** Handler khi grade thay đổi */
  onGradeChange: (grade: string) => void;
  
  /** Handler khi selection hoàn thành */
  onSelectionComplete?: (subject: string, grade: string) => void;
  
  /** Custom CSS classes */
  className?: string;
}

// ===== CONSTANTS =====

const DEFAULT_SUBJECTS: SubjectInfo[] = [
  { id: 'math', name: 'Toán học', code: 'P', color: 'bg-blue-500', chapterCount: 12, isAvailable: true },
  { id: 'physics', name: 'Vật lý', code: 'L', color: 'bg-green-500', chapterCount: 10, isAvailable: true },
  { id: 'chemistry', name: 'Hóa học', code: 'H', color: 'bg-purple-500', chapterCount: 8, isAvailable: true },
  { id: 'biology', name: 'Sinh học', code: 'S', color: 'bg-emerald-500', chapterCount: 9, isAvailable: true },
  { id: 'literature', name: 'Ngữ văn', code: 'V', color: 'bg-orange-500', chapterCount: 15, isAvailable: true },
  { id: 'english', name: 'Tiếng Anh', code: 'A', color: 'bg-red-500', chapterCount: 12, isAvailable: true }
];

const DEFAULT_GRADES: GradeInfo[] = [
  { id: '10', name: 'Lớp 10', level: 10, subjectCount: 6, isAvailable: true },
  { id: '11', name: 'Lớp 11', level: 11, subjectCount: 6, isAvailable: true },
  { id: '12', name: 'Lớp 12', level: 12, subjectCount: 6, isAvailable: true }
];

// ===== MAIN COMPONENT =====

export function TouchSubjectSelector({
  subjects = DEFAULT_SUBJECTS,
  grades = DEFAULT_GRADES,
  selectedSubject,
  selectedGrade,
  enableLargeTouchTargets = true,
  displayMode = 'grid',
  showSummary = true,
  onSubjectChange,
  onGradeChange,
  onSelectionComplete,
  className
}: TouchSubjectSelectorProps) {
  
  // ===== STATE =====
  
  const [currentDisplayMode, setCurrentDisplayMode] = useState(displayMode);

  // ===== COMPUTED VALUES =====
  
  const selectedSubjectInfo = subjects.find(s => s.id === selectedSubject);
  const selectedGradeInfo = grades.find(g => g.id === selectedGrade);
  const isSelectionComplete = selectedSubject && selectedGrade;

  // ===== HANDLERS =====

  const handleSubjectSelect = useCallback((subjectId: string) => {
    onSubjectChange(subjectId);
    
    // Auto-complete if grade is already selected
    if (selectedGrade && onSelectionComplete) {
      onSelectionComplete(subjectId, selectedGrade);
    }
  }, [onSubjectChange, selectedGrade, onSelectionComplete]);

  const handleGradeSelect = useCallback((gradeId: string) => {
    onGradeChange(gradeId);
    
    // Auto-complete if subject is already selected
    if (selectedSubject && onSelectionComplete) {
      onSelectionComplete(selectedSubject, gradeId);
    }
  }, [onGradeChange, selectedSubject, onSelectionComplete]);

  const handleDisplayModeToggle = useCallback(() => {
    setCurrentDisplayMode(prev => prev === 'grid' ? 'list' : 'grid');
  }, []);

  // ===== RENDER HELPERS =====

  const renderSubjectItem = (subject: SubjectInfo) => {
    const isSelected = subject.id === selectedSubject;
    const isDisabled = !subject.isAvailable;

    if (currentDisplayMode === 'list') {
      return (
        <Button
          key={subject.id}
          variant={isSelected ? "default" : "outline"}
          size="lg"
          onClick={() => handleSubjectSelect(subject.id)}
          disabled={isDisabled}
          className={cn(
            "w-full justify-start h-auto py-4",
            {
              "touch-target": enableLargeTouchTargets,
              "opacity-50": isDisabled
            }
          )}
        >
          <div className="flex items-center gap-3 w-full">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold", subject.color)}>
              {subject.code}
            </div>
            
            <div className="flex-1 text-left">
              <div className="font-medium">{subject.name}</div>
              {subject.description && (
                <div className="text-xs text-muted-foreground">{subject.description}</div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {subject.chapterCount && (
                <Badge variant="secondary" className="text-xs">
                  {subject.chapterCount} chương
                </Badge>
              )}
              {isSelected && <Check className="h-4 w-4" />}
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </Button>
      );
    }

    // Grid mode
    return (
      <Button
        key={subject.id}
        variant={isSelected ? "default" : "outline"}
        size="lg"
        onClick={() => handleSubjectSelect(subject.id)}
        disabled={isDisabled}
        className={cn(
          "h-auto p-4 flex flex-col items-center gap-2",
          {
            "touch-target": enableLargeTouchTargets,
            "opacity-50": isDisabled
          }
        )}
      >
        <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg", subject.color)}>
          {subject.code}
        </div>
        
        <div className="text-center">
          <div className="font-medium text-sm">{subject.name}</div>
          {subject.chapterCount && (
            <Badge variant="secondary" className="text-xs mt-1">
              {subject.chapterCount} chương
            </Badge>
          )}
        </div>

        {isSelected && (
          <Check className="h-4 w-4 absolute top-2 right-2" />
        )}
      </Button>
    );
  };

  const renderGradeItem = (grade: GradeInfo) => {
    const isSelected = grade.id === selectedGrade;
    const isDisabled = !grade.isAvailable;

    return (
      <Button
        key={grade.id}
        variant={isSelected ? "default" : "outline"}
        size="lg"
        onClick={() => handleGradeSelect(grade.id)}
        disabled={isDisabled}
        className={cn(
          "h-auto p-4 flex flex-col items-center gap-2 relative",
          {
            "touch-target": enableLargeTouchTargets,
            "opacity-50": isDisabled
          }
        )}
      >
        <GraduationCap className="h-8 w-8" />
        
        <div className="text-center">
          <div className="font-medium text-sm">{grade.name}</div>
          {grade.subjectCount && (
            <Badge variant="secondary" className="text-xs mt-1">
              {grade.subjectCount} môn
            </Badge>
          )}
        </div>

        {isSelected && (
          <Check className="h-4 w-4 absolute top-2 right-2" />
        )}
      </Button>
    );
  };

  // ===== RENDER =====

  return (
    <div className={cn("touch-subject-selector space-y-6", className)}>
      {/* Selection Summary */}
      {showSummary && isSelectionComplete && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm", selectedSubjectInfo?.color)}>
                  {selectedSubjectInfo?.code}
                </div>
                <span className="font-medium">{selectedSubjectInfo?.name}</span>
              </div>
              
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                <span className="font-medium">{selectedGradeInfo?.name}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subject Selection */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Chọn môn học
              </CardTitle>
              <CardDescription>
                Chọn môn học bạn muốn học
              </CardDescription>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDisplayModeToggle}
              className="touch-target"
            >
              {currentDisplayMode === 'grid' ? (
                <List className="h-4 w-4" />
              ) : (
                <Grid3X3 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className={cn(
            "gap-3",
            currentDisplayMode === 'grid' 
              ? "grid grid-cols-2 sm:grid-cols-3" 
              : "space-y-2"
          )}>
            {subjects.map(renderSubjectItem)}
          </div>
        </CardContent>
      </Card>

      {/* Grade Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Chọn lớp học
          </CardTitle>
          <CardDescription>
            Chọn lớp học phù hợp với bạn
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {grades.map(renderGradeItem)}
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      {isSelectionComplete && onSelectionComplete && (
        <Button
          size="lg"
          onClick={() => onSelectionComplete(selectedSubject!, selectedGrade!)}
          className={cn(
            "w-full",
            {
              "touch-target": enableLargeTouchTargets
            }
          )}
        >
          Bắt đầu học {selectedSubjectInfo?.name} - {selectedGradeInfo?.name}
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      )}
    </div>
  );
}

// ===== VARIANTS =====

/**
 * Compact Touch Subject Selector
 * Phiên bản compact cho modal hoặc sidebar
 */
export function CompactTouchSubjectSelector(props: TouchSubjectSelectorProps) {
  return (
    <TouchSubjectSelector
      {...props}
      displayMode="list"
      showSummary={false}
      enableLargeTouchTargets={false}
      className={cn("compact-subject-selector", props.className)}
    />
  );
}

/**
 * Full Touch Subject Selector
 * Phiên bản đầy đủ cho main page
 */
export function FullTouchSubjectSelector(props: TouchSubjectSelectorProps) {
  return (
    <TouchSubjectSelector
      {...props}
      displayMode="grid"
      showSummary={true}
      enableLargeTouchTargets={true}
      className={cn("full-subject-selector", props.className)}
    />
  );
}
