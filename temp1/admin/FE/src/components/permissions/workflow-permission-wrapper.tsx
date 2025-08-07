/**
 * Workflow Permission Wrapper Component
 *
 * Component wrapper cho conditional rendering dựa trên workflow permissions
 * Provides clean permission-based UI hiding cho workflow features
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, AlertCircle } from "lucide-react";
import {
  useWorkflowPermissions,
  useWorkflowConditionalRender,
} from "@/hooks/use-workflow-permissions";

/**
 * Permission wrapper props interface
 */
interface WorkflowPermissionWrapperProps {
  children: React.ReactNode;
  requiredPermission: "workflow" | "retry" | "history" | "statistics";
  fallback?: React.ReactNode;
  showFallback?: boolean;
  className?: string;
}

/**
 * Specific permission component props
 */
interface SpecificPermissionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallback?: boolean;
  className?: string;
}

/**
 * Main workflow permission wrapper component
 */
export function WorkflowPermissionWrapper({
  children,
  requiredPermission,
  fallback,
  showFallback = false,
  className = "",
}: WorkflowPermissionWrapperProps) {
  const permissions = useWorkflowPermissions();

  // Determine if user has required permission
  const hasPermission = (() => {
    switch (requiredPermission) {
      case "workflow":
        return permissions.canAccessWorkflowManagement;
      case "retry":
        return permissions.canAccessRetryManagement;
      case "history":
        return permissions.canAccessHistoryTracking;
      case "statistics":
        return permissions.showStatisticsControls;
      default:
        return false;
    }
  })();

  // If user has permission, render children
  if (hasPermission) {
    return <div className={className}>{children}</div>;
  }

  // If no permission and should show fallback
  if (showFallback) {
    return (
      <div className={className}>
        {fallback || (
          <Alert variant="destructive">
            <Lock className="h-4 w-4" />
            <AlertDescription>
              Bạn không có quyền truy cập tính năng này. Chỉ ADMIN mới có thể sử dụng workflow
              management.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  // If no permission and shouldn't show fallback, render nothing
  return null;
}

/**
 * Workflow management permission wrapper
 */
export function WorkflowManagementWrapper({
  children,
  fallback,
  showFallback = false,
  className = "",
}: SpecificPermissionProps) {
  return (
    <WorkflowPermissionWrapper
      requiredPermission="workflow"
      fallback={fallback}
      showFallback={showFallback}
      className={className}
    >
      {children}
    </WorkflowPermissionWrapper>
  );
}

/**
 * Retry management permission wrapper
 */
export function RetryManagementWrapper({
  children,
  fallback,
  showFallback = false,
  className = "",
}: SpecificPermissionProps) {
  return (
    <WorkflowPermissionWrapper
      requiredPermission="retry"
      fallback={fallback}
      showFallback={showFallback}
      className={className}
    >
      {children}
    </WorkflowPermissionWrapper>
  );
}

/**
 * History tracking permission wrapper
 */
export function HistoryTrackingWrapper({
  children,
  fallback,
  showFallback = false,
  className = "",
}: SpecificPermissionProps) {
  return (
    <WorkflowPermissionWrapper
      requiredPermission="history"
      fallback={fallback}
      showFallback={showFallback}
      className={className}
    >
      {children}
    </WorkflowPermissionWrapper>
  );
}

/**
 * Statistics viewing permission wrapper
 */
export function StatisticsViewingWrapper({
  children,
  fallback,
  showFallback = false,
  className = "",
}: SpecificPermissionProps) {
  return (
    <WorkflowPermissionWrapper
      requiredPermission="statistics"
      fallback={fallback}
      showFallback={showFallback}
      className={className}
    >
      {children}
    </WorkflowPermissionWrapper>
  );
}

/**
 * Permission status indicator component
 */
interface PermissionStatusProps {
  className?: string;
}

export function WorkflowPermissionStatus({ className = "" }: PermissionStatusProps) {
  const permissions = useWorkflowPermissions();

  const permissionItems = [
    {
      name: "Workflow Management",
      hasPermission: permissions.canAccessWorkflowManagement,
      description: "Quản lý trạng thái câu hỏi và workflow operations",
    },
    {
      name: "Retry Management",
      hasPermission: permissions.canAccessRetryManagement,
      description: "Thực hiện retry operations và queue management",
    },
    {
      name: "History Tracking",
      hasPermission: permissions.canAccessHistoryTracking,
      description: "Xem lịch sử workflow và audit trail",
    },
    {
      name: "Statistics Viewing",
      hasPermission: permissions.showStatisticsControls,
      description: "Xem thống kê và analytics workflow",
    },
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-semibold">Workflow Permissions</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {permissionItems.map((item) => (
          <div
            key={item.name}
            className={`p-3 rounded-lg border ${
              item.hasPermission
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              {item.hasPermission ? (
                <Shield className="h-4 w-4 text-green-600" />
              ) : (
                <Lock className="h-4 w-4 text-red-600" />
              )}
              <span className="font-medium text-sm">{item.name}</span>
            </div>
            <p className="text-xs opacity-80">{item.description}</p>
            <div className="mt-2">
              <span
                className={`text-xs px-2 py-1 rounded ${
                  item.hasPermission ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {item.hasPermission ? "Có quyền" : "Không có quyền"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Permission denied fallback component
 */
interface PermissionDeniedProps {
  feature: string;
  requiredRole?: string;
  className?: string;
}

export function PermissionDeniedFallback({
  feature,
  requiredRole = "ADMIN",
  className = "",
}: PermissionDeniedProps) {
  return (
    <div className={`text-center p-8 ${className}`}>
      <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="h-8 w-8 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có quyền truy cập</h3>
      <p className="text-gray-600 mb-4">
        Bạn cần có quyền <span className="font-medium text-red-600">{requiredRole}</span> để sử dụng
        tính năng <span className="font-medium">{feature}</span>.
      </p>
      <p className="text-sm text-gray-500">
        Vui lòng liên hệ quản trị viên để được cấp quyền truy cập.
      </p>
    </div>
  );
}

/**
 * Workflow feature guard component
 */
interface WorkflowFeatureGuardProps {
  children: React.ReactNode;
  feature: string;
  requiredPermission: "workflow" | "retry" | "history" | "statistics";
  className?: string;
}

export function WorkflowFeatureGuard({
  children,
  feature,
  requiredPermission,
  className = "",
}: WorkflowFeatureGuardProps) {
  return (
    <WorkflowPermissionWrapper
      requiredPermission={requiredPermission}
      showFallback={true}
      fallback={<PermissionDeniedFallback feature={feature} />}
      className={className}
    >
      {children}
    </WorkflowPermissionWrapper>
  );
}

/**
 * Default export
 */
export default WorkflowPermissionWrapper;
