"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/components/ui";
import { Edit3, Save, X, Settings, RefreshCw, Layout } from "lucide-react";
import { WidgetFactory } from "../widgets/widget-wrapper";
import { WidgetConfigPanel } from "./widget-config-panel";
import { useDashboardCustomization } from "../../stores/dashboard-customization.store";
import { usePerformanceMonitoring } from "../../hooks/use-performance-monitoring";
import { WidgetConfig, WidgetPosition, WidgetSize } from "../../types/dashboard-customization";

/**
 * Customizable Dashboard Component
 * Component dashboard có thể tùy chỉnh với drag-and-drop
 */

interface CustomizableDashboardProps {
  data?: any;
  isLoading?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export function CustomizableDashboard({
  data,
  isLoading = false,
  onRefresh,
  className = "",
}: CustomizableDashboardProps) {
  const {
    currentLayout,
    preferences,
    isDragging,
    draggedWidget,
    initializeLayout,
    updateWidget,
    moveWidget,
    resizeWidget,
    removeWidget,
    setDragging,
  } = useDashboardCustomization();

  // Performance monitoring data
  const {
    databaseMetrics,
    apiMetrics,
    systemMetrics,
    activeAlerts,
    isLoading: performanceLoading,
  } = usePerformanceMonitoring();

  const [isEditing, setIsEditing] = useState(false);
  const [configPanelOpen, setConfigPanelOpen] = useState(false);
  const [activeWidget, setActiveWidget] = useState<WidgetConfig | null>(null);

  // Initialize layout on mount
  useEffect(() => {
    initializeLayout();
  }, [initializeLayout]);

  // Setup drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const widget = currentLayout?.widgets.find((w) => w.id === active.id);

    if (widget) {
      setActiveWidget(widget);
      setDragging(true, widget);
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveWidget(null);
    setDragging(false);

    if (!over || !currentLayout) return;

    const activeWidget = currentLayout.widgets.find((w) => w.id === active.id);
    const overWidget = currentLayout.widgets.find((w) => w.id === over.id);

    if (activeWidget && overWidget && activeWidget.id !== overWidget.id) {
      // Swap positions
      const newPosition: WidgetPosition = {
        ...overWidget.position,
        order: activeWidget.position.order,
      };

      moveWidget(activeWidget.id, newPosition);
    }
  };

  // Handle widget config change
  const handleWidgetConfigChange = (widgetId: string, config: Partial<WidgetConfig>) => {
    updateWidget(widgetId, config);
  };

  // Handle widget resize
  const handleWidgetResize = (widgetId: string, size: WidgetSize) => {
    resizeWidget(widgetId, size);
  };

  // Handle widget remove
  const handleWidgetRemove = (widgetId: string) => {
    removeWidget(widgetId);
  };

  // Toggle editing mode
  const toggleEditing = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      // Save changes when exiting edit mode
      // This could trigger saveToServer if needed
    }
  };

  if (!currentLayout) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const visibleWidgets = currentLayout.widgets.filter((w) => w.isVisible || isEditing);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layout className="h-5 w-5" />
          <h2 className="text-xl font-semibold">{currentLayout.name}</h2>
          {currentLayout.description && (
            <span className="text-sm text-muted-foreground">- {currentLayout.description}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          )}

          {/* Widget Config Panel */}
          <WidgetConfigPanel
            isOpen={configPanelOpen}
            onOpenChange={setConfigPanelOpen}
            trigger={
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            }
          />

          {/* Edit Mode Toggle */}
          <Button variant={isEditing ? "default" : "outline"} size="sm" onClick={toggleEditing}>
            {isEditing ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Layout
              </>
            ) : (
              <>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Layout
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editing Mode Indicator */}
      {isEditing && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Editing Mode Active</span>
              <span className="text-xs text-blue-600/80">
                Drag widgets to reorder, resize handles to adjust size
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Dashboard Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={visibleWidgets.map((w) => w.id)} strategy={rectSortingStrategy}>
          <div
            className={`
              grid auto-rows-min gap-6
              grid-cols-1 md:grid-cols-2 lg:grid-cols-3
              max-w-7xl mx-auto
            `}
          >
            {visibleWidgets
              .sort((a, b) => a.position.order - b.position.order)
              .map((widget) => {
                // Combine external data với performance data
                const combinedData = {
                  ...data,
                  database: databaseMetrics,
                  api: apiMetrics,
                  system: systemMetrics,
                  alerts: activeAlerts,
                };

                return (
                  <WidgetFactory
                    key={widget.id}
                    config={widget}
                    data={combinedData}
                    isLoading={isLoading || performanceLoading}
                    isEditing={isEditing}
                    onConfigChange={(config) => handleWidgetConfigChange(widget.id, config)}
                    onRemove={() => handleWidgetRemove(widget.id)}
                    onResize={(size) => handleWidgetResize(widget.id, size)}
                    className="min-h-[200px] w-full overflow-hidden"
                  />
                );
              })}
          </div>
        </SortableContext>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeWidget ? (
            <div className="opacity-80 transform rotate-3 scale-105">
              <WidgetFactory
                config={activeWidget}
                data={data}
                isLoading={isLoading}
                isEditing={false}
                className="min-h-[200px] shadow-lg"
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Empty State */}
      {visibleWidgets.length === 0 && (
        <div className="text-center py-12">
          <Layout className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Widgets Available</h3>
          <p className="text-muted-foreground mb-4">Add widgets to customize your dashboard</p>
          <Button onClick={() => setConfigPanelOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Add Widgets
          </Button>
        </div>
      )}
    </div>
  );
}
