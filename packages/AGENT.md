# Shared Packages Agent Guide
*Index for reusable assets shared across applications*

## Modules
- `database/` — SQL migrations, seeds, and database documentation (see package AGENT).
- `proto/` — Protocol Buffer definitions and generated artefacts.

## Responsibilities
- Maintain cross-service contracts and migration scripts centrally.
- Provide language-agnostic assets consumed by both backend and frontend.
- Serve as source of truth for schema evolution and API definitions.

## Coordination Tasks
- [ ] Regenerate generated code whenever `.proto` files change.
- [ ] Keep migration numbers aligned with backend expectations.
- [ ] Version control large artefacts carefully; avoid committing compiled binaries.

## Troubleshooting
- Build failing due to missing generated assets → run `make proto` and commit updates.
- Migration conflicts → rebase and renumber using timestamps to prevent collisions.
