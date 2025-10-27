# Middleware Interceptors Agent Guide
*gRPC interceptor chain for security, auditing, and rate limiting*

## Components
- `auth_interceptor.go`, `session_interceptor.go` — Authentication/session validation.
- `role_level_interceptor.go`, `resource_protection_interceptor.go` — Authorization and access tracking.
- `rate_limit_interceptor.go` — Per-user and global rate limiting.
- `csrf_interceptor.go` — CSRF token validation for gRPC-Web clients.
- `audit_log_interceptor.go` — Structured audit logging after successful authorization.
- `security_interceptor.go`, `auth_constants.go`, `security_constants.go` — Shared constants and helpers.

## Testing
- `csrf_interceptor_test.go` — Example test; add more as new interceptors are introduced.

## Integration
- Interceptors registered via `internal/container` and applied in `internal/app` in strict order.

## Maintenance
- Keep interceptors idempotent and context-aware.
- Add Prometheus metrics hooks when introducing new security features.
