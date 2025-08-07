/**
 * Dashboard Customization Types
 * Types cho dashboard widget customization system
 */

/**
 * Widget size configuration
 * Cấu hình kích thước widget
 */
export interface WidgetSize {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Widget position configuration
 * Cấu hình vị trí widget
 */
export interface WidgetPosition {
  x: number;
  y: number;
  order: number;
}

/**
 * Widget configuration
 * Cấu hình widget
 */
export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  isVisible: boolean;
  isResizable: boolean;
  isDraggable: boolean;
  size: WidgetSize;
  position: WidgetPosition;
  settings: WidgetSettings;
  refreshRate?: number; // in seconds
}

/**
 * Widget types available
 * Các loại widget có sẵn
 */
export type WidgetType =
  | "user-metrics"
  | "session-metrics"
  | "security-metrics"
  | "system-metrics"
  | "user-growth-chart"
  | "system-performance-chart"
  | "security-analytics"
  | "analytics-overview"
  | "database-performance"
  | "api-performance"
  | "system-resource"
  | "performance-alerts";

/**
 * Widget settings
 * Cài đặt widget
 */
export interface WidgetSettings {
  showHeader?: boolean;
  showFooter?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  chartType?: "line" | "bar" | "pie" | "area";
  timeRange?: "7d" | "30d" | "90d" | "custom";
  displayMode?: "compact" | "detailed" | "minimal";
  theme?: "light" | "dark" | "auto";
  [key: string]: any; // Allow custom settings
}

/**
 * Dashboard layout configuration
 * Cấu hình layout dashboard
 */
export interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  widgets: WidgetConfig[];
  gridColumns: number;
  gridRows: number;
  gap: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Dashboard customization state
 * State customization dashboard
 */
export interface DashboardCustomization {
  userId: string;
  currentLayout: DashboardLayout;
  savedLayouts: DashboardLayout[];
  preferences: DashboardPreferences;
  lastModified: Date;
}

/**
 * Dashboard preferences
 * Preferences dashboard
 */
export interface DashboardPreferences {
  autoSave: boolean;
  autoRefresh: boolean;
  globalRefreshRate: number;
  defaultTimeRange: "7d" | "30d" | "90d";
  theme: "light" | "dark" | "auto";
  animations: boolean;
  compactMode: boolean;
  showGridLines: boolean;
  snapToGrid: boolean;
}

/**
 * Drag and drop context data
 * Dữ liệu context drag and drop
 */
export interface DragDropContextData {
  activeWidget: WidgetConfig | null;
  draggedWidget: WidgetConfig | null;
  dropZones: DropZone[];
  isDragging: boolean;
  dragOffset: { x: number; y: number };
}

/**
 * Drop zone configuration
 * Cấu hình drop zone
 */
export interface DropZone {
  id: string;
  type: "widget-area" | "sidebar" | "trash";
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  accepts: WidgetType[];
  isActive: boolean;
}

/**
 * Widget resize data
 * Dữ liệu resize widget
 */
export interface WidgetResizeData {
  widgetId: string;
  originalSize: WidgetSize;
  newSize: WidgetSize;
  isResizing: boolean;
  resizeHandle: "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
}

/**
 * Dashboard action types
 * Các loại action dashboard
 */
export type DashboardAction =
  | { type: "ADD_WIDGET"; payload: WidgetConfig }
  | { type: "REMOVE_WIDGET"; payload: string }
  | { type: "UPDATE_WIDGET"; payload: { id: string; updates: Partial<WidgetConfig> } }
  | { type: "MOVE_WIDGET"; payload: { id: string; position: WidgetPosition } }
  | { type: "RESIZE_WIDGET"; payload: { id: string; size: WidgetSize } }
  | { type: "TOGGLE_WIDGET_VISIBILITY"; payload: string }
  | { type: "RESET_LAYOUT"; payload: DashboardLayout }
  | { type: "SAVE_LAYOUT"; payload: { name: string; description?: string } }
  | { type: "LOAD_LAYOUT"; payload: string }
  | { type: "UPDATE_PREFERENCES"; payload: Partial<DashboardPreferences> };

/**
 * Widget component props
 * Props cho widget component
 */
export interface WidgetComponentProps {
  config: WidgetConfig;
  data?: any;
  isLoading?: boolean;
  onConfigChange?: (config: Partial<WidgetConfig>) => void;
  onRemove?: () => void;
  onResize?: (size: WidgetSize) => void;
  onMove?: (position: WidgetPosition) => void;
}

/**
 * Default widget configurations
 * Cấu hình widget mặc định
 */
export const DEFAULT_WIDGET_CONFIGS: Record<WidgetType, Omit<WidgetConfig, "id" | "position">> = {
  "user-metrics": {
    type: "user-metrics",
    title: "User Metrics",
    isVisible: true,
    isResizable: true,
    isDraggable: true,
    size: { width: 300, height: 200, minWidth: 250, minHeight: 150 },
    settings: { displayMode: "compact", autoRefresh: true, refreshInterval: 30 },
  },
  "session-metrics": {
    type: "session-metrics",
    title: "Session Metrics",
    isVisible: true,
    isResizable: true,
    isDraggable: true,
    size: { width: 300, height: 200, minWidth: 250, minHeight: 150 },
    settings: { displayMode: "compact", autoRefresh: true, refreshInterval: 30 },
  },
  "security-metrics": {
    type: "security-metrics",
    title: "Security Metrics",
    isVisible: true,
    isResizable: true,
    isDraggable: true,
    size: { width: 300, height: 200, minWidth: 250, minHeight: 150 },
    settings: { displayMode: "compact", autoRefresh: true, refreshInterval: 60 },
  },
  "system-metrics": {
    type: "system-metrics",
    title: "System Metrics",
    isVisible: true,
    isResizable: true,
    isDraggable: true,
    size: { width: 300, height: 200, minWidth: 250, minHeight: 150 },
    settings: { displayMode: "compact", autoRefresh: true, refreshInterval: 30 },
  },
  "user-growth-chart": {
    type: "user-growth-chart",
    title: "User Growth Analysis",
    isVisible: true,
    isResizable: true,
    isDraggable: true,
    size: { width: 600, height: 400, minWidth: 400, minHeight: 300 },
    settings: { chartType: "line", timeRange: "30d", autoRefresh: true, refreshInterval: 300 },
  },
  "system-performance-chart": {
    type: "system-performance-chart",
    title: "System Performance",
    isVisible: true,
    isResizable: true,
    isDraggable: true,
    size: { width: 600, height: 400, minWidth: 400, minHeight: 300 },
    settings: { chartType: "line", timeRange: "30d", autoRefresh: true, refreshInterval: 60 },
  },
  "security-analytics": {
    type: "security-analytics",
    title: "Security Analytics",
    isVisible: true,
    isResizable: true,
    isDraggable: true,
    size: { width: 600, height: 400, minWidth: 400, minHeight: 300 },
    settings: { chartType: "bar", timeRange: "30d", autoRefresh: true, refreshInterval: 120 },
  },
  "analytics-overview": {
    type: "analytics-overview",
    title: "Analytics Overview",
    isVisible: true,
    isResizable: true,
    isDraggable: true,
    size: { width: 800, height: 600, minWidth: 600, minHeight: 400 },
    settings: {
      displayMode: "detailed",
      timeRange: "30d",
      autoRefresh: true,
      refreshInterval: 180,
    },
  },
  "database-performance": {
    type: "database-performance",
    title: "Database Performance",
    isVisible: true,
    isResizable: true,
    isDraggable: true,
    size: { width: 400, height: 350, minWidth: 350, minHeight: 300 },
    settings: { displayMode: "detailed", autoRefresh: true, refreshInterval: 30 },
  },
  "api-performance": {
    type: "api-performance",
    title: "API Performance",
    isVisible: true,
    isResizable: true,
    isDraggable: true,
    size: { width: 400, height: 350, minWidth: 350, minHeight: 300 },
    settings: { displayMode: "detailed", autoRefresh: true, refreshInterval: 30 },
  },
  "system-resource": {
    type: "system-resource",
    title: "System Resources",
    isVisible: true,
    isResizable: true,
    isDraggable: true,
    size: { width: 400, height: 350, minWidth: 350, minHeight: 300 },
    settings: { displayMode: "detailed", autoRefresh: true, refreshInterval: 30 },
  },
  "performance-alerts": {
    type: "performance-alerts",
    title: "Performance Alerts",
    isVisible: true,
    isResizable: true,
    isDraggable: true,
    size: { width: 400, height: 300, minWidth: 350, minHeight: 250 },
    settings: { displayMode: "detailed", autoRefresh: true, refreshInterval: 15 },
  },
};

/**
 * Default dashboard preferences
 * Preferences dashboard mặc định
 */
export const DEFAULT_DASHBOARD_PREFERENCES: DashboardPreferences = {
  autoSave: true,
  autoRefresh: true,
  globalRefreshRate: 30,
  defaultTimeRange: "30d",
  theme: "auto",
  animations: true,
  compactMode: false,
  showGridLines: false,
  snapToGrid: true,
};

/**
 * Grid configuration
 * Cấu hình grid
 */
export interface GridConfig {
  columns: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
  gap: number;
  padding: number;
}

/**
 * Default grid configuration
 * Cấu hình grid mặc định
 */
export const DEFAULT_GRID_CONFIG: GridConfig = {
  columns: 12,
  rows: 8,
  cellWidth: 100,
  cellHeight: 100,
  gap: 16,
  padding: 24,
};
