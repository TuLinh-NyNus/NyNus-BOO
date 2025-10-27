# Auth Service Agent Guide
*Authentication, JWT, and credential management logic*

## Capabilities
- Handle login, registration, token refresh, logout flows.
- Manage unified JWT services (`unified_jwt_service.go`) supporting rotation and validation.
- Provide helper utilities for token validation (`jwt_validation.go`) and error handling.

## Key Files
- `auth_service.go` / `auth_management.go` — Core service implementations.
- `jwt_adapter.go`, `jwt_service_interface.go` — Abstractions over JWT providers.
- `unified_jwt_service.go` — Consolidated JWT issuance/verification.
- Tests: `auth_service_test.go`, `unified_jwt_service_test.go`.

## Integration
- Consumed by gRPC handlers and middleware for authentication checks.
- Relies on repositories for users, sessions, refresh tokens.

## Maintenance
- Update token expiry defaults in sync with frontend and config packages.
- Add tests for new auth flows before exposing via API.
