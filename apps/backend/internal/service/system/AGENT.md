# System Services Agent Guide
*Cross-cutting backend services for analytics, imports, and security*

## Contents
- `resource_protection.go` — Core resource protection service.
- Subdirectories:
  - `analytics/` — Metrics and dashboard services.
  - `bulk_import/` — Bulk question import orchestration.
  - `image_processing/` — Image pipelines and worker pools.
  - `image_upload/` — Upload management and validation.
  - `parse_error/` — Error tracking for parsers.
  - `performance/` — Performance optimisation helpers.
  - `security/` — Exam anti-cheat and rate limiting services.

## Maintenance
- Document new subsystems and ensure dependency wiring in `internal/container`.

