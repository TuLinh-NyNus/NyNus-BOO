# Domain Entities Agent Guide
*Go structs representing persisted domain models*

## Purpose
- Define types mapping to PostgreSQL tables and supporting JSON/gRPC representations.
- Centralise validation tags, table metadata, and helper methods per entity.

## Common Entities
- `user.go` — User profile, roles, status.
- `question.go`, `question_code.go`, `question_tag.go` — Question bank domain.
- `exam.go`, `exam_attempt.go` — Exam/attempt lifecycle.
- `newsletter.go`, `contact.go` — Communication channels.
- `question_statistics.go`, `question_feedback.go` — Analytics-related data.

## Guidelines
- Keep structs in sync with migrations (`packages/database`).
- Add unit tests when adding computed fields or helper methods.
- Use time types with timezone awareness for cross-region correctness.
