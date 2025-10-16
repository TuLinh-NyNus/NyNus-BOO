# Exam Alignment Decision

- Strategy: A (Align with ExamSystem.md + migration 000008)
- Rationale: single source of truth (docs/arch/ExamSystem.md), DB already migrated via 000008, better semantics (source_institution/file_url, exam_year as string), reduces tech debt vs reverting DB.
- Scope: Proto (packages/proto/v1 and apps/backend/pkg/proto/v1), Entity (exam.go), Repository (SQL/scan/filters), gRPC (converters/handlers), FE types, Docs.
- Rollback: Revert proto and code changes; use 000008 down migration if absolutely necessary.
