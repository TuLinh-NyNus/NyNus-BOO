# Workflow Catalog Agent Guide
*Cheat sheet for maintaining scheduled and pull-request automation jobs*

## Directory Scope
- Contains self-contained YAML workflows executed by GitHub Actions.
- Jobs target backend (Go), frontend (Next.js), security scans, and shared CI orchestration.
- Trigger types: `push`, `pull_request`, `workflow_dispatch`, `schedule`.

## File Breakdown
- `ci.yml` — Base reusable workflow exposing lint/test jobs via `workflow_call`.
- `backend.yml` — Invokes Go build, lint (golangci-lint), unit tests, and docker build validations.
- `frontend.yml` — Handles pnpm setup, dependency caching, lint, type-check, and Next.js build.
- `security-scan.yml` — Runs Trivy container scans, npm audit, and dependency review weekly.

## Editing Guidelines
- Keep matrix entries aligned with supported Go / Node versions from root configuration.
- Use `actions/cache` with unique keys per toolchain (`pnpm-lock.yaml`, `go.sum`).
- Reference secrets via `${{ secrets.NAME }}`; never hardcode credentials.
- Run `act` locally with `-W <workflow>` to sanity-check major changes.

## Troubleshooting
- `pnpm install` failures → ensure `corepack enable` step precedes install.
- Go builds failing with missing proto → add `make proto` step or cache `packages/proto/gen`.
- Cron jobs not firing → confirm UTC schedule aligns with expected time.
- Workflow fails on permissions → add `permissions:` block with least privilege.

## Pending Improvements
- [ ] Extract shared setup into composite actions under `.github/actions`.
- [ ] Add integration test job once docker-compose stack is CI friendly.
- [ ] Enforce concurrency groups to prevent overlapping heavy runs.

## Resources
- Actions runner docs: https://docs.github.com/actions/using-github-hosted-runners
- Workflow syntax reference: https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions
- Troubleshooting guide: https://docs.github.com/actions/monitoring-and-troubleshooting-workflows
