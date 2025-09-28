/**
 * Lazy Loading Components for Performance Optimization
 * Lazy load heavy components để improve initial page load
 */

'use client';

import React, { Suspense, lazy } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { RefreshCw, Shield, Bell, BarChart3, Settings } from 'lucide-react';

/**
 * Loading Fallback Components
 */
const AdminDashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[60px] mb-2" />
            <Skeleton className="h-3 w-[120px]" />
          </CardContent>
        </Card>
      ))}
    </div>
    
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-[200px]" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-3 w-[150px]" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

const ResourceProtectionSkeleton = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <Skeleton className="h-6 w-[200px]" />
        </div>
        <Skeleton className="h-9 w-[100px]" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-[200px]" />
            <Skeleton className="h-10 w-[150px]" />
            <Skeleton className="h-10 w-[150px]" />
            <Skeleton className="h-10 w-[100px]" />
          </div>
          
          <div className="rounded-md border">
            <div className="p-4">
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-4 w-[80px]" />
                      <Skeleton className="h-4 w-[60px]" />
                    </div>
                    <Skeleton className="h-6 w-[50px]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const NotificationCenterSkeleton = () => (
  <Card className="w-full max-w-md">
    <CardHeader className="flex flex-row items-center justify-between">
      <div className="flex items-center space-x-2">
        <Bell className="h-5 w-5" />
        <Skeleton className="h-6 w-[120px]" />
      </div>
      <Skeleton className="h-4 w-4" />
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start space-x-3 p-3 rounded-lg border">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-[180px]" />
              <Skeleton className="h-3 w-[120px]" />
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const UserRiskProfileSkeleton = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <Skeleton className="h-6 w-[180px]" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[80px]" />
            </div>
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
    
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-[150px]" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-6 w-[60px]" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

const GenericLoadingSkeleton = () => (
  <div className="flex items-center justify-center py-8">
    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
    <span>Đang tải...</span>
  </div>
);

/**
 * Lazy Loaded Components
 */

// Admin Dashboard Components
export const LazyAdminDashboard = lazy(() => 
  import('@/components/admin/dashboard/connected-dashboard').then(module => ({
    default: module.ConnectedAdminDashboard
  }))
);

// TODO: Create these components when needed
// export const LazyUserManagement = lazy(() =>
//   import('@/components/admin/user-management').then(module => ({
//     default: module.UserManagement
//   })).catch(() => ({
//     default: () => <div>User Management component not found</div>
//   }))
// );

// export const LazyAuditLogs = lazy(() =>
//   import('@/components/admin/audit-logs').then(module => ({
//     default: module.AuditLogs
//   })).catch(() => ({
//     default: () => <div>Audit Logs component not found</div>
//   }))
// );

// Resource Protection Components
export const LazyResourceAccessMonitor = lazy(() => 
  import('@/components/resource-protection/resource-access-monitor').then(module => ({
    default: module.ResourceAccessMonitor
  }))
);

export const LazyUserRiskProfile = lazy(() => 
  import('@/components/resource-protection/user-risk-profile').then(module => ({
    default: module.UserRiskProfile
  }))
);

// Notification Components
export const LazyNotificationCenter = lazy(() => 
  import('@/components/notifications/notification-center').then(module => ({
    default: module.NotificationCenter
  }))
);

export const LazyNotificationPreferences = lazy(() => 
  import('@/components/notifications/notification-preferences').then(module => ({
    default: module.NotificationPreferences
  })).catch(() => ({
    default: () => <div>Notification Preferences component not found</div>
  }))
);

// TODO: Settings Components - create when needed
// export const LazyUserSettings = lazy(() =>
//   import('@/components/settings/user-settings').then(module => ({
//     default: module.UserSettings
//   })).catch(() => ({
//     default: () => <div>User Settings component not found</div>
//   }))
// );

// export const LazySecuritySettings = lazy(() =>
//   import('@/components/settings/security-settings').then(module => ({
//     default: module.SecuritySettings
//   })).catch(() => ({
//     default: () => <div>Security Settings component not found</div>
//   }))
// );

/**
 * Wrapper Components with Suspense
 */

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorBoundary?: boolean;
}

const LazyWrapper: React.FC<LazyWrapperProps> = ({ 
  children, 
  fallback = <GenericLoadingSkeleton />,
  errorBoundary = true 
}) => {
  if (errorBoundary) {
    return (
      <Suspense fallback={fallback}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="w-full">
          <CardContent className="flex flex-col items-center justify-center py-8 text-gray-500">
            <Settings className="h-12 w-12 mb-2 text-gray-300" />
            <p>Không thể tải component</p>
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Thử lại
            </button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

/**
 * Pre-configured Lazy Components with Suspense
 */

export const AdminDashboardLazy: React.FC = () => (
  <LazyWrapper fallback={<AdminDashboardSkeleton />}>
    <LazyAdminDashboard />
  </LazyWrapper>
);

export const ResourceAccessMonitorLazy: React.FC = () => (
  <LazyWrapper fallback={<ResourceProtectionSkeleton />}>
    <LazyResourceAccessMonitor />
  </LazyWrapper>
);

export const UserRiskProfileLazy: React.FC<{ userId?: string; showTitle?: boolean }> = (props) => (
  <LazyWrapper fallback={<UserRiskProfileSkeleton />}>
    <LazyUserRiskProfile {...props} />
  </LazyWrapper>
);

export const NotificationCenterLazy: React.FC = () => (
  <LazyWrapper fallback={<NotificationCenterSkeleton />}>
    <LazyNotificationCenter />
  </LazyWrapper>
);

// TODO: Enable when components are created
// export const UserManagementLazy: React.FC = () => (
//   <LazyWrapper fallback={<AdminDashboardSkeleton />}>
//     <LazyUserManagement />
//   </LazyWrapper>
// );

// export const AuditLogsLazy: React.FC = () => (
//   <LazyWrapper fallback={<GenericLoadingSkeleton />}>
//     <LazyAuditLogs />
//   </LazyWrapper>
// );

export const NotificationPreferencesLazy: React.FC = () => (
  <LazyWrapper fallback={<GenericLoadingSkeleton />}>
    <LazyNotificationPreferences />
  </LazyWrapper>
);

// export const UserSettingsLazy: React.FC = () => (
//   <LazyWrapper fallback={<GenericLoadingSkeleton />}>
//     <LazyUserSettings />
//   </LazyWrapper>
// );

// export const SecuritySettingsLazy: React.FC = () => (
//   <LazyWrapper fallback={<GenericLoadingSkeleton />}>
//     <LazySecuritySettings />
//   </LazyWrapper>
// );

/**
 * Preload Functions
 */
export const preloadComponents = {
  adminDashboard: () => import('@/components/admin/dashboard/connected-dashboard'),
  resourceProtection: () => import('@/components/resource-protection/resource-access-monitor'),
  userRiskProfile: () => import('@/components/resource-protection/user-risk-profile'),
  notificationCenter: () => import('@/components/notifications/notification-center'),
  // TODO: Enable when components are created
  // userManagement: () => import('@/components/admin/user-management').catch(() => null),
  // auditLogs: () => import('@/components/admin/audit-logs').catch(() => null),
  notificationPreferences: () => import('@/components/notifications/notification-preferences').catch(() => null),
  // userSettings: () => import('@/components/settings/user-settings').catch(() => null),
  // securitySettings: () => import('@/components/settings/security-settings').catch(() => null),
};

/**
 * Preload critical components on user interaction
 */
export const preloadCriticalComponents = () => {
  // Preload admin dashboard when user hovers over admin menu
  preloadComponents.adminDashboard();
  
  // Preload notification center
  preloadComponents.notificationCenter();
  
  // Preload resource protection for security-conscious users
  preloadComponents.resourceProtection();
};

// Auto-preload on idle
if (typeof window !== 'undefined') {
  // Preload after 2 seconds of idle time
  let idleTimer: NodeJS.Timeout;
  
  const resetIdleTimer = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      preloadCriticalComponents();
    }, 2000);
  };
  
  ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetIdleTimer, true);
  });
  
  resetIdleTimer();
}
