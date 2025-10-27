# OpenSearch Integration Agent Guide
*Backend client and repository wrappers for OpenSearch*

## Files
- `config.go` — Configuration struct and defaults for OpenSearch connection.
- `client.go` — Helper for initialising OpenSearch client with retry/backoff.
- `question_repository.go` — Indexing/search operations for questions.
- `search_service.go` — Higher-level search service used by gRPC handlers.

## Responsibilities
- Provide search capabilities (full-text, filters) complementing PostgreSQL queries.
- Sync question data to OpenSearch indices.

## Maintenance
- Keep index mappings aligned with templates under `docker/opensearch/index-templates`.
- Monitor error handling for bulk indexing; add metrics/logging as needed.
