# Dependency Container Agent Guide
*Wire-up for backend repositories, services, and middleware*

## Responsibilities
- Instantiate shared infrastructure clients (PostgreSQL, Redis, OpenSearch).
- Construct repositories, domain services, gRPC service structs, and interceptors.
- Provide accessor methods so other packages retrieve pre-wired dependencies.

## Key File
- `container.go` — Central registry building all components and exposing getters.

## Usage
- Created in `internal/app` during application startup.
- Pass container references to gRPC server registrations and middleware.

## Maintenance Tips
- Group new dependencies logically to keep constructor manageable.
- Ensure cleanup closes any long-lived connections.
- Update AGENT + docs when adding/removing service modules.
