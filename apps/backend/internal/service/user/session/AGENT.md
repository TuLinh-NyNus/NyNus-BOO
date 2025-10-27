# Session Service Agent Guide
*Manages persistent user sessions*

## File
- `session.go` — Session creation, validation, and revocation logic.

## Maintenance
- Ensure session expiries match token lifetimes.
- Integrate with Redis or DB caches for performance as needed.

