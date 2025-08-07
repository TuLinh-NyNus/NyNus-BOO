"use client";

import React, { useState, useCallback } from "react";
import { Resizable, ResizeCallbackData } from "react-resizable";
import { WidgetConfig, WidgetSize } from "../../types/dashboard-customization";

/**
 * Resizable Widget Component
 * Component wrapper cho widgets có thể resize
 */

interface ResizableWidgetProps {
  config: WidgetConfig;
  children: React.ReactNode;
  onResize?: (size: WidgetSize) => void;
  isEditing?: boolean;
  className?: string;
}

export function ResizableWidget({
  config,
  children,
  onResize,
  isEditing = false,
  className = "",
}: ResizableWidgetProps) {
  const [isResizing, setIsResizing] = useState(false);

  // Handle resize start
  const handleResizeStart = useCallback(() => {
    setIsResizing(true);
  }, []);

  // Handle resize stop
  const handleResizeStop = useCallback(
    (e: React.SyntheticEvent, data: ResizeCallbackData) => {
      setIsResizing(false);

      if (onResize) {
        const newSize: WidgetSize = {
          width: data.size.width,
          height: data.size.height,
          minWidth: config.size.minWidth,
          minHeight: config.size.minHeight,
          maxWidth: config.size.maxWidth,
          maxHeight: config.size.maxHeight,
        };
        onResize(newSize);
      }
    },
    [config.size, onResize]
  );

  // Handle resize
  const handleResize = useCallback((e: React.SyntheticEvent, data: ResizeCallbackData) => {
    // Real-time resize feedback could be added here
    // For now, we'll just handle it in onResizeStop
  }, []);

  // If not resizable or not in editing mode, render without resize handles
  if (!config.isResizable || !isEditing) {
    return (
      <div
        className={className}
        style={{
          width: config.size.width,
          height: config.size.height,
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <Resizable
      width={config.size.width}
      height={config.size.height}
      minConstraints={[config.size.minWidth || 200, config.size.minHeight || 150]}
      maxConstraints={[config.size.maxWidth || 1200, config.size.maxHeight || 800]}
      onResizeStart={handleResizeStart}
      onResize={handleResize}
      onResizeStop={handleResizeStop}
      resizeHandles={["se", "s", "e", "sw", "w"]}
      handle={(resizeHandle) => <ResizeHandle position={resizeHandle} isResizing={isResizing} />}
    >
      <div
        className={`
          relative
          ${className}
          ${isResizing ? "select-none pointer-events-none" : ""}
        `}
        style={{
          width: config.size.width,
          height: config.size.height,
        }}
      >
        {children}

        {/* Resize Overlay */}
        {isResizing && (
          <div className="absolute inset-0 bg-primary/5 border-2 border-primary border-dashed rounded-lg pointer-events-none">
            <div className="absolute bottom-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-mono">
              {config.size.width} × {config.size.height}
            </div>
          </div>
        )}
      </div>
    </Resizable>
  );
}

/**
 * Resize Handle Component
 * Component handle cho resize
 */
interface ResizeHandleProps {
  position: string;
  isResizing: boolean;
}

function ResizeHandle({ position, isResizing }: ResizeHandleProps) {
  const getHandleClasses = (pos: string) => {
    const baseClasses = `
      absolute bg-primary/20 hover:bg-primary/40 transition-colors duration-200
      ${isResizing ? "bg-primary/60" : ""}
    `;

    switch (pos) {
      case "se": // Southeast (bottom-right corner)
        return `${baseClasses} bottom-0 right-0 w-3 h-3 cursor-se-resize`;
      case "s": // South (bottom edge)
        return `${baseClasses} bottom-0 left-1 right-1 h-1 cursor-s-resize`;
      case "e": // East (right edge)
        return `${baseClasses} top-1 bottom-1 right-0 w-1 cursor-e-resize`;
      case "sw": // Southwest (bottom-left corner)
        return `${baseClasses} bottom-0 left-0 w-3 h-3 cursor-sw-resize`;
      case "w": // West (left edge)
        return `${baseClasses} top-1 bottom-1 left-0 w-1 cursor-w-resize`;
      default:
        return baseClasses;
    }
  };

  return (
    <div
      className={`react-resizable-handle react-resizable-handle-${position} ${getHandleClasses(position)}`}
    >
      {/* Corner handles get a visual indicator */}
      {(position === "se" || position === "sw") && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1 h-1 bg-primary rounded-full" />
        </div>
      )}
    </div>
  );
}

/**
 * Widget Size Display Component
 * Component hiển thị kích thước widget
 */
interface WidgetSizeDisplayProps {
  size: WidgetSize;
  isVisible?: boolean;
  className?: string;
}

export function WidgetSizeDisplay({
  size,
  isVisible = true,
  className = "",
}: WidgetSizeDisplayProps) {
  if (!isVisible) return null;

  return (
    <div
      className={`
      absolute top-2 left-2 bg-background/90 border rounded px-2 py-1 text-xs font-mono
      ${className}
    `}
    >
      {size.width} × {size.height}
    </div>
  );
}

/**
 * Resize Constraints Display Component
 * Component hiển thị constraints resize
 */
interface ResizeConstraintsDisplayProps {
  size: WidgetSize;
  isVisible?: boolean;
  className?: string;
}

export function ResizeConstraintsDisplay({
  size,
  isVisible = true,
  className = "",
}: ResizeConstraintsDisplayProps) {
  if (!isVisible) return null;

  return (
    <div
      className={`
      absolute bottom-2 left-2 bg-background/90 border rounded px-2 py-1 text-xs
      ${className}
    `}
    >
      <div className="space-y-1">
        {size.minWidth && size.minHeight && (
          <div className="text-muted-foreground">
            Min: {size.minWidth} × {size.minHeight}
          </div>
        )}
        {size.maxWidth && size.maxHeight && (
          <div className="text-muted-foreground">
            Max: {size.maxWidth} × {size.maxHeight}
          </div>
        )}
      </div>
    </div>
  );
}
