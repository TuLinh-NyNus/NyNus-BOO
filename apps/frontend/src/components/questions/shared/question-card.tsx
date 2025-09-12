/**
 * Public Question Card Component
 * Adapted từ QuestionMobileCard cho public interface theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

"use client";

import React from "react";
import {
  CardContent,
  Button,
  Badge,
} from "@/components/ui";
import {
  Eye,
  Clock,
  Star,
  // Hash, // Unused for now
  BookOpen,
  Share2,
  Bookmark,
  TrendingUp
} from "lucide-react";

// Import LaTeX components
import { LaTeXContent } from "@/components/latex";

// Import badge components
import { QuestionTypeBadge } from "./question-type-badge";
import { DifficultyIndicator } from "./difficulty-indicator";

// Import touch enhancements
import { TouchCard } from "./touch-enhancements";

// Import public types
import {
  PublicQuestion
} from "@/lib/types/public";

// Note: QuestionType và QuestionDifficulty types được sử dụng
// thông qua badge components, không cần import trực tiếp ở đây

// ===== TYPES =====

export interface PublicQuestionCardProps {
  question: PublicQuestion;
  variant?: 'compact' | 'default' | 'featured';
  onView?: (questionId: string) => void;
  onShare?: (questionId: string) => void;
  onBookmark?: (questionId: string) => void;
  showRating?: boolean;
  showViews?: boolean;
  showActions?: boolean;
  className?: string;
}

// ===== HELPER FUNCTIONS =====

// Note: getDifficultyColor và getQuestionTypeDisplay functions đã được
// thay thế bằng QuestionTypeBadge và DifficultyIndicator components

/**
 * Format date cho mobile display
 */
function formatMobileDate(dateString: string): string {
  try {
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
      year: '2-digit'
    });
  } catch {
    return 'Không xác định';
  }
}

/**
 * Format rating display
 */
function formatRating(rating?: number): string {
  if (!rating) return '0.0';
  return rating.toFixed(1);
}

/**
 * Format views count
 */
function formatViews(views?: number): string {
  if (!views) return '0';
  if (views < 1000) return views.toString();
  if (views < 1000000) return `${(views / 1000).toFixed(1)}K`;
  return `${(views / 1000000).toFixed(1)}M`;
}

// ===== MAIN COMPONENT =====

export function PublicQuestionCard({
  question,
  variant = 'default',
  onView,
  onShare,
  onBookmark,
  showRating = true,
  showViews = true,
  showActions = true,
  className = ""
}: PublicQuestionCardProps) {
  // ===== COMPUTED VALUES =====

  // Note: difficultyColor và questionTypeDisplay không còn cần thiết
  // vì đã được thay thế bằng QuestionTypeBadge và DifficultyIndicator components
  
  // ===== HANDLERS =====
  
  const handleView = () => {
    onView?.(question.id);
  };
  
  const handleShare = () => {
    onShare?.(question.id);
  };
  
  const handleBookmark = () => {
    onBookmark?.(question.id);
  };

  // ===== VARIANT RENDERING =====

  // Compact variant cho dense lists
  if (variant === 'compact') {
    return (
      <TouchCard
        className={`public-question-card-compact hover:shadow-md transition-shadow duration-200 ${className}`}
        enableFeedback={true}
        onTouchFeedback={handleView}
      >
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Question content */}
              <div className="text-sm font-medium leading-relaxed mb-2">
                <LaTeXContent
                  content={question.content || 'Không có nội dung'}
                  maxLength={80}
                  safeMode={true}
                  onError={(errors) => console.warn('LaTeX rendering errors:', errors)}
                />
              </div>
              
              {/* Metadata */}
              <div className="flex flex-wrap gap-1">
                <QuestionTypeBadge
                  type={question.type}
                  size="sm"
                  showIcon={false}
                />

                {question.difficulty && (
                  <DifficultyIndicator
                    difficulty={question.difficulty}
                    size="sm"
                    showProgress={false}
                  />
                )}

                {question.category && (
                  <Badge variant="outline" className="text-xs">
                    {question.category}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Quick actions */}
            {showActions && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 flex-shrink-0"
                onClick={handleView}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </TouchCard>
    );
  }

  // Featured variant với enhanced styling
  if (variant === 'featured') {
    return (
      <TouchCard
        className={`public-question-card-featured group bg-card rounded-xl border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 ease-out ${className}`}
        enableFeedback={true}
        onTouchFeedback={handleView}
      >
        <CardContent className="p-6 space-y-4">
          {/* Enhanced Header với category và metadata */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <Badge variant="outline" className="text-xs font-medium bg-primary/5 text-primary border-primary/20">
                  {question.category}
                </Badge>
                {question.subject && (
                  <Badge variant="secondary" className="text-xs">
                    {question.subject}
                  </Badge>
                )}
                {question.grade && (
                  <Badge variant="outline" className="text-xs">
                    {question.grade}
                  </Badge>
                )}
              </div>
            </div>

            {/* Enhanced Rating và views */}
            <div className="flex items-center gap-3 text-sm">
              {showRating && question.rating && (
                <div className="flex items-center gap-1 text-yellow-600">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{formatRating(question.rating)}</span>
                </div>
              )}

              {showViews && question.views && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-medium">{formatViews(question.views)}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Enhanced Question content */}
          <div className="space-y-4">
            <div className="text-base font-medium leading-relaxed text-foreground group-hover:text-primary transition-colors duration-300">
              <LaTeXContent
                content={question.content || 'Không có nội dung'}
                maxLength={250}
                expandable={true}
                safeMode={true}
                onError={(errors) => {
                  if (process.env.NODE_ENV !== 'production') {
                    console.warn('LaTeX rendering errors:', errors);
                  }
                }}
                onRenderComplete={(result) => {
                  if (process.env.NODE_ENV !== 'production') {
                    console.log('LaTeX render complete:', result);
                  }
                }}
              />
            </div>
            
            {/* Question metadata */}
            <div className="flex flex-wrap gap-1">
              <QuestionTypeBadge
                type={question.type}
                size="sm"
              />

              {question.difficulty && (
                <DifficultyIndicator
                  difficulty={question.difficulty}
                  size="sm"
                  showProgress={true}
                />
              )}

              {question.points && (
                <Badge variant="outline" className="text-xs">
                  {question.points} điểm
                </Badge>
              )}

              {question.timeLimit && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {Math.ceil(question.timeLimit / 60)} phút
                </Badge>
              )}
            </div>
            
            {/* Tags */}
            {question.tags && question.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {question.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
                {question.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{question.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          {/* Actions */}
          {showActions && (
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleView}
                  className="h-8"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Xem chi tiết
                </Button>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  onClick={handleShare}
                  aria-label="Chia sẻ câu hỏi"
                  title="Chia sẻ câu hỏi"
                >
                  <Share2 className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Chia sẻ</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  onClick={handleBookmark}
                  aria-label="Lưu câu hỏi"
                  title="Lưu câu hỏi"
                >
                  <Bookmark className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Lưu</span>
                </Button>
              </div>
            </div>
          )}
          
          {/* Footer với date */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Cập nhật {formatMobileDate(question.updatedAt)}</span>
            </div>
          </div>
        </CardContent>
      </TouchCard>
    );
  }

  // Default variant
  return (
    <TouchCard
      className={`public-question-card hover:shadow-md transition-shadow duration-200 ${className}`}
      enableFeedback={true}
      onTouchFeedback={handleView}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Category và metadata */}
            <div className="flex items-center gap-2 mb-2">
              {question.category && (
                <Badge variant="outline" className="text-xs">
                  {question.category}
                </Badge>
              )}
              
              {question.subject && (
                <Badge variant="secondary" className="text-xs">
                  {question.subject}
                </Badge>
              )}
            </div>
            
            {/* Question content */}
            <div className="space-y-2">
              <div className="text-sm font-medium leading-relaxed">
                <LaTeXContent
                  content={question.content || 'Không có nội dung'}
                  maxLength={120}
                  safeMode={true}
                  expandable={false}
                  onError={(errors) => {
                    if (process.env.NODE_ENV !== 'production') {
                      console.warn('LaTeX rendering errors:', errors);
                    }
                  }}
                />
              </div>
              
              {/* Question metadata */}
              <div className="flex flex-wrap gap-1">
                <QuestionTypeBadge
                  type={question.type}
                  size="sm"
                />

                {question.difficulty && (
                  <DifficultyIndicator
                    difficulty={question.difficulty}
                    size="sm"
                  />
                )}

                {showRating && question.rating && (
                  <Badge variant="outline" className="text-xs">
                    <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                    {formatRating(question.rating)}
                  </Badge>
                )}

                {showViews && question.views && (
                  <Badge variant="outline" className="text-xs">
                    {formatViews(question.views)} lượt xem
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {/* Actions */}
          {showActions && (
            <div className="flex items-center gap-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 focus:ring-2 focus:ring-primary focus:ring-offset-2"
                onClick={handleView}
                aria-label="Xem chi tiết câu hỏi"
                title="Xem chi tiết"
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Xem</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 focus:ring-2 focus:ring-primary focus:ring-offset-2"
                onClick={handleShare}
                aria-label="Chia sẻ câu hỏi"
                title="Chia sẻ"
              >
                <Share2 className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Chia sẻ</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 focus:ring-2 focus:ring-primary focus:ring-offset-2"
                onClick={handleBookmark}
                aria-label="Lưu câu hỏi"
                title="Lưu"
              >
                <Bookmark className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Lưu</span>
              </Button>
            </div>
          )}
        </div>
        
        {/* Footer với date */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Cập nhật {formatMobileDate(question.updatedAt)}</span>
          </div>
        </div>
      </CardContent>
    </TouchCard>
  );
}

// ===== SPECIALIZED VARIANTS =====

/**
 * Compact question card cho dense layouts
 */
export function PublicQuestionCardCompact(props: Omit<PublicQuestionCardProps, 'variant'>) {
  return (
    <PublicQuestionCard
      {...props}
      variant="compact"
      className={`${props.className} compact-variant`}
    />
  );
}

/**
 * Featured question card với full metadata
 */
export function PublicQuestionCardFeatured(props: Omit<PublicQuestionCardProps, 'variant'>) {
  return (
    <PublicQuestionCard
      {...props}
      variant="featured"
      className={`${props.className} featured-variant`}
    />
  );
}

/**
 * Default export alias
 */
export const QuestionCard = PublicQuestionCard;
export const QuestionCardCompact = PublicQuestionCardCompact;
export const QuestionCardFeatured = PublicQuestionCardFeatured;
