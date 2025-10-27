# Utility Helpers Agent Guide
*Shared helper functions across backend modules*

## Files
- `device_fingerprint.go` — Device fingerprint utilities.
- `idutil.go` — UUID/ID generation helpers.
- `interceptors.go` — Helper functions shared by interceptors.
- `pgtype_converter.go` — Database type converters.
- `questioncode_parser.go` — Parser utilities for question codes.

## Maintenance
- Keep utilities focused; consider package-specific helpers if scope broadens.
- Add tests when adding non-trivial logic.

