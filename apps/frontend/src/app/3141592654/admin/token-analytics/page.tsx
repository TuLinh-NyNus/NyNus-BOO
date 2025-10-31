/**
 * Token Analytics Admin Page
 * ==========================
 *
 * Admin page for comprehensive JWT token analytics
 * Displays metrics, trends, insights, and AI-powered recommendations
 *
 * @author NyNus Development Team
 * @version 1.0.0 - Phase 5 Advanced Analytics
 */

import { TokenAnalyticsDashboard } from '@/components/admin/analytics/token-analytics-dashboard';

export const metadata = {
  title: 'Token Analytics | Admin Dashboard',
  description: 'Comprehensive JWT token management analytics and insights',
};

export default function TokenAnalyticsPage() {
  return (
    <div className="container mx-auto py-6">
      <TokenAnalyticsDashboard />
    </div>
  );
}



