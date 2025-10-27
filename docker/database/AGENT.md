# Database Container Agent Guide
*PostgreSQL bootstrap assets for Docker-based environments*

## Assets
- `init.sql` — Base schema/data executed on first container boot.
- `init-pg-hba.sh` — Adjusts `pg_hba.conf` for dev-friendly authentication.
- `pg_hba.conf`, `pg_hba.conf.temp` — Host-based authentication templates.
- `postgresql.conf.custom` — Tuned configuration overrides (connections, logging, performance).
- `init-scripts/` — Additional SQL/SH helpers executed during init (ordered alphabetically).

## Usage
1. Mount this directory into the postgres service in docker-compose (`/docker-entrypoint-initdb.d`).
2. On first start, scripts run in lexical order; ensure file prefixes reflect desired sequence.
3. Modify configs cautiously—changes may require container recreation (`docker compose down -v`).

## Maintenance Tasks
- [ ] Confirm config aligns with settings in `packages/database/AGENT.md`.
- [ ] Add migration smoke tests to validate `init.sql` after schema updates.
- [ ] Parameterise connection limits for CI vs local dev via environment variables.

## Troubleshooting
- Scripts not running → ensure files retain Unix line endings and executable bit where needed.
- Authentication errors → verify `pg_hba.conf` matches Compose service network subnets.
- Performance regressions → adjust `work_mem`, `shared_buffers` in `postgresql.conf.custom`.
