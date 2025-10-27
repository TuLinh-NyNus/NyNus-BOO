# Migration Runner Agent Guide
*Executes embedded SQL migrations during startup*

## Files
- `migration.go` — Implements migration runner leveraging `golang-migrate` style logic for embedded files.

## Responsibilities
- Load SQL files from `internal/database/migrations`.
- Apply pending migrations and optionally handle rollbacks.
- Surface errors to startup pipeline so deployment fails fast.

## Maintenance
- Ensure file discovery stays in sync with directory layout.
- Add logging hooks for better observability in production deployments.
