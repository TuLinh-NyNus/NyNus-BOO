# Parse Error Service Agent Guide
*Tracks and reports parsing errors during imports*

## File
- `parse_error_mgmt.go` — Persists parsing errors and provides retrieval APIs.

## Usage
- Called by bulk import flows to capture structured diagnostics.

## Maintenance
- Add clean-up routines/pruning to prevent table growth.

