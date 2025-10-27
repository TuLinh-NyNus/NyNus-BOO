# Analytics Services Agent Guide
*Collects and serves analytics data for dashboards*

## Files
- `analytics_service.go` — Aggregate metrics provider.
- `dashboard_service.go` — Data for dashboards.
- `monitoring_service.go` — Monitoring/alerting helpers.
- `teacher_analytics_service.go` — Educator-specific insights.
- Tests: `analytics_integration_test.go`.

## Responsibilities
- Query repositories and caches to provide metrics.
- Feed gRPC analytics services consumed by admin/teacher portals.

## Maintenance
- Optimise queries to avoid performance regressions.
- Sync metric definitions with frontend dashboards.

