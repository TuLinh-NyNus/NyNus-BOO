/**
 * Enhanced Question Type Filter
 * Loại câu hỏi biến thành filter buttons với trạng thái active
 * 
 * Improvements:
 * - Live filter buttons thay vì cards
 * - Có thể toggle nhiều loại cùng lúc
 * - Hiển thị số lượng realtime
 * - Gradient colors đẹp
 */

'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, ListChecks, FileText, ToggleLeft, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface QuestionType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  count: number;
  gradient: string;
  emoji: string;
}

interface EnhancedQuestionTypeFilterProps {
  className?: string;
  showHeader?: boolean;
  allowMultiple?: boolean;
  onSelectionChange?: (selected: string[]) => void;
}

export function EnhancedQuestionTypeFilter({
  className,
  showHeader = true,
  allowMultiple = true,
  onSelectionChange
}: EnhancedQuestionTypeFilterProps) {
  const router = useRouter();
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);

  useEffect(() => {
    // Mock data - will be replaced with real API call
    const types: QuestionType[] = [
      {
        id: 'MC',
        title: 'Trắc nghiệm',
        description: 'Chọn một đáp án đúng',
        icon: <CheckCircle2 className="h-6 w-6" />,
        count: 1234,
        gradient: 'linear-gradient(135deg, #667EEA, #764BA2)',
        emoji: '✅'
      },
      {
        id: 'TF',
        title: 'Đúng/Sai',
        description: 'Xác định tính đúng sai',
        icon: <ToggleLeft className="h-6 w-6" />,
        count: 567,
        gradient: 'linear-gradient(135deg, #F093FB, #F5576C)',
        emoji: '✔️'
      },
      {
        id: 'SA',
        title: 'Tự luận ngắn',
        description: 'Trả lời ngắn gọn',
        icon: <FileText className="h-6 w-6" />,
        count: 892,
        gradient: 'linear-gradient(135deg, #4FACFE, #00F2FE)',
        emoji: '📝'
      },
      {
        id: 'ES',
        title: 'Tự luận',
        description: 'Giải chi tiết',
        icon: <ListChecks className="h-6 w-6" />,
        count: 456,
        gradient: 'linear-gradient(135deg, #43E97B, #38F9D7)',
        emoji: '📚'
      }
    ];
    setQuestionTypes(types);
  }, []);

  const handleTypeToggle = (typeId: string) => {
    const newSelected = new Set(selectedTypes);
    
    if (allowMultiple) {
      if (newSelected.has(typeId)) {
        newSelected.delete(typeId);
      } else {
        newSelected.add(typeId);
      }
    } else {
      // Single selection
      if (newSelected.has(typeId)) {
        newSelected.clear();
      } else {
        newSelected.clear();
        newSelected.add(typeId);
      }
    }
    
    setSelectedTypes(newSelected);
    
    // Notify parent
    if (onSelectionChange) {
      onSelectionChange(Array.from(newSelected));
    }
    
    // Navigate if single selection
    if (!allowMultiple && newSelected.size > 0) {
      const url = new URL(window.location.origin + '/questions/browse');
      url.searchParams.set('type', typeId);
      router.push(url.toString());
    }
  };

  const handleApplyFilters = () => {
    if (selectedTypes.size === 0) return;
    
    const url = new URL(window.location.origin + '/questions/browse');
    url.searchParams.set('types', Array.from(selectedTypes).join(','));
    router.push(url.toString());
  };

  const handleClearSelection = () => {
    setSelectedTypes(new Set());
    if (onSelectionChange) {
      onSelectionChange([]);
    }
  };

  const totalSelected = questionTypes
    .filter(t => selectedTypes.has(t.id))
    .reduce((sum, t) => sum + t.count, 0);

  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      {showHeader && (
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground dark:text-[hsl(220_14%_98%)] mb-2">
            Loại câu hỏi
          </h2>
          <p className="text-sm text-muted-foreground dark:text-[hsl(220_15%_72%)]">
            Chọn loại câu hỏi bạn muốn lọc
          </p>
        </div>
      )}

      {/* Filter Actions Bar */}
      {allowMultiple && selectedTypes.size > 0 && (
        <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-[hsl(243_75%_65%)]/5 dark:bg-[hsl(243_75%_65%)]/10 border border-[hsl(243_75%_65%)]/20">
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-[hsl(243_75%_65%)]" />
            <span className="text-sm font-medium text-foreground dark:text-[hsl(220_14%_98%)]">
              Đã chọn: {selectedTypes.size} loại ({totalSelected.toLocaleString()} câu hỏi)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearSelection}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border dark:border-[hsl(221_27%_28%)] hover:bg-muted dark:hover:bg-[hsl(224_24%_18%)] transition-colors"
            >
              Xóa chọn
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-4 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-[hsl(243_75%_65%)] to-[hsl(188_85%_65%)] text-white shadow-sm hover:shadow-md transition-all hover:scale-105"
            >
              Áp dụng bộ lọc
            </button>
          </div>
        </div>
      )}

      {/* Question Type Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {questionTypes.map((type) => {
          const isSelected = selectedTypes.has(type.id);
          
          return (
            <button
              key={type.id}
              onClick={() => handleTypeToggle(type.id)}
              className={cn(
                'group relative overflow-hidden',
                'p-5 rounded-2xl min-h-[200px]',
                'border-2 transition-all duration-200',
                'hover:scale-[1.02] hover:shadow-xl',
                'focus:outline-none focus:ring-2 focus:ring-[hsl(243_75%_65%)] focus:ring-offset-2',
                isSelected ? [
                  'border-transparent',
                  'shadow-lg',
                  'ring-2 ring-white/30',
                ] : [
                  'border-border dark:border-[hsl(221_27%_28%)]/50',
                  'bg-white dark:bg-[hsl(223_28%_11%)]',
                  'hover:border-[hsl(243_75%_65%)]/50',
                  'shadow-sm'
                ]
              )}
              style={isSelected ? {
                background: type.gradient,
              } : undefined}
              aria-pressed={isSelected}
              aria-label={`${type.title}: ${type.count} câu hỏi`}
            >
              {/* Background Pattern */}
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `radial-gradient(circle at 20% 80%, transparent 50%, rgba(255,255,255,0.1) 50%)`,
                  backgroundSize: '30px 30px',
                }}
              />

              {/* Content */}
              <div className="relative z-10">
                {/* Icon and Selection Indicator */}
                <div className="flex items-start justify-between mb-3">
                  <div className={cn(
                    'p-2 rounded-xl',
                    'transition-all duration-300',
                    isSelected ? 'bg-white/20' : 'bg-gradient-to-br from-[hsl(243_75%_65%)]/10 to-[hsl(188_85%_65%)]/10'
                  )}>
                    <div className={isSelected ? 'text-white' : 'text-[hsl(243_75%_65%)]'}>
                      {type.icon}
                    </div>
                  </div>
                  
                  {/* Selection Indicator */}
                  <div className={cn(
                    'h-6 w-6 rounded-full border-2 flex items-center justify-center',
                    'transition-all duration-300',
                    isSelected ? 'border-white bg-white' : 'border-border dark:border-[hsl(221_27%_28%)]/50'
                  )}>
                    {isSelected && (
                      <div className="h-3 w-3 rounded-full bg-[hsl(243_75%_65%)]" />
                    )}
                  </div>
                </div>

                {/* Title with Emoji */}
                <div className="flex items-center gap-2 mb-2">
                  <h3 className={cn(
                    'font-semibold text-base',
                    isSelected ? 'text-white' : 'text-foreground dark:text-[hsl(220_14%_98%)]'
                  )}>
                    {type.title}
                  </h3>
                  <span className="text-lg">{type.emoji}</span>
                </div>

                {/* Description */}
                <p className={cn(
                  'text-xs mb-3',
                  isSelected ? 'text-white/90' : 'text-muted-foreground dark:text-[hsl(220_15%_72%)]'
                )}>
                  {type.description}
                </p>

                {/* Count Badge */}
                <div className="flex items-center justify-between">
                  <span className={cn(
                    'px-2.5 py-1 rounded-full text-xs font-bold',
                    isSelected 
                      ? 'bg-white/20 text-white' 
                      : 'bg-[hsl(243_75%_65%)]/10 text-[hsl(243_75%_65%)]'
                  )}>
                    {type.count.toLocaleString()} câu
                  </span>
                  
                  {/* Action Text */}
                  <span className={cn(
                    'text-xs font-medium',
                    'opacity-0 group-hover:opacity-100',
                    'transition-opacity duration-300',
                    isSelected ? 'text-white' : 'text-[hsl(243_75%_65%)]'
                  )}>
                    {isSelected ? 'Đã chọn' : 'Chọn'}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default EnhancedQuestionTypeFilter;