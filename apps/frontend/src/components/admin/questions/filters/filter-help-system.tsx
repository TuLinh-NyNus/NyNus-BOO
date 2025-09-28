/**
 * Filter Help System Component
 * Provides tooltips, examples, keyboard shortcuts, và accessibility features
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState } from 'react';
import { Button, Badge } from '@/components/ui';
// Note: Tooltip components will be implemented later
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  HelpCircle, 
  Keyboard, 
  ChevronDown, 
  Search, 
  Filter, 

  Hash,
  Type,
  Eye,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ===== INTERFACES =====

interface FilterHelpSystemProps {
  className?: string;
}

interface FilterTooltipProps {
  children: React.ReactNode;
  title: string;
  description: string;
  examples?: string[];
  shortcuts?: string[];
}

interface HelpSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

// ===== TOOLTIP COMPONENT =====

/**
 * Filter Tooltip Component (Simplified - Tooltip UI components not available yet)
 */
function FilterTooltip({ children, title, description }: Omit<FilterTooltipProps, 'examples' | 'shortcuts'>) {
  // Simplified version - just return children for now
  // TODO: Implement proper tooltip when UI components are available
  return (
    <div title={`${title}: ${description}`}>
      {children}
    </div>
  );
}

// ===== HELP SECTIONS =====

const HELP_SECTIONS: HelpSection[] = [
  {
    id: 'question-code',
    title: 'Mã câu hỏi (QuestionCode)',
    icon: <Hash className="h-4 w-4" />,
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Hệ thống mã hóa câu hỏi theo cấu trúc phân cấp từ lớp đến bài học cụ thể.
        </p>
        
        <div className="space-y-2">
          <div className="text-sm font-medium">Cấu trúc mã:</div>
          <div className="bg-muted p-3 rounded-md font-mono text-sm">
            [Lớp][Môn][Chương].[Mức độ][Bài].[Dạng][Định dạng]
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium">Ví dụ:</div>
          <div className="space-y-1">
            <Badge variant="outline">12P01.A01.01ID6</Badge>
            <div className="text-xs text-muted-foreground">
              Lớp 12, Toán, Chương 1, Mức A, Bài 1, Dạng 1, Format ID6
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium">Phím tắt:</div>
          <div className="space-y-1">
            <Badge variant="secondary" className="text-xs">Ctrl + G</Badge>
            <span className="text-xs text-muted-foreground ml-2">Focus vào Grade filter</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'search-filters',
    title: 'Tìm kiếm nâng cao',
    icon: <Search className="h-4 w-4" />,
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Hệ thống tìm kiếm đa dạng với nhiều loại từ khóa khác nhau.
        </p>
        
        <div className="space-y-3">
          <div>
            <div className="text-sm font-medium mb-1">Từ khóa chung:</div>
            <div className="text-xs text-muted-foreground">
              Tìm kiếm trong nội dung câu hỏi, đáp án, và metadata
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium mb-1">Từ khóa lời giải:</div>
            <div className="text-xs text-muted-foreground">
              Tìm kiếm chỉ trong phần lời giải chi tiết
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium mb-1">Từ khóa LaTeX:</div>
            <div className="text-xs text-muted-foreground">
              Tìm kiếm trong mã LaTeX của công thức toán học
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium">Phím tắt:</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">Ctrl + F</Badge>
              <span className="text-xs text-muted-foreground">Focus vào tìm kiếm chung</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">Ctrl + Shift + F</Badge>
              <span className="text-xs text-muted-foreground">Focus vào tìm kiếm toàn bộ</span>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'metadata-filters',
    title: 'Bộ lọc thông tin',
    icon: <Type className="h-4 w-4" />,
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Lọc câu hỏi theo các thuộc tính metadata như loại, độ khó, trạng thái.
        </p>
        
        <div className="space-y-3">
          <div>
            <div className="text-sm font-medium mb-1">Loại câu hỏi:</div>
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs">MC - Trắc nghiệm</Badge>
              <Badge variant="outline" className="text-xs">TF - Đúng/Sai</Badge>
              <Badge variant="outline" className="text-xs">SA - Tự luận</Badge>
              <Badge variant="outline" className="text-xs">ES - Tiểu luận</Badge>
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium mb-1">Độ khó:</div>
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs bg-green-50">EASY - Dễ</Badge>
              <Badge variant="outline" className="text-xs bg-yellow-50">MEDIUM - Trung bình</Badge>
              <Badge variant="outline" className="text-xs bg-red-50">HARD - Khó</Badge>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'content-filters',
    title: 'Bộ lọc nội dung',
    icon: <Eye className="h-4 w-4" />,
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Lọc câu hỏi theo đặc điểm nội dung như có đáp án, lời giải, hình ảnh.
        </p>
        
        <div className="space-y-3">
          <div>
            <div className="text-sm font-medium mb-1">Điều kiện nội dung:</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Có đáp án</Badge>
                <span className="text-xs text-muted-foreground">Câu hỏi có sẵn đáp án</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Có lời giải</Badge>
                <span className="text-xs text-muted-foreground">Câu hỏi có lời giải chi tiết</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Có hình ảnh</Badge>
                <span className="text-xs text-muted-foreground">Câu hỏi chứa hình ảnh</span>
              </div>
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium mb-1">Tags và Source:</div>
            <div className="text-xs text-muted-foreground">
              Sử dụng auto-suggest để tìm nhanh tags và nguồn phổ biến
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'usage-filters',
    title: 'Bộ lọc sử dụng',
    icon: <BarChart3 className="h-4 w-4" />,
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Lọc câu hỏi theo thống kê sử dụng và đánh giá từ người dùng.
        </p>
        
        <div className="space-y-3">
          <div>
            <div className="text-sm font-medium mb-1">Số lần sử dụng:</div>
            <div className="text-xs text-muted-foreground">
              Lọc theo số lần câu hỏi được sử dụng trong các bài kiểm tra
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium mb-1">Đánh giá:</div>
            <div className="text-xs text-muted-foreground">
              Lọc theo điểm đánh giá từ 1-5 sao từ giáo viên và học sinh
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium mb-1">Khoảng thời gian:</div>
            <div className="text-xs text-muted-foreground">
              Lọc theo ngày tạo hoặc ngày cập nhật cuối cùng
            </div>
          </div>
        </div>
      </div>
    )
  }
];

// ===== MAIN COMPONENT =====

/**
 * Filter Help System Component
 */
export function FilterHelpSystem({ className }: FilterHelpSystemProps) {
  const [openSections, setOpenSections] = useState<string[]>(['question-code']);

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Help Dialog Trigger */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <HelpCircle className="h-4 w-4 mr-2" />
            Hướng dẫn sử dụng bộ lọc
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Hướng dẫn sử dụng bộ lọc câu hỏi
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Keyboard Shortcuts Summary */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Keyboard className="h-4 w-4" />
                <span className="font-medium">Phím tắt chính</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">Ctrl + F</Badge>
                  <span className="text-muted-foreground">Tìm kiếm chung</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">Ctrl + G</Badge>
                  <span className="text-muted-foreground">Chọn lớp</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">Ctrl + R</Badge>
                  <span className="text-muted-foreground">Reset filters</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">Esc</Badge>
                  <span className="text-muted-foreground">Đóng dialog</span>
                </div>
              </div>
            </div>
            
            {/* Help Sections */}
            <div className="space-y-2">
              {HELP_SECTIONS.map((section) => (
                <Collapsible
                  key={section.id}
                  open={openSections.includes(section.id)}
                  onOpenChange={() => toggleSection(section.id)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-3 h-auto"
                    >
                      <div className="flex items-center gap-2">
                        {section.icon}
                        <span className="font-medium">{section.title}</span>
                      </div>
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform",
                        openSections.includes(section.id) && "rotate-180"
                      )} />
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="p-4 border-l-2 border-muted ml-6">
                      {section.content}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Tips */}
      <div className="text-xs text-muted-foreground space-y-1">
        <div>💡 <strong>Mẹo:</strong> Hover vào các icon ? để xem tooltip chi tiết</div>
        <div>⌨️ <strong>Phím tắt:</strong> Ctrl + F để tìm kiếm nhanh</div>
        <div>🔍 <strong>Tìm kiếm:</strong> Sử dụng từ khóa tiếng Việt hoặc tiếng Anh</div>
      </div>
    </div>
  );
}

// Export tooltip component for use in other components
export { FilterTooltip };
export default FilterHelpSystem;
