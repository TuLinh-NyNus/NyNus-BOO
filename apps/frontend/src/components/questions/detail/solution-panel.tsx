/**
 * Solution Panel Component
 * Dedicated component cho hiển thị solution/explanation với smooth expand/collapse theo RIPER-5 EXECUTE MODE
 * 
 * Features:
 * - Expandable/collapsible functionality với smooth animations
 * - Support both explanation và solution fields
 * - LaTeX rendering cho solution content
 * - Toggle functionality với proper state management
 * - Error handling và loading states
 * - Responsive design và accessibility
 * - Keyboard navigation support
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Button,
  Alert,
  AlertDescription
} from '@/components/ui';
import { 
  ChevronDown,
  ChevronUp,
  BookOpen,
  Zap,
  AlertTriangle
} from 'lucide-react';

// Import LaTeX components
import { LaTeXContent } from '@/components/common/latex';

// Import shared components
import { PublicQuestionErrorBoundary } from '@/components/questions/shared';

// Import types
import { PublicQuestion } from '@/types/public';
import type { LaTeXExpression } from '@/lib/utils/latex-rendering';

// Import utils
import { cn } from '@/lib/utils';

// ===== TYPES =====

export interface SolutionPanelProps {
  /** Question data với solution/explanation */
  question: PublicQuestion;
  
  /** Show solution panel initially (default: true) */
  showSolution?: boolean;
  
  /** Default expanded state (default: false) */
  defaultExpanded?: boolean;
  
  /** Display variant */
  variant?: 'default' | 'compact' | 'detailed';
  
  /** Toggle callback */
  onToggle?: (expanded: boolean) => void;
  
  /** Error handler callback */
  onError?: (error: Error) => void;
  
  /** Custom CSS classes */
  className?: string;
}

// ===== CONSTANTS =====

const VARIANT_STYLES = {
  default: 'solution-panel-default',
  compact: 'solution-panel-compact',
  detailed: 'solution-panel-detailed'
} as const;

// Animation variants cho Framer Motion
const PANEL_VARIANTS = {
  hidden: {
    opacity: 0,
    height: 0,
    marginTop: 0
  },
  visible: {
    opacity: 1,
    height: "auto",
    marginTop: 16
  }
};

const CHEVRON_VARIANTS = {
  collapsed: { rotate: 0 },
  expanded: { rotate: 180 }
};

// ===== MAIN COMPONENT =====

/**
 * Solution Panel Component
 * Expandable panel cho hiển thị solution và explanation với smooth animations
 */
export function SolutionPanel({
  question,
  showSolution = true,
  defaultExpanded = false,
  variant = 'default',
  onToggle,
  onError,
  className = ""
}: SolutionPanelProps) {
  // ===== STATE =====
  
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  // ===== COMPUTED VALUES =====
  
  /**
   * Check if question has solution content
   */
  const hasSolutionContent = useMemo(() => {
    return !!(question?.explanation || question?.solution);
  }, [question]);
  
  /**
   * Get solution content sections
   */
  const solutionSections = useMemo(() => {
    const sections = [];
    
    if (question?.explanation) {
      sections.push({
        type: 'explanation',
        title: 'Giải thích',
        content: question.explanation,
        icon: BookOpen,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800'
      });
    }
    
    if (question?.solution) {
      sections.push({
        type: 'solution',
        title: 'Lời giải chi tiết',
        content: question.solution,
        icon: Zap,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800'
      });
    }
    
    return sections;
  }, [question]);
  
  // ===== HANDLERS =====
  
  /**
   * Toggle panel expansion
   */
  const handleToggle = useCallback(() => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onToggle?.(newExpanded);
  }, [isExpanded, onToggle]);
  
  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  }, [handleToggle]);
  
  /**
   * Handle LaTeX rendering errors
   */
  const handleLatexError = useCallback((errors: string[], _expressions?: LaTeXExpression[]) => {
    const errorMessage = errors.join(', ');
    console.warn('[SolutionPanel] LaTeX rendering errors:', errors);
    onError?.(new Error(`Solution LaTeX rendering failed: ${errorMessage}`));
  }, [onError]);
  
  // ===== RENDER FUNCTIONS =====
  
  /**
   * Render panel header với toggle button
   */
  const renderPanelHeader = () => {
    return (
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground">Lời giải chi tiết</h3>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          className="text-sm"
          aria-expanded={isExpanded}
          aria-controls="solution-content"
          aria-label={isExpanded ? "Thu gọn lời giải" : "Xem lời giải"}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Thu gọn
            </>
          ) : (
            <>
              <motion.div
                variants={CHEVRON_VARIANTS}
                animate={isExpanded ? "expanded" : "collapsed"}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4 mr-1" />
              </motion.div>
              Xem lời giải
            </>
          )}
        </Button>
      </div>
    );
  };
  
  /**
   * Render solution content sections
   */
  const renderSolutionContent = () => {
    if (solutionSections.length === 0) {
      return (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Câu hỏi này chưa có lời giải
          </AlertDescription>
        </Alert>
      );
    }
    
    return (
      <div className={cn(
        "space-y-4",
        variant === 'compact' && "space-y-2"
      )}>
        {solutionSections.map((section, _index) => {
          const IconComponent = section.icon;
          
          return (
            <div key={section.type}>
              <h4 className={cn(
                "font-medium mb-2 flex items-center gap-2",
                variant === 'compact' ? "text-xs" : "text-sm"
              )}>
                <IconComponent className="h-4 w-4" />
                {section.title}
              </h4>
              
              <div className={cn(
                "p-4 rounded-lg border",
                section.bgColor,
                section.borderColor,
                variant === 'compact' && "p-3"
              )}>
                <LaTeXContent
                  content={section.content}
                  safeMode={true}
                  expandable={true}
                  onError={handleLatexError}
                  className={cn(
                    "leading-relaxed",
                    section.textColor,
                    variant === 'compact' ? "text-xs" : "text-sm"
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  /**
   * Get variant-specific styling
   */
  const getVariantStyles = () => {
    const baseStyles = "solution-panel";
    const variantStyle = VARIANT_STYLES[variant];
    
    switch (variant) {
      case 'compact':
        return cn(baseStyles, variantStyle, "space-y-2");
      case 'detailed':
        return cn(baseStyles, variantStyle, "space-y-4 p-4 bg-card rounded-lg border");
      default:
        return cn(baseStyles, variantStyle, "space-y-3");
    }
  };
  
  // ===== MAIN RENDER =====
  
  if (!question) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Không có dữ liệu câu hỏi để hiển thị lời giải
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!showSolution || !hasSolutionContent) {
    return null;
  }
  
  return (
    <PublicQuestionErrorBoundary
      onError={onError}
      enableRetry={true}
      maxRetries={2}
      className="solution-panel-error-boundary"
    >
      <div className={cn(getVariantStyles(), className)}>
        {/* Panel Header */}
        {renderPanelHeader()}
        
        {/* Expandable Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              id="solution-content"
              variants={PANEL_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{
                duration: 0.3,
                ease: "easeInOut"
              }}
              className="overflow-hidden"
            >
              {renderSolutionContent()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PublicQuestionErrorBoundary>
  );
}

// ===== SPECIALIZED VARIANTS =====

/**
 * Compact Solution Panel
 * Simplified panel cho dense layouts
 */
export function CompactSolutionPanel(props: Omit<SolutionPanelProps, 'variant'>) {
  return (
    <SolutionPanel
      {...props}
      variant="compact"
      className={cn("compact-solution-panel", props.className)}
    />
  );
}

/**
 * Detailed Solution Panel
 * Enhanced panel với card styling
 */
export function DetailedSolutionPanel(props: Omit<SolutionPanelProps, 'variant'>) {
  return (
    <SolutionPanel
      {...props}
      variant="detailed"
      className={cn("detailed-solution-panel", props.className)}
    />
  );
}

/**
 * Auto-Expanded Solution Panel
 * Panel với default expanded state
 */
export function ExpandedSolutionPanel(props: SolutionPanelProps) {
  return (
    <SolutionPanel
      {...props}
      defaultExpanded={true}
      className={cn("expanded-solution-panel", props.className)}
    />
  );
}

/**
 * Controlled Solution Panel
 * Panel với external state control
 */
export function ControlledSolutionPanel(props: SolutionPanelProps & {
  isExpanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}) {
  const { isExpanded, onExpandedChange, ...restProps } = props;

  // Use internal state synced với external state
  const [internalExpanded, setInternalExpanded] = React.useState(isExpanded);

  React.useEffect(() => {
    setInternalExpanded(isExpanded);
  }, [isExpanded]);

  const handleToggle = React.useCallback((expanded: boolean) => {
    setInternalExpanded(expanded);
    onExpandedChange(expanded);
    restProps.onToggle?.(expanded);
  }, [onExpandedChange, restProps]);

  return (
    <SolutionPanel
      {...restProps}
      defaultExpanded={internalExpanded}
      onToggle={handleToggle}
      className={cn("controlled-solution-panel", props.className)}
    />
  );
}
