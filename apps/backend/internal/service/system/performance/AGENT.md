# Performance Service Agent Guide
*Optimisation routines and monitoring for backend performance*

## Files
- `performance_service.go` — Public service API.
- `performance_monitor.go` — Collects performance metrics.
- `batch_processor.go`, `connection_pool_optimizer.go`, `optimistic_locking.go` — Optimisation helpers.
- Tests: `performance_service_test.go`.

## Maintenance
- Coordinate with `internal/config` when tuning connection pools.
- Expand monitoring integration as new metrics emerge.

