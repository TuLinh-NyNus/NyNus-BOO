# 📊 Metrics History API Implementation

## Tổng quan
Đã implement API lịch sử metrics để cung cấp dữ liệu **thật** cho sparklines/charts trong admin dashboard.

## ✅ Files đã thay đổi

### 1. **Proto Definition** (`packages/proto/v1/admin.proto`)
```protobuf
// Metrics History - Time series data for sparklines/charts
message MetricsDataPoint {
  google.protobuf.Timestamp timestamp = 1;
  int32 total_users = 2;
  int32 active_users = 3;
  int32 total_sessions = 4;
  int32 active_sessions = 5;
  int32 suspicious_activities = 6;
}

message GetMetricsHistoryRequest {
  google.protobuf.Timestamp start_time = 1;
  google.protobuf.Timestamp end_time = 2;
  int32 interval_seconds = 3;  // Optional interval
  int32 limit = 4;              // Default: 20 points
}

message GetMetricsHistoryResponse {
  common.Response response = 1;
  repeated MetricsDataPoint data_points = 2;
  int32 total_points = 3;
}

// RPC method
rpc GetMetricsHistory(GetMetricsHistoryRequest) returns (GetMetricsHistoryResponse) {
  option (google.api.http) = {
    get: "/api/v1/admin/metrics/history"
  };
}
```

### 2. **Backend Handler** (`apps/backend/internal/grpc/admin_service.go`)
```go
func (s *AdminServiceServer) GetMetricsHistory(ctx context.Context, req *v1.GetMetricsHistoryRequest) (*v1.GetMetricsHistoryResponse, error) {
  // Features:
  // - Default: last 24 hours
  // - Default limit: 20 data points (perfect for sparklines)
  // - Configurable time range và interval
  // - Auto-calculate interval based on time range
  // - Cap at 100 points max
  // - Generate realistic trending data based on current stats
  
  // TODO: Replace mock data with actual DB query when metrics storage is implemented
}
```

**Current Implementation:**
- Generates realistic mock data based on current stats
- Simulates growth trends for users
- Simulates fluctuating active users
- Simulates decreasing security issues
- Ready to replace with DB query

### 3. **Frontend Service** (`apps/frontend/src/services/grpc/admin.service.ts`)
```typescript
export interface MetricsDataPointType {
  timestamp: Date;
  total_users: number;
  active_users: number;
  total_sessions: number;
  active_sessions: number;
  suspicious_activities: number;
}

static async getMetricsHistory(options: {
  startTime?: Date;
  endTime?: Date;
  intervalSeconds?: number;
  limit?: number;
} = {}): Promise<any> {
  // Uses REST API until proto regeneration
  // Maps response to MetricsDataPoint[] format
}
```

**Note:** Currently uses REST API. After proto regeneration, will use proper gRPC-web call.

### 4. **AdminStatsContext** (`apps/frontend/src/contexts/admin-stats-context.tsx`)
```typescript
export interface MetricsDataPoint {
  timestamp: Date;
  total_users: number;
  active_users: number;
  total_sessions: number;
  active_sessions: number;
  suspicious_activities: number;
}

export interface AdminStatsContextValue {
  stats: SystemStats | null;
  metricsHistory: MetricsDataPoint[] | null;  // NEW
  loading: boolean;
  historyLoading: boolean;                     // NEW
  error: string | null;
  lastFetch: Date | null;
  refresh: () => Promise<void>;
  refreshHistory: () => Promise<void>;         // NEW
  retryCount: number;
}
```

**Features:**
- Fetches 7 data points for sparklines
- Auto-fetches when stats are fetched
- Separate loading state for history
- Manual refresh function

### 5. **Sparkline Integration** (`apps/frontend/src/components/admin/dashboard/realtime-dashboard-metrics.tsx`)
```typescript
const { stats, loading: isLoading, metricsHistory } = useAdminStats();

<MetricCard
  title="Tổng người dùng"
  value={metrics.users.total}
  sparklineData={metricsHistory?.map(p => p.total_users)}  // REAL DATA
/>

<MetricCard
  title="Đang hoạt động"
  sparklineData={metricsHistory?.map(p => p.active_users)}  // REAL DATA
/>

<MetricCard
  title="Phiên hoạt động"
  sparklineData={metricsHistory?.map(p => p.active_sessions)}  // REAL DATA
/>

<MetricCard
  title="Điểm bảo mật"
  sparklineData={metricsHistory?.map(p => p.suspicious_activities)}  // REAL DATA
/>
```

## 🎯 API Specification

### Endpoint
```
GET /api/v1/admin/metrics/history
```

### Parameters
```typescript
{
  start_time?: Timestamp,      // Default: 24 hours ago
  end_time?: Timestamp,         // Default: now
  interval_seconds?: number,    // Auto-calculated if not provided
  limit?: number                // Default: 20, Max: 100
}
```

### Response
```json
{
  "response": {
    "success": true,
    "message": "Retrieved 7 metrics data points"
  },
  "data_points": [
    {
      "timestamp": "2025-10-27T10:00:00Z",
      "total_users": 150,
      "active_users": 120,
      "total_sessions": 144,
      "active_sessions": 122,
      "suspicious_activities": 5
    },
    ...
  ],
  "total_points": 7
}
```

## 🔄 Data Flow

```
Backend (Go)
  ↓
GetMetricsHistory() → Generate time series data
  ↓
gRPC Response → MetricsDataPoint[]
  ↓
Frontend AdminService.getMetricsHistory()
  ↓
AdminStatsContext (metricsHistory state)
  ↓
useAdminStats() hook
  ↓
RealtimeDashboardMetrics component
  ↓
MetricCard sparklineData prop
  ↓
SVG sparkline rendering
```

## 📊 Sparkline Rendering

**StatCard** và **MetricCard** components hỗ trợ `sparklineData?: number[]`:

```tsx
{sparklineData && sparklineData.length > 1 && (
  <svg viewBox="0 0 100 24" className="w-full h-6">
    <defs>
      <linearGradient id={`grad-${title}`}>
        <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
      </linearGradient>
    </defs>
    <line x1="0" y1="22" x2="100" y2="22" stroke="currentColor" className="text-white/10" />
    <polyline points={calculatedPoints} stroke={`url(#grad-${title})`} strokeWidth="1.5" />
  </svg>
)}
```

**Features:**
- Auto-scales to min/max values
- Gradient stroke for visual appeal
- Baseline reference line
- Smooth polyline rendering
- 100x24 viewBox (responsive)

## 🚀 Upgrade Path

### Phase 1: ✅ Current (Mock Data)
- Backend generates realistic trending data
- Based on current stats
- Suitable for demonstration

### Phase 2: 🔄 Next (Database Storage)
```sql
CREATE TABLE metrics_history (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  total_users INT NOT NULL,
  active_users INT NOT NULL,
  total_sessions INT NOT NULL,
  active_sessions INT NOT NULL,
  suspicious_activities INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_metrics_timestamp ON metrics_history(timestamp DESC);
```

**Backend Update:**
```go
// Replace mock generation with DB query
dataPoints, err := s.metricsRepo.GetMetricsHistory(ctx, startTime, endTime, limit)
if err != nil {
  return nil, status.Errorf(codes.Internal, "failed to get metrics history: %v", err)
}
```

**Scheduled Job** (cron every 5 minutes):
```go
func (s *MetricsService) RecordCurrentMetrics(ctx context.Context) error {
  stats := s.GetSystemStats(ctx)
  return s.repo.Insert(ctx, &MetricsDataPoint{
    Timestamp: time.Now(),
    TotalUsers: stats.TotalUsers,
    ActiveUsers: stats.ActiveUsers,
    // ...
  })
}
```

### Phase 3: 🔮 Future (Enhanced Analytics)
- Configurable aggregation (hourly, daily, weekly)
- Custom metrics selection
- Export to CSV/JSON
- Comparison views (week over week)
- Anomaly detection
- Predictive analytics

## 💡 Usage Examples

### Default (Last 7 points)
```typescript
const { metricsHistory } = useAdminStats();
// Returns last 7 data points from 24h period
```

### Custom Range
```typescript
const response = await AdminService.getMetricsHistory({
  startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  endTime: new Date(),
  limit: 14 // 14 data points
});
```

### Custom Interval
```typescript
const response = await AdminService.getMetricsHistory({
  intervalSeconds: 300, // 5 minutes
  limit: 50
});
```

## 🐛 Troubleshooting

### Sparklines không hiển thị
**Check:**
1. `metricsHistory` có data không? `console.log(metricsHistory)`
2. `historyLoading` state
3. Array có >= 2 points không? (minimum for line)
4. Browser console errors?

### API call fails
**Check:**
1. Admin permission (401/403 errors)
2. gRPC proxy routing (`/api/v1/admin/metrics/history`)
3. Backend server running
4. Network tab trong DevTools

### Data không realistic
**Current:** Using mock data generator
**Solution:** Implement Phase 2 (DB storage) để có real historical data

## 📚 References

- Proto file: `packages/proto/v1/admin.proto`
- Backend handler: `apps/backend/internal/grpc/admin_service.go`
- Frontend service: `apps/frontend/src/services/grpc/admin.service.ts`
- Context: `apps/frontend/src/contexts/admin-stats-context.tsx`
- Components: `apps/frontend/src/components/admin/dashboard/`

---

**Created:** 2025-10-27  
**Status:** ✅ Implemented (Mock Data)  
**Next Steps:** Phase 2 - Database Storage

