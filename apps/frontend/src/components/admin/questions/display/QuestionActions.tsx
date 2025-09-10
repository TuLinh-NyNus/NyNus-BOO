/**
 * Question Actions Component
 * Copy, share, bookmark actions cho question display
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState } from 'react';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui';
import { Copy, Share2, Bookmark, MoreHorizontal, FileText, Code, Hash } from 'lucide-react';
import { useToast } from '@/components/ui/feedback/use-toast';
import { Question } from '@/lib/types/question';

/**
 * Props cho Question Actions
 */
interface QuestionActionsProps {
  /** Question data */
  question: Question;
  /** Show compact version */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom actions */
  customActions?: React.ReactNode;
}

/**
 * Question Actions Component
 * Provides copy, share, bookmark functionality cho questions
 */
export function QuestionActions({
  question,
  compact = false,
  className = '',
  customActions
}: QuestionActionsProps) {
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(false);

  /**
   * Copy text to clipboard với success feedback
   */
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Đã sao chép',
        description: `${label} đã được sao chép vào clipboard`,
        variant: 'success'
      });
    } catch (error) {
      console.error('Copy failed:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể sao chép vào clipboard',
        variant: 'destructive'
      });
    }
  };

  /**
   * Copy question content
   */
  const handleCopyContent = () => {
    copyToClipboard(question.content, 'Nội dung câu hỏi');
  };

  /**
   * Copy LaTeX source
   */
  const handleCopyLatex = () => {
    copyToClipboard(question.rawContent || question.content, 'Mã LaTeX');
  };

  /**
   * Copy question ID
   */
  const handleCopyId = () => {
    copyToClipboard(question.id, 'ID câu hỏi');
  };

  /**
   * Copy question code
   */
  const handleCopyCode = () => {
    copyToClipboard(question.questionCodeId, 'Mã câu hỏi');
  };

  /**
   * Toggle bookmark
   */
  const handleToggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? 'Đã bỏ đánh dấu' : 'Đã đánh dấu',
      description: isBookmarked ? 'Câu hỏi đã được bỏ khỏi danh sách yêu thích' : 'Câu hỏi đã được thêm vào danh sách yêu thích',
      variant: 'success'
    });
  };

  /**
   * Share question
   */
  const handleShare = async () => {
    const shareData = {
      title: `Câu hỏi ${question.questionCodeId}`,
      text: question.content.substring(0, 100) + '...',
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy URL to clipboard
        await copyToClipboard(window.location.href, 'Link câu hỏi');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  // Compact version cho mobile hoặc space-constrained areas
  if (compact) {
    return (
      <div className={`question-actions-compact ${className}`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Thao tác</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleCopyContent}>
              <FileText className="mr-2 h-4 w-4" />
              Sao chép nội dung
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyLatex}>
              <Code className="mr-2 h-4 w-4" />
              Sao chép LaTeX
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyId}>
              <Hash className="mr-2 h-4 w-4" />
              Sao chép ID
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyCode}>
              <Hash className="mr-2 h-4 w-4" />
              Sao chép mã
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleToggleBookmark}>
              <Bookmark className={`mr-2 h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              {isBookmarked ? 'Bỏ đánh dấu' : 'Đánh dấu'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Chia sẻ
            </DropdownMenuItem>
            {customActions}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Full version với individual buttons
  return (
    <div className={`question-actions flex items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyContent}
        className="flex items-center gap-2"
      >
        <FileText className="h-4 w-4" />
        <span className="hidden sm:inline">Sao chép</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleToggleBookmark}
        className={`flex items-center gap-2 ${isBookmarked ? 'bg-badge-warning/10 border-badge-warning' : ''}`}
      >
        <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current text-badge-warning-foreground' : ''}`} />
        <span className="hidden sm:inline">{isBookmarked ? 'Đã lưu' : 'Lưu'}</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Copy className="h-4 w-4" />
            <span className="hidden sm:inline">Sao chép</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleCopyContent}>
            <FileText className="mr-2 h-4 w-4" />
            Nội dung câu hỏi
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyLatex}>
            <Code className="mr-2 h-4 w-4" />
            Mã LaTeX gốc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyId}>
            <Hash className="mr-2 h-4 w-4" />
            ID câu hỏi
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyCode}>
            <Hash className="mr-2 h-4 w-4" />
            Mã câu hỏi
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        className="flex items-center gap-2"
      >
        <Share2 className="h-4 w-4" />
        <span className="hidden sm:inline">Chia sẻ</span>
      </Button>

      {customActions}
    </div>
  );
}

/**
 * Quick Copy Button
 * Simple copy button cho inline use
 */
export function QuickCopyButton({
  text,
  label,
  className = ''
}: {
  text: string;
  label: string;
  className?: string;
}) {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Đã sao chép',
        description: `${label} đã được sao chép`,
        variant: 'success'
      });
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể sao chép',
        variant: 'destructive'
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className={`h-6 w-6 p-0 ${className}`}
    >
      <Copy className="h-3 w-3" />
      <span className="sr-only">Sao chép {label}</span>
    </Button>
  );
}
