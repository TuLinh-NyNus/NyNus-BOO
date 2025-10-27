# Cache Layer Agent Guide
*Abstractions and implementations for backend caching*

## Files
- `interface.go` — Defines cache interfaces used across services.
- `exam_cache.go` — In-memory cache implementation for exam data.
- `redis_service.go` — Redis-backed cache client and helpers.

## Responsibilities
- Provide unified cache API for question/exam modules.
- Encapsulate TTL policies and serialization strategy.

## Maintenance
- Keep interfaces small; prefer method-specific interfaces per domain.
- Update Redis configuration to match `internal/config` defaults.
- Add metrics hooks before integrating new cache backends.
