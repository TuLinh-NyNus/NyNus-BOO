/**
 * Debug component để kiểm tra metrics data
 */
'use client';

import { useAdminStats } from '@/contexts/admin-stats-context';

export function MetricsDebug() {
  const { stats, metricsHistory, loading, historyLoading, error } = useAdminStats();

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h3 className="font-bold mb-2">🔍 Metrics Debug Info</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>History Loading:</strong> {historyLoading ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Error:</strong> {error || 'None'}
        </div>
        
        <div>
          <strong>Current Stats:</strong>
          {stats ? (
            <pre className="text-xs bg-white dark:bg-gray-900 p-2 rounded mt-1">
              {JSON.stringify(stats, null, 2)}
            </pre>
          ) : (
            ' No data'
          )}
        </div>
        
        <div>
          <strong>Metrics History:</strong>
          {metricsHistory && metricsHistory.length > 0 ? (
            <div>
              <div>Count: {metricsHistory.length} points</div>
              <pre className="text-xs bg-white dark:bg-gray-900 p-2 rounded mt-1 max-h-40 overflow-y-auto">
                {JSON.stringify(metricsHistory, null, 2)}
              </pre>
            </div>
          ) : (
            ' No history data'
          )}
        </div>
      </div>
    </div>
  );
}


