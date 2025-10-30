'use client';

import { DashboardRenderer } from '@nesolagus/dashboard-widgets';

interface DashboardClientProps {
  dashboardConfig: any;
  responses: any[];
}

export function DashboardClient({ dashboardConfig, responses }: DashboardClientProps) {
  if (!dashboardConfig) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">No dashboard configuration available</p>
      </div>
    );
  }

  return (
    <DashboardRenderer
      config={dashboardConfig}
      responses={responses}
      mode="runtime"
    />
  );
}
