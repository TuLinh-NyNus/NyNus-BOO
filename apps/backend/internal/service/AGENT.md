# Domain Services Agent Guide
*Business logic layer sitting above repositories and below transports*

## Submodules
- `auth/` — Authentication, JWT management, session lifecycle.
- `content/` — Contact forms, newsletter, MapCode management.
- `exam/` — Exam creation, scheduling, scoring helpers.
- `notification/` — Notification sending and preferences.
- `question/` — Question CRUD, filtering, validation.
- `system/` — Cross-cutting services (analytics, bulk import, security, resource protection).
- `user/` — User profile, OAuth, session management.

## Patterns
- Services accept repositories and infrastructure dependencies via constructor injection.
- Export interfaces for gRPC handlers and other consumers.
- Tests live in `test/backend/service/**`.

## Maintenance
- Keep service boundaries aligned with gRPC API structure.
- Document new modules in this AGENT and relevant submodule guides.
