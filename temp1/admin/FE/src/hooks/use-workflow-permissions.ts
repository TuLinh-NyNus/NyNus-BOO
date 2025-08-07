/**
 * useWorkflowPermissions Hook
 *
 * Hook cho workflow permission checking trong admin UI
 * Provides granular permission controls cho workflow features
 *
 * @author NyNus Team
 * @version 1.0.0
 */

import { useMemo } from "react";
import { useAdminAuth } from "./use-admin-auth";

/**
 * Workflow permission interface
 */
export interface WorkflowPermissions {
  // Status Management Permissions
  canTransitionStatus: boolean;
  canBulkTransitionStatus: boolean;
  canViewStatusStatistics: boolean;
  canViewPendingQuestions: boolean;

  // Retry Management Permissions
  canManualRetry: boolean;
  canBulkRetry: boolean;
  canQueueRetry: boolean;
  canViewRetryStatistics: boolean;
  canTriggerAutoRetry: boolean;

  // History & Analytics Permissions
  canViewWorkflowHistory: boolean;
  canViewQuestionHistory: boolean;
  canViewWorkflowStatistics: boolean;
  canViewRecentActivity: boolean;

  // General Workflow Permissions
  canAccessWorkflowManagement: boolean;
  canAccessRetryManagement: boolean;
  canAccessHistoryTracking: boolean;

  // UI Control Permissions
  showWorkflowControls: boolean;
  showRetryControls: boolean;
  showHistoryControls: boolean;
  showStatisticsControls: boolean;
}

/**
 * Workflow permission configuration
 */
interface WorkflowPermissionConfig {
  // Required roles for different operations
  statusManagementRoles: string[];
  retryManagementRoles: string[];
  historyViewingRoles: string[];
  statisticsViewingRoles: string[];

  // Required permissions
  statusManagementPermissions: string[];
  retryManagementPermissions: string[];
  historyViewingPermissions: string[];
}

/**
 * Default workflow permission configuration
 */
const DEFAULT_WORKFLOW_CONFIG: WorkflowPermissionConfig = {
  statusManagementRoles: ["ADMIN"],
  retryManagementRoles: ["ADMIN"],
  historyViewingRoles: ["ADMIN"],
  statisticsViewingRoles: ["ADMIN"],

  statusManagementPermissions: ["MANAGE_STATUS", "READ_ALL"],
  retryManagementPermissions: ["MANAGE_STATUS", "READ_ALL"],
  historyViewingPermissions: ["READ_ALL"],
};

/**
 * Hook options interface
 */
interface UseWorkflowPermissionsOptions {
  config?: Partial<WorkflowPermissionConfig>;
  strictMode?: boolean; // If true, requires ALL permissions, if false, requires ANY
}

/**
 * Main useWorkflowPermissions hook
 */
export function useWorkflowPermissions(
  options: UseWorkflowPermissionsOptions = {}
): WorkflowPermissions {
  const { user, isAuthenticated, hasRole, hasPermission, hasAnyPermission, hasAllPermissions } =
    useAdminAuth();

  const { config = {}, strictMode = true } = options;

  // Merge with default configuration
  const finalConfig: WorkflowPermissionConfig = {
    ...DEFAULT_WORKFLOW_CONFIG,
    ...config,
  };

  /**
   * Check if user has required role for operation
   */
  const hasRequiredRole = (requiredRoles: string[]): boolean => {
    if (!isAuthenticated || !user) return false;
    return requiredRoles.some((role) => hasRole(role));
  };

  /**
   * Check if user has required permissions for operation
   */
  const hasRequiredPermissions = (requiredPermissions: string[]): boolean => {
    if (!isAuthenticated || !user) return false;

    if (strictMode) {
      return hasAllPermissions(requiredPermissions);
    } else {
      return hasAnyPermission(requiredPermissions);
    }
  };

  /**
   * Check if user can perform operation
   */
  const canPerformOperation = (requiredRoles: string[], requiredPermissions: string[]): boolean => {
    return hasRequiredRole(requiredRoles) && hasRequiredPermissions(requiredPermissions);
  };

  /**
   * Compute workflow permissions
   */
  const permissions = useMemo((): WorkflowPermissions => {
    // Status Management Permissions
    const canTransitionStatus = canPerformOperation(
      finalConfig.statusManagementRoles,
      finalConfig.statusManagementPermissions
    );

    const canBulkTransitionStatus = canTransitionStatus; // Same requirements as single transition

    const canViewStatusStatistics = canPerformOperation(
      finalConfig.statisticsViewingRoles,
      finalConfig.historyViewingPermissions
    );

    const canViewPendingQuestions = canPerformOperation(
      finalConfig.statusManagementRoles,
      finalConfig.historyViewingPermissions
    );

    // Retry Management Permissions
    const canManualRetry = canPerformOperation(
      finalConfig.retryManagementRoles,
      finalConfig.retryManagementPermissions
    );

    const canBulkRetry = canManualRetry; // Same requirements as manual retry

    const canQueueRetry = canManualRetry; // Same requirements as manual retry

    const canViewRetryStatistics = canPerformOperation(
      finalConfig.statisticsViewingRoles,
      finalConfig.historyViewingPermissions
    );

    const canTriggerAutoRetry = canManualRetry; // Same requirements as manual retry

    // History & Analytics Permissions
    const canViewWorkflowHistory = canPerformOperation(
      finalConfig.historyViewingRoles,
      finalConfig.historyViewingPermissions
    );

    const canViewQuestionHistory = canViewWorkflowHistory; // Same requirements

    const canViewWorkflowStatistics = canPerformOperation(
      finalConfig.statisticsViewingRoles,
      finalConfig.historyViewingPermissions
    );

    const canViewRecentActivity = canViewWorkflowHistory; // Same requirements

    // General Workflow Permissions
    const canAccessWorkflowManagement = canTransitionStatus || canBulkTransitionStatus;
    const canAccessRetryManagement = canManualRetry || canBulkRetry;
    const canAccessHistoryTracking = canViewWorkflowHistory || canViewQuestionHistory;

    // UI Control Permissions
    const showWorkflowControls = canAccessWorkflowManagement;
    const showRetryControls = canAccessRetryManagement;
    const showHistoryControls = canAccessHistoryTracking;
    const showStatisticsControls = canViewWorkflowStatistics || canViewRetryStatistics;

    return {
      // Status Management
      canTransitionStatus,
      canBulkTransitionStatus,
      canViewStatusStatistics,
      canViewPendingQuestions,

      // Retry Management
      canManualRetry,
      canBulkRetry,
      canQueueRetry,
      canViewRetryStatistics,
      canTriggerAutoRetry,

      // History & Analytics
      canViewWorkflowHistory,
      canViewQuestionHistory,
      canViewWorkflowStatistics,
      canViewRecentActivity,

      // General Workflow
      canAccessWorkflowManagement,
      canAccessRetryManagement,
      canAccessHistoryTracking,

      // UI Controls
      showWorkflowControls,
      showRetryControls,
      showHistoryControls,
      showStatisticsControls,
    };
  }, [
    isAuthenticated,
    user,
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    finalConfig,
    strictMode,
  ]);

  return permissions;
}

/**
 * Hook for specific workflow permission checks
 */
export function useWorkflowPermissionCheck() {
  const permissions = useWorkflowPermissions();

  return {
    // Quick permission checkers
    isWorkflowAdmin: permissions.canAccessWorkflowManagement,
    isRetryAdmin: permissions.canAccessRetryManagement,
    isHistoryViewer: permissions.canAccessHistoryTracking,

    // Specific operation checkers
    canManageStatus: permissions.canTransitionStatus,
    canManageRetries: permissions.canManualRetry,
    canViewHistory: permissions.canViewWorkflowHistory,
    canViewStatistics: permissions.canViewWorkflowStatistics,

    // UI visibility checkers
    shouldShowWorkflowTab: permissions.showWorkflowControls,
    shouldShowRetryTab: permissions.showRetryControls,
    shouldShowHistoryTab: permissions.showHistoryControls,
    shouldShowStatisticsTab: permissions.showStatisticsControls,

    // Full permissions object
    permissions,
  };
}

/**
 * Hook for conditional rendering based on workflow permissions
 */
export function useWorkflowConditionalRender() {
  const permissions = useWorkflowPermissions();

  /**
   * Render component only if user has workflow management access
   */
  const renderIfWorkflowAdmin = (component: React.ReactNode): React.ReactNode => {
    return permissions.canAccessWorkflowManagement ? component : null;
  };

  /**
   * Render component only if user has retry management access
   */
  const renderIfRetryAdmin = (component: React.ReactNode): React.ReactNode => {
    return permissions.canAccessRetryManagement ? component : null;
  };

  /**
   * Render component only if user has history viewing access
   */
  const renderIfHistoryViewer = (component: React.ReactNode): React.ReactNode => {
    return permissions.canAccessHistoryTracking ? component : null;
  };

  /**
   * Render component only if user has statistics viewing access
   */
  const renderIfStatisticsViewer = (component: React.ReactNode): React.ReactNode => {
    return permissions.showStatisticsControls ? component : null;
  };

  /**
   * Render component based on custom permission check
   */
  const renderIf = (condition: boolean, component: React.ReactNode): React.ReactNode => {
    return condition ? component : null;
  };

  return {
    renderIfWorkflowAdmin,
    renderIfRetryAdmin,
    renderIfHistoryViewer,
    renderIfStatisticsViewer,
    renderIf,
    permissions,
  };
}

/**
 * Export all workflow permission hooks
 */
export default useWorkflowPermissions;
