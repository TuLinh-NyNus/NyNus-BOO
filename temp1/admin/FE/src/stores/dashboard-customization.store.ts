/**
 * Dashboard Customization Store
 * Zustand store cho dashboard widget customization
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  DashboardCustomization,
  DashboardLayout,
  WidgetConfig,
  WidgetPosition,
  WidgetSize,
  DashboardPreferences,
  DEFAULT_DASHBOARD_PREFERENCES,
  DEFAULT_WIDGET_CONFIGS,
  WidgetType,
} from "../types/dashboard-customization";

/**
 * Dashboard customization store state
 * State store customization dashboard
 */
interface DashboardCustomizationState {
  // Current state
  currentLayout: DashboardLayout | null;
  savedLayouts: DashboardLayout[];
  preferences: DashboardPreferences;
  isLoading: boolean;
  error: string | null;

  // Drag and drop state
  isDragging: boolean;
  draggedWidget: WidgetConfig | null;

  // Actions
  initializeLayout: () => void;
  addWidget: (type: WidgetType, position?: WidgetPosition) => void;
  removeWidget: (widgetId: string) => void;
  updateWidget: (widgetId: string, updates: Partial<WidgetConfig>) => void;
  moveWidget: (widgetId: string, position: WidgetPosition) => void;
  resizeWidget: (widgetId: string, size: WidgetSize) => void;
  toggleWidgetVisibility: (widgetId: string) => void;

  // Layout management
  saveLayout: (name: string, description?: string) => void;
  loadLayout: (layoutId: string) => void;
  deleteLayout: (layoutId: string) => void;
  resetToDefault: () => void;

  // Preferences
  updatePreferences: (preferences: Partial<DashboardPreferences>) => void;

  // Drag and drop
  setDragging: (isDragging: boolean, widget?: WidgetConfig) => void;

  // Persistence
  saveToServer: () => Promise<void>;
  loadFromServer: () => Promise<void>;
}

/**
 * Generate unique widget ID
 * Tạo ID duy nhất cho widget
 */
function generateWidgetId(type: WidgetType): string {
  return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create default dashboard layout
 * Tạo layout dashboard mặc định với 1 widget duy nhất để tránh duplicate
 */
function createDefaultLayout(): DashboardLayout {
  // Chỉ tạo 1 widget duy nhất để tránh duplicate
  const singleWidget: WidgetConfig = {
    id: `user-metrics-${Date.now()}`, // Unique ID với timestamp
    ...DEFAULT_WIDGET_CONFIGS["user-metrics"],
    position: { x: 0, y: 0, order: 0 },
  };

  const defaultWidgets: WidgetConfig[] = [singleWidget];

  return {
    id: "default-layout",
    name: "Default Layout",
    description: "Default dashboard layout với essential widgets",
    widgets: defaultWidgets,
    gridColumns: 12,
    gridRows: 8,
    gap: 16,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Dashboard customization store
 * Store customization dashboard
 */
export const useDashboardCustomization = create<DashboardCustomizationState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentLayout: null,
      savedLayouts: [],
      preferences: DEFAULT_DASHBOARD_PREFERENCES,
      isLoading: false,
      error: null,
      isDragging: false,
      draggedWidget: null,

      // Initialize layout
      initializeLayout: () => {
        const state = get();
        if (!state.currentLayout) {
          const defaultLayout = createDefaultLayout();
          set({
            currentLayout: defaultLayout,
            savedLayouts: [defaultLayout],
          });
        } else {
          // Ensure no duplicate widgets in existing layout
          const uniqueWidgets = state.currentLayout.widgets.filter(
            (widget, index, self) => index === self.findIndex((w) => w.type === widget.type)
          );

          if (uniqueWidgets.length !== state.currentLayout.widgets.length) {
            const updatedLayout = {
              ...state.currentLayout,
              widgets: uniqueWidgets,
              updatedAt: new Date(),
            };
            set({ currentLayout: updatedLayout });
          }
        }
      },

      // Add widget
      addWidget: (type: WidgetType, position?: WidgetPosition) => {
        const state = get();
        if (!state.currentLayout) return;

        const newWidget: WidgetConfig = {
          id: generateWidgetId(type),
          ...DEFAULT_WIDGET_CONFIGS[type],
          position: position || { x: 0, y: 0, order: state.currentLayout.widgets.length },
        };

        const updatedLayout: DashboardLayout = {
          ...state.currentLayout,
          widgets: [...state.currentLayout.widgets, newWidget],
          updatedAt: new Date(),
        };

        set({ currentLayout: updatedLayout });
      },

      // Remove widget
      removeWidget: (widgetId: string) => {
        const state = get();
        if (!state.currentLayout) return;

        const updatedLayout: DashboardLayout = {
          ...state.currentLayout,
          widgets: state.currentLayout.widgets.filter((w) => w.id !== widgetId),
          updatedAt: new Date(),
        };

        set({ currentLayout: updatedLayout });
      },

      // Update widget
      updateWidget: (widgetId: string, updates: Partial<WidgetConfig>) => {
        const state = get();
        if (!state.currentLayout) return;

        const updatedLayout: DashboardLayout = {
          ...state.currentLayout,
          widgets: state.currentLayout.widgets.map((widget) =>
            widget.id === widgetId ? { ...widget, ...updates } : widget
          ),
          updatedAt: new Date(),
        };

        set({ currentLayout: updatedLayout });
      },

      // Move widget
      moveWidget: (widgetId: string, position: WidgetPosition) => {
        const state = get();
        if (!state.currentLayout) return;

        const updatedLayout: DashboardLayout = {
          ...state.currentLayout,
          widgets: state.currentLayout.widgets.map((widget) =>
            widget.id === widgetId ? { ...widget, position } : widget
          ),
          updatedAt: new Date(),
        };

        set({ currentLayout: updatedLayout });
      },

      // Resize widget
      resizeWidget: (widgetId: string, size: WidgetSize) => {
        const state = get();
        if (!state.currentLayout) return;

        const updatedLayout: DashboardLayout = {
          ...state.currentLayout,
          widgets: state.currentLayout.widgets.map((widget) =>
            widget.id === widgetId ? { ...widget, size } : widget
          ),
          updatedAt: new Date(),
        };

        set({ currentLayout: updatedLayout });
      },

      // Toggle widget visibility
      toggleWidgetVisibility: (widgetId: string) => {
        const state = get();
        if (!state.currentLayout) return;

        const updatedLayout: DashboardLayout = {
          ...state.currentLayout,
          widgets: state.currentLayout.widgets.map((widget) =>
            widget.id === widgetId ? { ...widget, isVisible: !widget.isVisible } : widget
          ),
          updatedAt: new Date(),
        };

        set({ currentLayout: updatedLayout });
      },

      // Save layout
      saveLayout: (name: string, description?: string) => {
        const state = get();
        if (!state.currentLayout) return;

        const newLayout: DashboardLayout = {
          ...state.currentLayout,
          id: `layout-${Date.now()}`,
          name,
          description,
          isDefault: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set({
          savedLayouts: [...state.savedLayouts, newLayout],
          currentLayout: newLayout,
        });
      },

      // Load layout
      loadLayout: (layoutId: string) => {
        const state = get();
        const layout = state.savedLayouts.find((l) => l.id === layoutId);
        if (layout) {
          set({ currentLayout: { ...layout } });
        }
      },

      // Delete layout
      deleteLayout: (layoutId: string) => {
        const state = get();
        set({
          savedLayouts: state.savedLayouts.filter((l) => l.id !== layoutId),
        });
      },

      // Reset to default
      resetToDefault: () => {
        const defaultLayout = createDefaultLayout();
        set({ currentLayout: defaultLayout });
      },

      // Update preferences
      updatePreferences: (preferences: Partial<DashboardPreferences>) => {
        const state = get();
        set({
          preferences: { ...state.preferences, ...preferences },
        });
      },

      // Set dragging state
      setDragging: (isDragging: boolean, widget?: WidgetConfig) => {
        set({
          isDragging,
          draggedWidget: isDragging ? widget || null : null,
        });
      },

      // Save to server (placeholder)
      saveToServer: async () => {
        const state = get();
        try {
          set({ isLoading: true, error: null });

          // TODO: Implement API call to save dashboard customization
          // await dashboardApi.saveCustomization(state.currentLayout, state.preferences);

          console.log("Dashboard customization saved to server");
          set({ isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Failed to save to server",
          });
        }
      },

      // Load from server (placeholder)
      loadFromServer: async () => {
        try {
          set({ isLoading: true, error: null });

          // TODO: Implement API call to load dashboard customization
          // const data = await dashboardApi.loadCustomization();
          // set({ currentLayout: data.layout, preferences: data.preferences });

          console.log("Dashboard customization loaded from server");
          set({ isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Failed to load from server",
          });
        }
      },
    }),
    {
      name: "dashboard-customization",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentLayout: state.currentLayout,
        savedLayouts: state.savedLayouts,
        preferences: state.preferences,
      }),
    }
  )
);
