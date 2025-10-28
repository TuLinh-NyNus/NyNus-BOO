/**
 * Dashboard Color System - Semantic Colors
 * Simplified từ 8 màu xuống 4 màu có ý nghĩa rõ ràng
 * 
 * @author NyNus Team
 * @created 2025-01-27
 */

export type DashboardColorScheme = 'primary' | 'success' | 'warning' | 'neutral';

/**
 * Semantic Color Mapping
 * Mỗi màu có ý nghĩa cụ thể trong context dashboard
 */
export const DASHBOARD_COLORS = {
  // PRIMARY BLUE - Thông tin chung, metrics trung tính
  primary: {
    bg: 'bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-blue-600/10 dark:from-blue-500/20 dark:via-cyan-500/15 dark:to-blue-600/20',
    border: 'border-blue-400/20 dark:border-blue-400/30',
    iconBg: 'bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 shadow-2xl shadow-blue-500/50',
    iconColor: 'text-white',
    valueGradient: 'bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 bg-clip-text text-transparent',
    hoverGlow: 'hover:shadow-2xl hover:shadow-blue-500/30 hover:border-blue-400/40',
    accentGlow: 'absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-transparent pointer-events-none',
    meaning: 'Thông tin tổng quan, metrics trung tính'
  },

  // SUCCESS GREEN - Trạng thái tích cực, hoạt động tốt
  success: {
    bg: 'bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:via-green-500/15 dark:to-teal-500/20',
    border: 'border-emerald-400/20 dark:border-emerald-400/30',
    iconBg: 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 shadow-2xl shadow-emerald-500/50',
    iconColor: 'text-white',
    valueGradient: 'bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 bg-clip-text text-transparent',
    hoverGlow: 'hover:shadow-2xl hover:shadow-emerald-500/30 hover:border-emerald-400/40',
    accentGlow: 'absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-green-500/5 to-transparent pointer-events-none',
    meaning: 'Hoạt động tích cực, online users, growth'
  },

  // WARNING AMBER - Cần chú ý, metrics quan trọng
  warning: {
    bg: 'bg-gradient-to-br from-amber-500/10 via-yellow-500/10 to-orange-500/10 dark:from-amber-500/20 dark:via-yellow-500/15 dark:to-orange-500/20',
    border: 'border-amber-400/20 dark:border-amber-400/30',
    iconBg: 'bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 shadow-2xl shadow-amber-500/50',
    iconColor: 'text-white',
    valueGradient: 'bg-gradient-to-r from-amber-600 via-yellow-500 to-orange-500 bg-clip-text text-transparent',
    hoverGlow: 'hover:shadow-2xl hover:shadow-amber-500/30 hover:border-amber-400/40',
    accentGlow: 'absolute inset-0 bg-gradient-to-br from-amber-500/5 via-yellow-500/5 to-transparent pointer-events-none',
    meaning: 'Cảnh báo, metrics cần chú ý, security alerts'
  },

  // NEUTRAL GRAY - Supporting info, empty states
  neutral: {
    bg: 'bg-gradient-to-br from-gray-500/10 via-slate-500/10 to-gray-600/10 dark:from-gray-500/20 dark:via-slate-500/15 dark:to-gray-600/20',
    border: 'border-gray-400/20 dark:border-gray-400/30',
    iconBg: 'bg-gradient-to-br from-gray-500 via-slate-500 to-gray-600 shadow-2xl shadow-gray-500/50',
    iconColor: 'text-white',
    valueGradient: 'bg-gradient-to-r from-gray-600 via-slate-500 to-gray-500 bg-clip-text text-transparent',
    hoverGlow: 'hover:shadow-2xl hover:shadow-gray-500/30 hover:border-gray-400/40',
    accentGlow: 'absolute inset-0 bg-gradient-to-br from-gray-500/5 via-slate-500/5 to-transparent pointer-events-none',
    meaning: 'Thông tin phụ trợ, empty states, inactive'
  }
} as const;

/**
 * Semantic Color Assignment Rules
 * Quy tắc gán màu theo ý nghĩa business logic
 */
export const COLOR_ASSIGNMENTS = {
  // Hero Metrics (3 cột chính)
  totalUsers: 'primary',      // Thông tin tổng quan
  activeUsers: 'success',     // Hoạt động tích cực
  activeSessions: 'primary',  // Thông tin session

  // Secondary Metrics (4 cột phụ)
  newUsers: 'success',        // Growth = tích cực
  totalQuestions: 'primary',  // Thông tin content
  totalCourses: 'primary',    // Thông tin content
  completedToday: 'success',  // Achievement = tích cực

  // Security & Alerts
  securityAlerts: 'warning',  // Cảnh báo bảo mật
  riskScore: 'warning',       // Điểm rủi ro

  // Empty States
  emptyState: 'neutral'       // Trạng thái trống
} as const;

/**
 * Trend Color Mapping
 * Màu sắc cho trend indicators
 */
export const TREND_COLORS = {
  positive: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    border: 'border-emerald-400/30'
  },
  negative: {
    bg: 'bg-rose-500/20',
    text: 'text-rose-400', 
    border: 'border-rose-400/30'
  },
  neutral: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-400/30'
  }
} as const;

/**
 * Helper function để lấy color scheme
 */
export function getDashboardColor(scheme: DashboardColorScheme) {
  return DASHBOARD_COLORS[scheme];
}

/**
 * Helper function để lấy màu theo metric type
 */
export function getMetricColor(metricType: keyof typeof COLOR_ASSIGNMENTS): DashboardColorScheme {
  return COLOR_ASSIGNMENTS[metricType] as DashboardColorScheme;
}

/**
 * Helper function để lấy trend color
 */
export function getTrendColor(isPositive: boolean | null) {
  if (isPositive === null) return TREND_COLORS.neutral;
  return isPositive ? TREND_COLORS.positive : TREND_COLORS.negative;
}


