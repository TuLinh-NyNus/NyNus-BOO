# Application Bootstrap Agent Guide
*Lifecycle orchestration for the Go backend*

## Responsibilities
- Initialize configuration, database connections, dependency container, gRPC/HTTP servers.
- Run migrations and (optionally) seed default data on startup.
- Expose graceful shutdown entrypoints used by `cmd/main.go`.

## Key File
- `app.go` — Main application struct with lifecycle methods: `NewApp`, `initDatabase`, `initGRPCServer`, `Shutdown`.

## Integration
- Consumes `internal/config`, `internal/container`, `internal/migration`, and `internal/server`.
- Registers gRPC services via `pkg/proto/v1` generated stubs.

## Maintenance Tips
- Update pool sizing defaults when production load patterns change.
- Keep interceptor order consistent with security requirements.
- Extend `logStartupInfo` when introducing new services.
