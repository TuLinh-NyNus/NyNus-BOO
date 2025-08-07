/**
 * useDashboardCustomization Hook
 * Hook cho dashboard customization với additional utilities
 */

import { useCallback, useEffect, useState } from "react";
import { useDashboardCustomization as useStore } from "../stores/dashboard-customization.store";
import { WidgetConfig, WidgetType, DashboardLayout } from "../types/dashboard-customization";

/**
 * Enhanced dashboard customization hook
 * Hook mở rộng cho dashboard customization
 */
export function useDashboardCustomization() {
  const store = useStore();
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  // Auto-save functionality
  const scheduleAutoSave = useCallback(() => {
    if (!store.preferences.autoSave) return;

    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    const timer = setTimeout(() => {
      store.saveToServer();
    }, 2000); // Auto-save after 2 seconds of inactivity

    setAutoSaveTimer(timer);
  }, [store.preferences.autoSave, store.saveToServer, autoSaveTimer]);

  // Enhanced add widget với auto-positioning
  const addWidgetWithAutoPosition = useCallback(
    (type: WidgetType) => {
      if (!store.currentLayout) return;

      // Find next available position
      const existingPositions = store.currentLayout.widgets.map((w) => w.position);
      const maxOrder = Math.max(...existingPositions.map((p) => p.order), -1);

      // Calculate grid position based on order
      const gridColumns = store.currentLayout.gridColumns || 12;
      const newOrder = maxOrder + 1;
      const x = newOrder % gridColumns;
      const y = Math.floor(newOrder / gridColumns);

      store.addWidget(type, { x, y, order: newOrder });
      scheduleAutoSave();
    },
    [store, scheduleAutoSave]
  );

  // Enhanced update widget với auto-save
  const updateWidgetWithAutoSave = useCallback(
    (widgetId: string, updates: Partial<WidgetConfig>) => {
      store.updateWidget(widgetId, updates);
      scheduleAutoSave();
    },
    [store, scheduleAutoSave]
  );

  // Bulk widget operations
  const bulkUpdateWidgets = useCallback(
    (updates: Array<{ id: string; updates: Partial<WidgetConfig> }>) => {
      updates.forEach(({ id, updates: widgetUpdates }) => {
        store.updateWidget(id, widgetUpdates);
      });
      scheduleAutoSave();
    },
    [store, scheduleAutoSave]
  );

  // Widget visibility management
  const toggleMultipleWidgets = useCallback(
    (widgetIds: string[]) => {
      widgetIds.forEach((id) => {
        store.toggleWidgetVisibility(id);
      });
      scheduleAutoSave();
    },
    [store, scheduleAutoSave]
  );

  // Layout utilities
  const duplicateLayout = useCallback(
    (layoutId: string, newName: string) => {
      const layout = store.savedLayouts.find((l) => l.id === layoutId);
      if (!layout) return;

      const duplicatedLayout: DashboardLayout = {
        ...layout,
        id: `layout-${Date.now()}`,
        name: newName,
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        widgets: layout.widgets.map((widget) => ({
          ...widget,
          id: `${widget.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        })),
      };

      store.saveLayout(newName);
    },
    [store]
  );

  // Export/Import functionality
  const exportLayout = useCallback(
    (layoutId?: string) => {
      const layout = layoutId
        ? store.savedLayouts.find((l) => l.id === layoutId)
        : store.currentLayout;

      if (!layout) return null;

      const exportData = {
        layout,
        preferences: store.preferences,
        exportedAt: new Date().toISOString(),
        version: "1.0",
      };

      return JSON.stringify(exportData, null, 2);
    },
    [store]
  );

  const importLayout = useCallback(
    (jsonData: string) => {
      try {
        const importData = JSON.parse(jsonData);

        if (importData.layout && importData.version === "1.0") {
          const importedLayout: DashboardLayout = {
            ...importData.layout,
            id: `imported-${Date.now()}`,
            name: `${importData.layout.name} (Imported)`,
            isDefault: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Add to saved layouts
          store.saveLayout(importedLayout.name);

          // Optionally update preferences
          if (importData.preferences) {
            store.updatePreferences(importData.preferences);
          }

          return true;
        }
        return false;
      } catch (error) {
        console.error("Failed to import layout:", error);
        return false;
      }
    },
    [store]
  );

  // Widget statistics
  const getWidgetStatistics = useCallback(() => {
    if (!store.currentLayout) return null;

    const widgets = store.currentLayout.widgets;
    const visibleWidgets = widgets.filter((w) => w.isVisible);
    const hiddenWidgets = widgets.filter((w) => !w.isVisible);

    const typeCount = widgets.reduce(
      (acc, widget) => {
        acc[widget.type] = (acc[widget.type] || 0) + 1;
        return acc;
      },
      {} as Record<WidgetType, number>
    );

    return {
      total: widgets.length,
      visible: visibleWidgets.length,
      hidden: hiddenWidgets.length,
      typeDistribution: typeCount,
      averageSize: {
        width: Math.round(widgets.reduce((sum, w) => sum + w.size.width, 0) / widgets.length),
        height: Math.round(widgets.reduce((sum, w) => sum + w.size.height, 0) / widgets.length),
      },
    };
  }, [store.currentLayout]);

  // Performance optimization
  const optimizeLayout = useCallback(() => {
    if (!store.currentLayout) return;

    // Remove duplicate widgets
    const uniqueWidgets = store.currentLayout.widgets.filter(
      (widget, index, self) =>
        index === self.findIndex((w) => w.type === widget.type && w.title === widget.title)
    );

    // Reorder widgets for better performance
    const optimizedWidgets = uniqueWidgets
      .sort((a, b) => a.position.order - b.position.order)
      .map((widget, index) => ({
        ...widget,
        position: { ...widget.position, order: index },
      }));

    // Update layout
    store.updateWidget("bulk", { widgets: optimizedWidgets } as any);
    scheduleAutoSave();
  }, [store, scheduleAutoSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [autoSaveTimer]);

  return {
    // Original store methods
    ...store,

    // Enhanced methods
    addWidgetWithAutoPosition,
    updateWidgetWithAutoSave,
    bulkUpdateWidgets,
    toggleMultipleWidgets,
    duplicateLayout,
    exportLayout,
    importLayout,
    getWidgetStatistics,
    optimizeLayout,

    // Utilities
    scheduleAutoSave,
    isAutoSaving: autoSaveTimer !== null,
  };
}
