# Backend Internal Modules Agent Guide
*Core application logic shared across backend services*

## Structure Overview
- `app/` — Application bootstrap and lifecycle helpers.
- `cache/` — Cache abstractions (Redis adapters, in-memory implementations).
- `config/` — Environment configuration loading and structs.
- `constant/` — Shared constants (roles, limits).
- `container/` — Dependency injection / service wiring.
- `database/` — DB connections and embedded migrations runner.
- `entity/` — Domain entities mapping to database tables.
- `grpc/` — Service implementations (documented separately).
- `interfaces/` — Shared interface contracts.
- `latex/` — LaTeX parsing utilities for question content.
- `middleware/` — gRPC interceptors for auth, rate limiting, auditing.
- `migration/` — Migration runner orchestrating `packages/database` scripts.
- `opensearch/` — Search client integration.
- `redis/` — Redis client configuration.
- `repository/` — Data access layer (see dedicated AGENT).
- `seeder/` — Database seeders for local/dev data.
- `server/` — HTTP/gRPC server wrappers.
- `service/` — Domain service implementations (business logic).
- `services/` — External service integrations (email, etc.).
- `util/` — Utility helpers.
- `validation/` — Validation logic for inputs and filters.

## Contribution Tips
- Follow clean architecture: entities + repositories stay decoupled from transports.
- Update relevant AGENT files when adding new submodules.
- Run `go test ./internal/...` after structural changes.
