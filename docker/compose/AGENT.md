# Compose Stacks Agent Guide
*Cheat sheet for docker-compose configurations across environments*

## Contents
- `.env`, `.env.example` — Default environment variables for Compose stacks.
- `docker-compose.dev.yml` — Full development stack (backend, frontend, postgres, opensearch).
- `docker-compose.backend-only.yml` — Lightweight stack for backend + database.
- `docker-compose.prod.yml` — Production-like deployment with hardened settings.
- `docker-compose.seed.yml` — Adds seeding jobs/migrations on boot.
- `docker-compose.pgadmin.yml`, `docker-compose.prisma-studio.yml` — Optional admin tooling.
- Documentation (`README.md`, `QUICK_START.md`, `BACKEND_ONLY_GUIDE.md`, `DOCKER_SETUP_SUMMARY.md`, `REVIEW_CHECKLIST.md`) describes usage scenarios.
- `test-docker-setup.js` — Smoke test verifying services boot correctly.

## Usage Patterns
```powershell
# start full dev stack
docker compose -f docker/compose/docker-compose.dev.yml up -d

# backend-only
docker compose -f docker/compose/docker-compose.backend-only.yml up -d

# seed database
docker compose -f docker/compose/docker-compose.seed.yml up migrate seed --abort-on-container-exit
```

## Best Practices
- Copy `.env.example` to `.env` then adjust credentials before running stacks.
- Use `--profile` flags in Compose files that support optional services.
- Align ports with `.env` settings used by backend/frontend `.env` files.
- Clean volumes with `docker compose down -v` when schema changes drastically.

## Pending Tasks
- [ ] Add integration test stack hooking Cypress once e2e suite is ready.
- [ ] Automate smoke test (`test-docker-setup.js`) inside CI workflow.
- [ ] Document resource requirements (CPU/RAM) per stack.

## Troubleshooting
- Compose complains about version mismatch → ensure Docker Engine >= 24.
- Service restart loops → check healthcheck definitions and dependent service readiness.
- `.env` not applied → run commands from repository root or pass `--env-file`.
