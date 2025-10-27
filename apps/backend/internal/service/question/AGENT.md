# Question Service Agent Guide
*Question CRUD, filtering, and validation logic*

## Files
- `question_service.go` — Core question operations (create, update, delete, media handling).
- `question_filter_service.go` — Advanced filtering, search, and pagination.
- `validation/` — Validation rules for question/answer structures.

## Dependencies
- Relies on repositories (question, images, tags) and LaTeX utilities.
- Integrates with OpenSearch for advanced filtering where available.

## Maintenance
- Update validation logic when introducing new question formats.
- Ensure bulk import flows remain in sync with service contracts.

