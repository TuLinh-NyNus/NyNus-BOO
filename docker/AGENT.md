# Docker Orchestration Agent Guide
*Reference for containerisation assets supporting NyNus Exam Bank*

## Overview
- Provides Dockerfiles, Compose bundles, and environment docs for local and production deployments.
- Targets backend (Go), frontend (Next.js), PostgreSQL, OpenSearch, and auxiliary tooling.

## Key Files & Folders
- `backend.Dockerfile` / `backend.prod.Dockerfile` — Development vs production images for Go service.
- `frontend.prod.Dockerfile` — Production-ready Next.js build with gRPC-Web proxy configuration.
- `prisma-studio.Dockerfile` — Utility container for inspecting database via Prisma Studio.
- `compose/` — docker-compose stacks for dev/test setups (`docker-compose.dev.yml`, etc.).
- `database/` — Volume initialisation scripts, seed helpers, healthchecks for PostgreSQL.
- `opensearch/` — Config templates and dashboards for OpenSearch integration.
- `DEVELOPMENT_GUIDE.md`, `DOCKER_SETUP.md`, `README.md` — Operational documentation.

## Workflows
1. Build local images with `docker compose -f docker/compose/docker-compose.dev.yml build`.
2. Start stack `docker compose -f docker/compose/docker-compose.dev.yml up -d`.
3. Tail logs using `docker compose logs -f backend` or `frontend`.
4. Tear down via `docker compose down -v` when resetting data.

## Maintenance Tasks
- [ ] Align base image versions with language upgrades (`Go 1.23.x`, `Node 20.x`).
- [ ] Optimise multi-stage builds to reduce final image size (<300MB target).
- [ ] Add healthcheck endpoints for new services before wiring into Compose.

## Troubleshooting
- Build cache stale → run `docker builder prune` or bump `ARG` versions.
- gRPC-Web proxy fails → ensure Envoy/Nginx configs match backend port 8080.
- Database init scripts rerun → guard with `if [ ! -f /var/lib/postgresql/data/.init_done ]`.

## References
- Docker docs: https://docs.docker.com/
- Compose specification: https://docs.docker.com/compose/compose-file/
- Production hardening checklist: `docs/deployment/containers.md`
