/**
 * LaTeX Renderer Component
 * Core component cho rendering LaTeX expressions với KaTeX
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useMemo, useCallback, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  renderLatexExpression,
  renderLatexWithCache,
  validateLatexExpression,
  LaTeXRenderOptions,
  LaTeXRenderResult,
  DEFAULT_LATEX_OPTIONS
} from "@/lib/utils/latex-rendering";

// ===== TYPES =====

export interface LaTeXRendererProps {
  /** LaTeX expression để render */
  latex: string;
  
  /** Display mode (true = block, false = inline) */
  displayMode?: boolean;
  
  /** Custom render options */
  options?: Partial<LaTeXRenderOptions>;
  
  /** Enable caching cho performance */
  enableCache?: boolean;
  
  /** Show error messages */
  showErrors?: boolean;
  
  /** Custom error component */
  errorComponent?: React.ComponentType<{ error: string; latex: string }>;
  
  /** Loading component */
  loadingComponent?: React.ComponentType;
  
  /** Callback khi render complete */
  onRenderComplete?: (result: LaTeXRenderResult) => void;
  
  /** Callback khi có error */
  onError?: (error: string, latex: string) => void;
  
  /** Custom CSS classes */
  className?: string;
  
  /** Inline styles */
  style?: React.CSSProperties;
  
  /** Accessibility label */
  ariaLabel?: string;
}

// ===== DEFAULT ERROR COMPONENT =====

const DefaultErrorComponent: React.FC<{ error: string; latex: string }> = ({ error, latex }) => (
  <span 
    className="latex-error inline-block px-2 py-1 bg-red-50 border border-red-200 rounded text-red-700 text-sm font-mono"
    title={`LaTeX Error: ${error}`}
  >
    {latex}
  </span>
);

// ===== DEFAULT LOADING COMPONENT =====

const DefaultLoadingComponent: React.FC = () => (
  <span className="latex-loading inline-block w-4 h-4 bg-gray-200 animate-pulse rounded" />
);

// ===== MAIN COMPONENT =====

export function LaTeXRenderer({
  latex,
  displayMode = false,
  options = {},
  enableCache = true,
  showErrors = true,
  errorComponent: ErrorComponent = DefaultErrorComponent,
  loadingComponent: LoadingComponent = DefaultLoadingComponent,
  onRenderComplete,
  onError,
  className = "",
  style,
  ariaLabel
}: LaTeXRendererProps) {
  // ===== STATE =====
  
  const [isLoading, setIsLoading] = useState(false);
  const [renderResult, setRenderResult] = useState<LaTeXRenderResult | null>(null);
  
  // ===== MEMOIZED VALUES =====
  
  const renderOptions = useMemo(() => ({
    ...DEFAULT_LATEX_OPTIONS,
    ...options,
    displayMode
  }), [options, displayMode]);
  
  // ===== RENDER FUNCTION =====
  
  const performRender = useCallback(async () => {
    if (!latex.trim()) {
      setRenderResult(null);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Validate trước khi render
      const validation = validateLatexExpression(latex);
      if (!validation.isValid && renderOptions.throwOnError) {
        throw new Error(validation.error);
      }
      
      // Render với hoặc không cache
      const result = enableCache 
        ? renderLatexWithCache(latex, renderOptions)
        : renderLatexExpression(latex, renderOptions);
      
      setRenderResult(result);
      onRenderComplete?.(result);
      
      if (!result.success && onError) {
        onError(result.error || 'Unknown error', latex);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Rendering failed';
      const failedResult: LaTeXRenderResult = {
        success: false,
        html: `<span class="latex-error">${latex}</span>`,
        error: errorMessage,
        renderTime: 0
      };
      
      setRenderResult(failedResult);
      onError?.(errorMessage, latex);
    } finally {
      setIsLoading(false);
    }
  }, [latex, renderOptions, enableCache, onRenderComplete, onError]);
  
  // ===== EFFECTS =====
  
  useEffect(() => {
    performRender();
  }, [performRender]);
  
  // ===== RENDER HELPERS =====
  
  const renderContent = () => {
    if (isLoading) {
      return <LoadingComponent />;
    }
    
    if (!renderResult) {
      return null;
    }
    
    if (!renderResult.success && showErrors) {
      return <ErrorComponent error={renderResult.error || 'Unknown error'} latex={latex} />;
    }
    
    return (
      <span
        dangerouslySetInnerHTML={{ __html: renderResult.html }}
        className="latex-content"
      />
    );
  };
  
  // ===== MAIN RENDER =====
  
  const containerClasses = cn(
    "latex-renderer",
    {
      "latex-display": displayMode,
      "latex-inline": !displayMode,
      "latex-error-state": renderResult && !renderResult.success,
      "latex-loading-state": isLoading
    },
    className
  );
  
  return (
    <span
      className={containerClasses}
      style={style}
      aria-label={ariaLabel || `LaTeX expression: ${latex}`}
      role="img"
      data-latex={latex}
      data-display-mode={displayMode}
    >
      {renderContent()}
    </span>
  );
}

// ===== SPECIALIZED VARIANTS =====

/**
 * Inline LaTeX renderer
 */
export function InlineLaTeX(props: Omit<LaTeXRendererProps, 'displayMode'>) {
  return <LaTeXRenderer {...props} displayMode={false} />;
}

/**
 * Display (block) LaTeX renderer
 */
export function DisplayLaTeX(props: Omit<LaTeXRendererProps, 'displayMode'>) {
  return <LaTeXRenderer {...props} displayMode={true} />;
}

/**
 * LaTeX với error boundary
 */
export function SafeLaTeX(props: LaTeXRendererProps) {
  const [hasError, setHasError] = useState(false);
  
  const handleError = useCallback((error: string, latex: string) => {
    setHasError(true);
    console.warn('LaTeX rendering error:', error, 'for expression:', latex);
    props.onError?.(error, latex);
  }, [props]);
  
  if (hasError) {
    return (
      <span className="latex-safe-fallback text-gray-500 font-mono text-sm">
        [LaTeX: {props.latex}]
      </span>
    );
  }
  
  return <LaTeXRenderer {...props} onError={handleError} />;
}

// ===== PERFORMANCE OPTIMIZED VARIANT =====

/**
 * Memoized LaTeX renderer cho performance
 */
export const MemoizedLaTeX = React.memo(LaTeXRenderer, (prevProps, nextProps) => {
  return (
    prevProps.latex === nextProps.latex &&
    prevProps.displayMode === nextProps.displayMode &&
    JSON.stringify(prevProps.options) === JSON.stringify(nextProps.options) &&
    prevProps.enableCache === nextProps.enableCache &&
    prevProps.showErrors === nextProps.showErrors &&
    prevProps.className === nextProps.className
  );
});

MemoizedLaTeX.displayName = 'MemoizedLaTeX';

// ===== HOOKS =====

/**
 * Hook cho LaTeX rendering state
 */
export function useLatexRenderer(latex: string, options?: Partial<LaTeXRenderOptions>) {
  const [result, setResult] = useState<LaTeXRenderResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const render = useCallback(async () => {
    if (!latex.trim()) {
      setResult(null);
      setError(null);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const renderResult = renderLatexExpression(latex, options);
      setResult(renderResult);
      
      if (!renderResult.success) {
        setError(renderResult.error || 'Unknown error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Rendering failed';
      setError(errorMessage);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [latex, options]);
  
  useEffect(() => {
    render();
  }, [render]);
  
  return {
    result,
    isLoading,
    error,
    render,
    isValid: result?.success ?? false
  };
}

// ===== UTILITY COMPONENTS =====

/**
 * LaTeX preview với validation
 */
export function LaTeXPreview({ 
  latex, 
  className = "",
  showValidation = true 
}: { 
  latex: string; 
  className?: string;
  showValidation?: boolean;
}) {
  const { isLoading, error, isValid } = useLatexRenderer(latex);
  
  return (
    <div className={cn("latex-preview", className)}>
      {showValidation && (
        <div className="flex items-center gap-2 mb-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isLoading ? "bg-yellow-400" : isValid ? "bg-green-400" : "bg-red-400"
          )} />
          <span className="text-xs text-gray-600">
            {isLoading ? "Rendering..." : isValid ? "Valid LaTeX" : "Invalid LaTeX"}
          </span>
        </div>
      )}
      
      <div className="border rounded p-3 bg-white">
        {latex ? (
          <LaTeXRenderer 
            latex={latex} 
            displayMode={true}
            showErrors={true}
          />
        ) : (
          <span className="text-gray-400 italic">Enter LaTeX expression...</span>
        )}
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-red-600 font-mono">
          Error: {error}
        </div>
      )}
    </div>
  );
}
