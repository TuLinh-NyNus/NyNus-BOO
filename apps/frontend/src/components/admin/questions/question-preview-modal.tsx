/**
 * Question Preview Modal Component
 * Modal để preview câu hỏi trước khi publish
 * 
 * Features:
 * - Device preview (desktop/tablet/mobile)
 * - LaTeX rendering
 * - Solution toggle
 * - Exact public layout matching
 * - Dark mode support
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-26
 */

'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Badge,
  Button,
} from '@/components/ui';
import {
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  EyeOff,
  X,
} from 'lucide-react';
import { Question, QuestionType } from '@/types/question';
import { cn } from '@/lib/utils';
import { QuestionPreviewContent } from './question-preview-content';

// ===== TYPES =====

export interface QuestionPreviewModalProps {
  /** Question data to preview */
  question: Partial<Question>;
  /** Whether modal is open */
  isOpen: boolean;
  /** Callback when modal closes */
  onClose: () => void;
  /** Optional custom title */
  title?: string;
  /** Optional custom class */
  className?: string;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

// ===== DEVICE CONFIGURATIONS =====

const DEVICE_CONFIG = {
  desktop: {
    label: 'Desktop',
    icon: Monitor,
    width: '100%',
    maxWidth: '1200px',
    description: '1200px',
  },
  tablet: {
    label: 'Tablet',
    icon: Tablet,
    width: '100%',
    maxWidth: '768px',
    description: '768px',
  },
  mobile: {
    label: 'Mobile',
    icon: Smartphone,
    width: '100%',
    maxWidth: '375px',
    description: '375px',
  },
} as const;

// ===== MAIN COMPONENT =====

/**
 * Question Preview Modal Component
 * Hiển thị preview của câu hỏi với device selection
 */
export function QuestionPreviewModal({
  question,
  isOpen,
  onClose,
  title = 'Xem trước câu hỏi',
  className,
}: QuestionPreviewModalProps) {
  // ===== STATE =====
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('desktop');
  const [showSolution, setShowSolution] = useState(true);

  // ===== COMPUTED =====
  const deviceConfig = DEVICE_CONFIG[selectedDevice];
  const DeviceIcon = deviceConfig.icon;

  // ===== HANDLERS =====
  const handleClose = () => {
    // Reset state when closing
    setSelectedDevice('desktop');
    setShowSolution(true);
    onClose();
  };

  const toggleSolution = () => {
    setShowSolution(!showSolution);
  };

  // ===== RENDER =====
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          'max-w-7xl max-h-[90vh] p-0 gap-0',
          'dark:bg-card dark:border-border',
          className
        )}
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b dark:border-border">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                {title}
              </DialogTitle>
              <DialogDescription className="mt-1">
                Xem trước câu hỏi như người dùng sẽ thấy
              </DialogDescription>
            </div>

            {/* Close button (custom) */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Đóng</span>
            </Button>
          </div>

          {/* Device Selection & Controls */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-border">
            {/* Device Tabs */}
            <Tabs
              value={selectedDevice}
              onValueChange={(value) => setSelectedDevice(value as DeviceType)}
              className="flex-1"
            >
              <TabsList className="bg-muted">
                {(Object.entries(DEVICE_CONFIG) as [DeviceType, typeof DEVICE_CONFIG[DeviceType]][]).map(
                  ([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <TabsTrigger
                        key={key}
                        value={key}
                        className="flex items-center gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{config.label}</span>
                        <span className="text-xs text-muted-foreground hidden md:inline">
                          ({config.description})
                        </span>
                      </TabsTrigger>
                    );
                  }
                )}
              </TabsList>
            </Tabs>

            {/* Solution Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSolution}
              className="ml-4 flex items-center gap-2"
            >
              {showSolution ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  <span className="hidden sm:inline">Ẩn lời giải</span>
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  <span className="hidden sm:inline">Hiện lời giải</span>
                </>
              )}
            </Button>
          </div>
        </DialogHeader>

        {/* Preview Content with Device Frame */}
        <div className="flex-1 overflow-auto bg-muted/30 dark:bg-background/50 p-6">
          <div className="flex justify-center">
            {/* Device Frame */}
            <div
              className="transition-all duration-300 ease-in-out"
              style={{
                width: deviceConfig.width,
                maxWidth: deviceConfig.maxWidth,
              }}
            >
              {/* Device Info Badge */}
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline" className="flex items-center gap-2">
                  <DeviceIcon className="h-3 w-3" />
                  <span className="text-xs">
                    {deviceConfig.label} Preview ({deviceConfig.description})
                  </span>
                </Badge>
              </div>

              {/* Preview Container */}
              <div
                className={cn(
                  'bg-background rounded-lg shadow-xl border dark:border-border',
                  'transition-all duration-300',
                  selectedDevice === 'mobile' && 'shadow-2xl',
                )}
              >
                {/* Actual Question Content */}
                <QuestionPreviewContent
                  question={question}
                  showSolution={showSolution}
                  deviceType={selectedDevice}
                />
              </div>

              {/* Preview Info */}
              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Đây là preview. Layout thực tế có thể khác một chút.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Optional metadata */}
        {question.questionCodeId && (
          <div className="px-6 py-3 border-t dark:border-border bg-muted/20 dark:bg-background/20">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Mã câu hỏi: <span className="font-mono text-foreground">{question.questionCodeId}</span>
              </span>
              <span className="text-muted-foreground">
                Loại: <span className="font-medium text-foreground">{question.type || 'Chưa xác định'}</span>
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ===== EXPORTS =====
export default QuestionPreviewModal;

