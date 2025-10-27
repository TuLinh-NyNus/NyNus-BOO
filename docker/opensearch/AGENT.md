# OpenSearch Stack Agent Guide
*Artifacts for search indexing and dashboard tooling*

## Components
- `opensearch.yml` — Node configuration (cluster name, memory, auth).
- `opensearch-dashboards.yml` — Dashboard settings and auth mapping.
- `.env.opensearch` — Environment defaults used by docker-compose profiles.
- `init-opensearch.sh` — Bootstraps indices, templates, and ingest pipelines.
- `index-templates/` — JSON templates defining mappings/settings per index.
- `synonyms/` — Synonym lists consumed during index creation.
- `README.md` — Detailed setup walkthrough and troubleshooting.

## Workflow
1. Start OpenSearch via `docker compose -f docker/compose/docker-compose.dev.yml up opensearch`.
2. Script `init-opensearch.sh` seeds templates and synonyms; rerun after modifications.
3. Backend repository integrates via `internal/opensearch` client.

## Maintenance
- [ ] Align index templates with latest question schema fields (`packages/database`).
- [ ] Add automated verification step invoking `_cat/indices` after init.
- [ ] Update synonyms quarterly with domain expert input.

## Troubleshooting
- Cluster fails to start → adjust JVM heap (`OPENSEARCH_JAVA_OPTS`) in `.env.opensearch`.
- Auth errors in dashboards → ensure credentials match environment variables referenced in Compose file.
- Mappings outdated → delete index (`DELETE /<index>`) then re-run init script.
