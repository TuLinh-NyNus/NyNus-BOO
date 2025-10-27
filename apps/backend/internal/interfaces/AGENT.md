# Shared Interfaces Agent Guide
*Common interface definitions reused across services*

## Files
- `services.go` — Interface contracts for cross-package dependencies (e.g., notification sender, cache abstraction).

## Usage
- Ensures decoupling between services/repositories and concrete implementations.
- Facilitates mocking in tests located under `test/backend`.

## Maintenance
- Expand interfaces cautiously; prefer smaller, domain-specific contracts.
- Reflect updates in associated mocks/stubs within tests.
