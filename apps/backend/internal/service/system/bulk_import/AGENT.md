# Bulk Import Service Agent Guide
*Handles large question/import batches*

## File
- `bulk_import_mgmt.go` — Orchestrates parsing, validation, and persistence for bulk imports.

## Features
- Interfaces with parsing pipeline, validation services, and repositories.
- Tracks errors for reporting via `parse_error` service.

## Maintenance
- Add resilience (retry/backoff) for large batches.
- Ensure idempotency when reprocessing failed batches.

