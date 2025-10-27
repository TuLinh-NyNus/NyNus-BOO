# Contact Service Agent Guide
*Processes inbound contact/support requests*

## File
- `contact_mgmt.go` — Service handling creation, validation, and routing of contact messages.

## Features
- Stores messages via `repository.ContactRepository`.
- Triggers notifications or emails when appropriate.

## Maintenance
- Add spam filtering or rate limiting hooks if abuse detected.
- Extend tests under `test/backend/service/system` or similar as functionality grows.
