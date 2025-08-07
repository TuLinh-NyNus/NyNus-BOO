"use client";

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui";
import { GripVertical, Settings, X, Eye, EyeOff } from "lucide-react";
import { WidgetConfig } from "../../types/dashboard-customization";

/**
 * Draggable Widget Component
 * Component wrapper cho widgets có thể drag-and-drop
 */

interface DraggableWidgetProps {
  config: WidgetConfig;
  children: React.ReactNode;
  onConfigChange?: (config: Partial<WidgetConfig>) => void;
  onRemove?: () => void;
  onToggleVisibility?: () => void;
  isEditing?: boolean;
  className?: string;
}

export function DraggableWidget({
  config,
  children,
  onConfigChange,
  onRemove,
  onToggleVisibility,
  isEditing = false,
  className = "",
}: DraggableWidgetProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: config.id,
    data: {
      type: "widget",
      config,
    },
    disabled: !config.isDraggable || !isEditing,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : "auto",
  };

  // Handle widget settings change
  const handleSettingsChange = (key: string, value: any) => {
    if (onConfigChange) {
      onConfigChange({
        settings: {
          ...config.settings,
          [key]: value,
        },
      });
    }
  };

  // Don't render if widget is hidden và not in editing mode
  if (!config.isVisible && !isEditing) {
    return null;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${className} ${isDragging ? "cursor-grabbing" : ""}`}
      {...attributes}
    >
      <Card
        className={`
        h-full transition-all duration-200
        ${config.isVisible ? "opacity-100" : "opacity-50"}
        ${isEditing ? "ring-2 ring-blue-200 hover:ring-blue-300" : ""}
        ${isDragging ? "shadow-lg scale-105" : ""}
      `}
      >
        {/* Widget Header với Controls */}
        {isEditing && (
          <div className="absolute -top-2 -right-2 z-10 flex items-center gap-1 bg-background border rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Drag Handle */}
            {config.isDraggable && (
              <button
                {...listeners}
                className="p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing"
                title="Drag to move"
              >
                <GripVertical className="h-3 w-3" />
              </button>
            )}

            {/* Visibility Toggle */}
            <button
              onClick={onToggleVisibility}
              className="p-1 hover:bg-muted rounded"
              title={config.isVisible ? "Hide widget" : "Show widget"}
            >
              {config.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            </button>

            {/* Settings Button */}
            <button
              onClick={() => {
                // TODO: Open widget settings panel
                console.log("Open settings for widget:", config.id);
              }}
              className="p-1 hover:bg-muted rounded"
              title="Widget settings"
            >
              <Settings className="h-3 w-3" />
            </button>

            {/* Remove Button */}
            <button
              onClick={onRemove}
              className="p-1 hover:bg-destructive hover:text-destructive-foreground rounded"
              title="Remove widget"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Widget Content */}
        <div className="h-full">{children}</div>

        {/* Widget Info Overlay (when hidden) */}
        {!config.isVisible && isEditing && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <EyeOff className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Widget Hidden</p>
              <p className="text-xs text-muted-foreground">{config.title}</p>
            </div>
          </div>
        )}

        {/* Dragging Indicator */}
        {isDragging && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-primary border-dashed rounded-lg flex items-center justify-center">
            <div className="text-center">
              <GripVertical className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium text-primary">Moving Widget</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

/**
 * Widget Placeholder Component
 * Component placeholder khi drag widget
 */
interface WidgetPlaceholderProps {
  config: WidgetConfig;
  className?: string;
}

export function WidgetPlaceholder({ config, className = "" }: WidgetPlaceholderProps) {
  return (
    <div
      className={`border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/20 ${className}`}
    >
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-2 bg-muted rounded-lg flex items-center justify-center">
            <GripVertical className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{config.title}</p>
          <p className="text-xs text-muted-foreground/70">Drop zone</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Widget Drop Indicator Component
 * Component indicator khi drop widget
 */
interface WidgetDropIndicatorProps {
  isActive: boolean;
  position: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function WidgetDropIndicator({
  isActive,
  position,
  className = "",
}: WidgetDropIndicatorProps) {
  if (!isActive) return null;

  const positionClasses = {
    top: "top-0 left-0 right-0 h-1",
    bottom: "bottom-0 left-0 right-0 h-1",
    left: "left-0 top-0 bottom-0 w-1",
    right: "right-0 top-0 bottom-0 w-1",
  };

  return (
    <div
      className={`
        absolute bg-primary rounded-full z-50 transition-all duration-200
        ${positionClasses[position]}
        ${className}
      `}
    />
  );
}
