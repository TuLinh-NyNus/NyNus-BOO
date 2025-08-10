"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/form/button";

import { TrendingUp, Activity, History, Settings, RefreshCw, Users } from "lucide-react";
import { LevelProgressionManagement } from "@/components/features/admin/level-progression/level-progression-management";
import { AuditTrailDisplay } from "@/components/features/admin/level-progression/audit-trail-display";
import { PromotionHistory } from "@/components/features/admin/level-progression/promotion-history";

// Simple Tabs implementation
const Tabs = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={className}>{children}</div>;

const TabsList = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex border-b ${className}`}>{children}</div>
);

const TabsTrigger = ({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => (
  <button onClick={onClick} className={`px-4 py-2 border-b-2 transition-colors ${className}`}>
    {children}
  </button>
);

const TabsContent = ({
  value,
  children,
  className,
  activeTab,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
  activeTab?: string;
}) => {
  if (activeTab !== value) return null;

  return <div className={className}>{children}</div>;
};

/**
 * Level Progression & Audit Page
 * Trang quản lý level progression và audit trail
 */
export default function LevelProgressionPage() {
  // State management
  const [activeTab, setActiveTab] = useState("management");
  const [refreshKey, setRefreshKey] = useState(0);

  /**
   * Refresh all data
   */
  const refreshAllData = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <TrendingUp className="h-8 w-8" />
            Level Progression & Audit
          </h1>
          <p className="text-muted-foreground mt-2">
            Quản lý level progression system và monitoring audit trail
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={refreshAllData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger
            className={`flex items-center gap-2 ${
              activeTab === "management"
                ? "border-blue-500 text-blue-600"
                : "border-transparent hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("management")}
          >
            <Settings className="h-4 w-4" />
            Progression Management
          </TabsTrigger>
          <TabsTrigger
            className={`flex items-center gap-2 ${
              activeTab === "audit"
                ? "border-blue-500 text-blue-600"
                : "border-transparent hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("audit")}
          >
            <Activity className="h-4 w-4" />
            Audit Trail
          </TabsTrigger>
          <TabsTrigger
            className={`flex items-center gap-2 ${
              activeTab === "history"
                ? "border-blue-500 text-blue-600"
                : "border-transparent hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("history")}
          >
            <History className="h-4 w-4" />
            Progression History
          </TabsTrigger>
        </TabsList>

        {/* Progression Management Tab */}
        <TabsContent value="management" className="space-y-6" activeTab={activeTab}>
          <div className="border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Level Progression Management
                </h2>
                <p className="text-muted-foreground">
                  Cài đặt và monitoring level progression system
                </p>
              </div>
            </div>

            <LevelProgressionManagement key={`management-${refreshKey}`} />
          </div>
        </TabsContent>

        {/* Audit Trail Tab */}
        <TabsContent value="audit" className="space-y-6" activeTab={activeTab}>
          <div className="border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Comprehensive Audit Trail
                </h2>
                <p className="text-muted-foreground">
                  Tracking tất cả admin actions và system events
                </p>
              </div>
            </div>

            <AuditTrailDisplay key={`audit-${refreshKey}`} />
          </div>
        </TabsContent>

        {/* Progression History Tab */}
        <TabsContent value="history" className="space-y-6" activeTab={activeTab}>
          <div className="border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Progression History
                </h2>
                <p className="text-muted-foreground">
                  Lịch sử tất cả role promotions và level advancements
                </p>
              </div>
            </div>

            <PromotionHistory key={`history-${refreshKey}`} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions Panel */}
      <div className="fixed bottom-6 right-6 space-y-2">
        <div className="bg-white border rounded-lg shadow-lg p-4 space-y-2">
          <div className="text-sm font-medium">Quick Actions</div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveTab("management")}
            className="w-full justify-start"
          >
            <Settings className="h-4 w-4 mr-2" />
            Progression Settings
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveTab("audit")}
            className="w-full justify-start"
          >
            <Activity className="h-4 w-4 mr-2" />
            View Audit Trail
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveTab("history")}
            className="w-full justify-start"
          >
            <History className="h-4 w-4 mr-2" />
            Progression History
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={refreshAllData}
            className="w-full justify-start"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Help Panel */}
      <div className="border rounded-lg p-6 bg-muted/50">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Level Progression & Audit Guide
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium mb-2">Progression Management</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Configure auto advancement criteria</li>
              <li>• Monitor progression statistics</li>
              <li>• Toggle auto advancement on/off</li>
              <li>• Set notification preferences</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Audit Trail</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Track all admin actions</li>
              <li>• Filter by action, resource, status</li>
              <li>• View detailed audit log entries</li>
              <li>• Search audit logs</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Progression History</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• View all role promotions</li>
              <li>• Track level advancements</li>
              <li>• See progression criteria met</li>
              <li>• Monitor progression trends</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-4 border rounded bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2 text-blue-800 font-medium">
            <TrendingUp className="h-4 w-4" />
            Level Progression Best Practices
          </div>
          <ul className="text-sm text-blue-700 mt-2 space-y-1">
            <li>• Review progression criteria regularly</li>
            <li>• Monitor automatic vs manual progressions</li>
            <li>• Use manual override sparingly</li>
            <li>• Keep detailed audit trail</li>
            <li>• Set appropriate notification preferences</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
