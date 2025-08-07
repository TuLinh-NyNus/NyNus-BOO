'use client';

import DashboardCharts from './charts';
import DashboardStats from './stats';

export { DashboardCharts, DashboardStats };

// Main overview component that combines stats and charts
export default function DashboardOverview() {
  return (
    <div className="space-y-8">
      <DashboardStats />
      <DashboardCharts />
    </div>
  );
} 
