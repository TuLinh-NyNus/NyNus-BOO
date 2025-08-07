import { AdminBreadcrumb } from "@/components/admin-breadcrumb";
import { AdminHeader } from "@/components/admin-header";
import { AdminSidebar } from "@/components/admin-sidebar";
import { WebSocketProvider } from "@/components/websocket/websocket-provider";
import { AdminErrorContextProvider } from "@/lib/error-handling/error-context";
import { AdminErrorBoundary } from "@/lib/error-handling/global-error-boundary";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Bảng điều khiển quản trị hệ thống",
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminErrorContextProvider maxErrors={100} enablePersistence={true} enableReporting={true}>
      <AdminErrorBoundary
        level="critical"
        enableRetry={true}
        showErrorDetails={process.env.NODE_ENV === "development"}
      >
        <WebSocketProvider enableNotifications={true} enableSounds={true} autoConnect={true}>
          <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Header */}
              <AdminHeader />

              {/* Page Content */}
              <main className="flex-1 overflow-y-auto p-6">
                <AdminBreadcrumb />
                {children}
              </main>
            </div>
          </div>
        </WebSocketProvider>
      </AdminErrorBoundary>
    </AdminErrorContextProvider>
  );
}
