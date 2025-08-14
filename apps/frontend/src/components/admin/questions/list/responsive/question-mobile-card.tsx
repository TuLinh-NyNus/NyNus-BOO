/**
 * Question Mobile Card Component
 * Mobile-optimized card layout cho questions
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from "react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Checkbox,
} from "@/components/ui";
import {
  Eye,
  Edit,
  // MoreHorizontal,
  Clock,
  User,
  Hash,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

// Import LaTeX components
import { LaTeXContent } from "@/components/latex";

// Import components
import { QuestionActionsDropdown } from "../../actions/question-actions-dropdown";

// Import types
import { Question } from "@/lib/types/question";

// ===== TYPES =====

export interface QuestionMobileCardProps {
  question: Question;
  isSelected?: boolean;
  onSelectionChange?: (questionId: string, selected: boolean) => void;
  onView?: (questionId: string) => void;
  onEdit?: (questionId: string) => void;
  onDelete?: (questionId: string) => void;
  onDuplicate?: (questionId: string) => void;
  showActions?: boolean;
  showSelection?: boolean;
  userRole?: "GUEST" | "STUDENT" | "TUTOR" | "TEACHER" | "ADMIN";
  className?: string;
}

// ===== HELPER FUNCTIONS =====

/**
 * Get status color và icon
 */
function getStatusDisplay(status?: string) {
  switch (status) {
    case 'ACTIVE':
      return {
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        label: 'Hoạt động'
      };
    case 'INACTIVE':
      return {
        color: 'bg-gray-100 text-gray-800',
        icon: XCircle,
        label: 'Không hoạt động'
      };
    case 'DRAFT':
      return {
        color: 'bg-yellow-100 text-yellow-800',
        icon: AlertCircle,
        label: 'Bản nháp'
      };
    case 'ARCHIVED':
      return {
        color: 'bg-red-100 text-red-800',
        icon: XCircle,
        label: 'Lưu trữ'
      };
    default:
      return {
        color: 'bg-gray-100 text-gray-800',
        icon: AlertCircle,
        label: status || 'Không xác định'
      };
  }
}

/**
 * Get difficulty color
 */
function getDifficultyColor(difficulty?: string) {
  switch (difficulty) {
    case 'EASY':
      return 'bg-green-100 text-green-800';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800';
    case 'HARD':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

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
 * Truncate text for mobile display
 */
function _truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Format date for mobile display
 */
function formatMobileDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} tuần trước`;
  
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// ===== MAIN COMPONENT =====

export function QuestionMobileCard({
  question,
  isSelected = false,
  onSelectionChange,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  showActions = true,
  showSelection = true,
  userRole = "GUEST",
  className = ""
}: QuestionMobileCardProps) {
  // ===== COMPUTED VALUES =====
  
  const statusDisplay = getStatusDisplay(question.status);
  const StatusIcon = statusDisplay.icon;
  const difficultyColor = getDifficultyColor(question.difficulty);
  const questionTypeDisplay = getQuestionTypeDisplay(question.type);
  
  // ===== HANDLERS =====
  
  const handleSelectionChange = (checked: boolean) => {
    onSelectionChange?.(question.id, checked);
  };
  
  const handleView = () => {
    onView?.(question.id);
  };
  
  const handleEdit = () => {
    onEdit?.(question.id);
  };
  
  // ===== RENDER =====
  
  return (
    <Card className={`question-mobile-card ${className} ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-4 space-y-3">
        {/* Header với selection và actions */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {/* Selection checkbox */}
            {showSelection && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={handleSelectionChange}
                className="mt-1"
              />
            )}
            
            {/* Question info */}
            <div className="flex-1 min-w-0">
              {/* Question code và status */}
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  <Hash className="h-3 w-3 mr-1" />
                  {question.questionCodeId}
                </Badge>
                
                <Badge className={`text-xs ${statusDisplay.color}`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusDisplay.label}
                </Badge>
              </div>
              
              {/* Question content */}
              <div className="space-y-2">
                <div className="text-sm font-medium leading-relaxed">
                  <LaTeXContent
                    content={question.content || 'Không có nội dung'}
                    maxLength={120}
                    safeMode={true}
                  />
                </div>
                
                {/* Question metadata */}
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {questionTypeDisplay}
                  </Badge>
                  
                  {question.difficulty && (
                    <Badge className={`text-xs ${difficultyColor}`}>
                      {question.difficulty}
                    </Badge>
                  )}
                  
                  {question.usageCount !== undefined && question.usageCount > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {question.usageCount} lượt dùng
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          {showActions && (
            <div className="flex items-center gap-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleView}
              >
                <Eye className="h-4 w-4" />
              </Button>
              
              {userRole !== 'GUEST' && userRole !== 'STUDENT' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={handleEdit}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              
              <QuestionActionsDropdown
                question={question}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                userRole={userRole}
                className="h-8 w-8"
              />
            </div>
          )}
        </div>
        
        {/* Footer với creator và date */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{question.creator || 'Không xác định'}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatMobileDate(question.createdAt)}</span>
          </div>
        </div>
        
        {/* Feedback score nếu có */}
        {question.feedback !== undefined && question.feedback > 0 && (
          <div className="flex items-center justify-center pt-2 border-t">
            <Badge variant="outline" className="text-xs">
              ⭐ {question.feedback.toFixed(1)} điểm
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ===== SPECIALIZED VARIANTS =====

/**
 * Compact mobile card cho dense layouts
 */
export function QuestionMobileCardCompact(props: QuestionMobileCardProps) {
  return (
    <QuestionMobileCard
      {...props}
      className={`${props.className} compact-variant`}
    />
  );
}

/**
 * Mobile card với expanded content
 */
export function QuestionMobileCardExpanded({
  question,
  ...props
}: QuestionMobileCardProps) {
  return (
    <Card className={`question-mobile-card-expanded ${props.className} ${props.isSelected ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {props.showSelection && (
              <Checkbox
                checked={props.isSelected}
                onCheckedChange={(checked) => props.onSelectionChange?.(question.id, checked as boolean)}
                className="mt-1"
              />
            )}
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">
                  <Hash className="h-3 w-3 mr-1" />
                  {question.questionCodeId}
                </Badge>
              </div>
              
              <div className="font-medium text-sm mb-2">
                <LaTeXContent
                  content={question.content || 'Không có nội dung'}
                  maxLength={300}
                  expandable={true}
                  safeMode={true}
                />
              </div>
            </div>
          </div>
          
          {props.showActions && (
            <QuestionActionsDropdown
              question={question}
              onView={props.onView}
              onEdit={props.onEdit}
              onDelete={props.onDelete}
              onDuplicate={props.onDuplicate}
              userRole={props.userRole}
            />
          )}
        </div>
        
        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-muted-foreground">Loại:</span>
            <p className="font-medium">{getQuestionTypeDisplay(question.type)}</p>
          </div>
          
          <div>
            <span className="text-muted-foreground">Độ khó:</span>
            <p className="font-medium">{question.difficulty || 'Chưa xác định'}</p>
          </div>
          
          <div>
            <span className="text-muted-foreground">Trạng thái:</span>
            <p className="font-medium">{getStatusDisplay(question.status).label}</p>
          </div>
          
          <div>
            <span className="text-muted-foreground">Lượt dùng:</span>
            <p className="font-medium">{question.usageCount || 0}</p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
          <span>Tạo bởi {question.creator || 'Không xác định'}</span>
          <span>{formatMobileDate(question.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
