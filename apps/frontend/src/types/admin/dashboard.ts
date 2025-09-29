/**
 * Admin Dashboard Types
 * Consolidated dashboard types for admin interface
 */

// ===== CORE DASHBOARD INTERFACES =====

/**
 * Dashboard Metrics Interface
 * Interface cho dashboard metrics
 */
export interface DashboardMetrics {
  users: {
    total: number;
    active: number;
    newToday: number;
    growth: number;
  };
  sessions: {
    total: number;
    active: number;
    averageDuration: number;
    bounceRate: number;
  };
  security: {
    events: number;
    alerts: number;
    blockedIPs: number;
    riskScore: number;
  };
  system: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    performance: number;
  };
}

/**
 * System Status Interface
 * Interface cho system status
 */
export interface SystemStatus {
  apiServer: 'online' | 'offline' | 'degraded';
  database: 'online' | 'offline' | 'slow';
  redisCache: 'online' | 'offline' | 'slow';
  fileStorage: 'online' | 'offline' | 'degraded';
}

/**
 * Admin Analytics Interface
 * Interface cho admin analytics data
 */
export interface AdminAnalytics {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalCourses: number;
    totalQuestions: number;
    totalRevenue: number;
    growthRate: number;
  };
  userMetrics: {
    newUsers: number;
    returningUsers: number;
    userRetention: number;
    averageSessionTime: number;
  };
  contentMetrics: {
    coursesCreated: number;
    questionsCreated: number;
    contentEngagement: number;
    completionRate: number;
  };
  performanceMetrics: {
    systemUptime: number;
    responseTime: number;
    errorRate: number;
    throughput: number;
  };
}

// ===== DASHBOARD WIDGETS =====

/**
 * Dashboard Widget Type
 * Type cho dashboard widget types
 */
export type DashboardWidgetType = 
  | 'metric'
  | 'chart'
  | 'table'
  | 'list'
  | 'progress'
  | 'status'
  | 'activity'
  | 'notification';

/**
 * Dashboard Widget Interface
 * Interface cho dashboard widgets
 */
export interface DashboardWidget {
  id: string;
  type: DashboardWidgetType;
  title: string;
  description?: string;
  data: unknown;
  config: DashboardWidgetConfig;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isVisible: boolean;
  isLoading?: boolean;
  error?: string;
  lastUpdated?: Date;
}

/**
 * Dashboard Widget Config Interface
 * Interface cho dashboard widget configuration
 */
export interface DashboardWidgetConfig {
  refreshInterval?: number;
  autoRefresh?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  allowResize?: boolean;
  allowMove?: boolean;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

// ===== CHART INTERFACES =====

/**
 * Chart Data Point Interface
 * Interface cho chart data points
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Chart Series Interface
 * Interface cho chart series
 */
export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color?: string;
  type?: 'line' | 'bar' | 'area' | 'pie' | 'doughnut';
}

/**
 * Chart Config Interface
 * Interface cho chart configuration
 */
export interface ChartConfig {
  type: 'line' | 'bar' | 'area' | 'pie' | 'doughnut' | 'mixed';
  title?: string;
  subtitle?: string;
  xAxis?: {
    title?: string;
    categories?: string[];
  };
  yAxis?: {
    title?: string;
    min?: number;
    max?: number;
  };
  legend?: {
    show: boolean;
    position: 'top' | 'bottom' | 'left' | 'right';
  };
  colors?: string[];
  responsive?: boolean;
  animation?: boolean;
}

// ===== ACTIVITY INTERFACES =====

/**
 * Activity Log Entry Interface
 * Interface cho activity log entries
 */
export interface ActivityLogEntry {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: string;
  resource: string;
  resourceId: string;
  description: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Real-time Event Interface
 * Interface cho real-time events
 */
export interface RealTimeEvent {
  id: string;
  type: 'user_login' | 'user_logout' | 'content_created' | 'system_alert' | 'security_event';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  source: string;
  data?: Record<string, unknown>;
}

// ===== DASHBOARD STATE & ACTIONS =====

/**
 * Dashboard State Interface
 * Interface cho dashboard state
 */
export interface DashboardState {
  metrics: DashboardMetrics | null;
  analytics: AdminAnalytics | null;
  systemStatus: SystemStatus | null;
  widgets: DashboardWidget[];
  activities: ActivityLogEntry[];
  events: RealTimeEvent[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Dashboard Actions Interface
 * Interface cho dashboard actions
 */
export interface DashboardActions {
  loadMetrics: () => Promise<void>;
  loadAnalytics: () => Promise<void>;
  loadSystemStatus: () => Promise<void>;
  refreshWidget: (widgetId: string) => Promise<void>;
  updateWidget: (widgetId: string, updates: Partial<DashboardWidget>) => void;
  addWidget: (widget: DashboardWidget) => void;
  removeWidget: (widgetId: string) => void;
  reorderWidgets: (widgets: DashboardWidget[]) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

// ===== HOOK RETURN TYPES =====

/**
 * Use Dashboard Hook Return
 * Return type cho useDashboard hook
 */
export interface UseDashboardReturn {
  state: DashboardState;
  actions: DashboardActions;
}

// ===== DASHBOARD CONFIGURATION =====

/**
 * Dashboard Configuration Interface
 * Interface cho dashboard configuration
 */
export interface DashboardConfig {
  refreshInterval: number;
  autoRefresh: boolean;
  maxWidgets: number;
  gridSize: {
    columns: number;
    rowHeight: number;
  };
  defaultWidgets: string[];
  theme: 'light' | 'dark' | 'auto';
}

/**
 * Default Dashboard Configuration
 * Default config cho dashboard
 */
export const DEFAULT_DASHBOARD_CONFIG: DashboardConfig = {
  refreshInterval: 30000, // 30 seconds
  autoRefresh: true,
  maxWidgets: 12,
  gridSize: {
    columns: 12,
    rowHeight: 100
  },
  defaultWidgets: [
    'user-metrics',
    'system-status',
    'recent-activity',
    'security-alerts'
  ],
  theme: 'auto'
};
