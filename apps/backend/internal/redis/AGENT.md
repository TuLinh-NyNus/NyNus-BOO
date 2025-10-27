# Redis Client Agent Guide
*Connection helpers and configuration for Redis-backed caches*

## Files
- `client.go` — Creates Redis client, configures connection pooling, and exposes helpers.

## Usage
- Consumption through `internal/container` and `internal/cache`.
- Supports caching for sessions, rate limiting, and question assets.

## Maintenance
- Keep connection settings in sync with environment defaults.
- Add health checks or metrics integration as required.
