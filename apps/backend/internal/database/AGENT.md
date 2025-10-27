# Database Layer Agent Guide
*Database connection management and embedded migrations*

## Files
- `database.go` — Helpers for establishing SQL connections and shared database utilities.
- `migrations/` — Embedded SQL migrations mirrored from `packages/database`.

## Usage
- `internal/app` references this package to initialise connections.
- Migration runner (`internal/migration`) scans `migrations/` when executing.

## Maintenance
- Keep migration copies in sync with `packages/database/migrations`.
- Update documentation if connection helpers change configuration defaults.
