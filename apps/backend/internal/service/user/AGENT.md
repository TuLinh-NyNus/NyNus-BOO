# User Service Agent Guide
*User lifecycle, profile management, and session handling*

## Files
- `user_mgmt.go`, `get_user.go`, `list_users.go`, `get_student_list.go` — Core user operations.
- `domain/` — Domain-specific utilities (value objects).
- `oauth/` — OAuth provider integrations.
- `session/` — Session management helpers.

## Maintenance
- Align behaviour with gRPC API (`user.proto`).
- Keep session/OAuth logic consistent with auth middleware.

