# GitHub Automation Agent Guide
*Reference for AI agents maintaining GitHub configuration*

## Overview
- Stores automation metadata for CI/CD, dependency updates, and shared repository settings.
- Primary consumers: GitHub Actions runners, Dependabot service, project maintainers.
- Changes here influence pipeline behaviour immediately after merge to default branch.

## Contents
- `workflows/` — YAML pipelines for backend, frontend, security, and shared CI jobs.
- `dependabot.yml` — Dependency update schedule covering Go modules, npm packages, Dockerfiles.

## Key Workflows
- `ci.yml` orchestrates shared lint/test matrices used by both apps.
- `backend.yml` handles Go specific build, lint, test, and docker image validation.
- `frontend.yml` runs pnpm install, lint, type-check, and build for Next.js.
- `security-scan.yml` triggers Trivy and npm audit scans on schedule and pull requests.

## How To Extend
1. Duplicate an existing job block when adding new test suites.
2. Reuse reusable workflows kept in `ci.yml` via `workflow_call` if possible.
3. Validate syntax locally with `act` (`act -j <job-name>`) before pushing.
4. Keep runtime versions coherent with `engines` declared in `package.json` and `go.mod`.

## Common Fixes
- Pipeline fails on missing secrets → request them via repository settings → Secrets and variables.
- Caching issues after dependency changes → bump `cache-key` suffixes in workflow steps.
- Dependabot noisy PRs → adjust `ignore` rules or update interval in `dependabot.yml`.

## Next Tasks
- [ ] Introduce integration tests workflow once e2e suite stabilises.
- [ ] Add CodeQL analysis job with language packs for Go and JavaScript.
- [ ] Consolidate repeated Node setup steps by referencing `ci.yml` composite actions.

## Helpful Links
- GitHub Actions syntax: https://docs.github.com/actions
- Dependabot configuration: https://docs.github.com/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file
- Local runner (`act`) usage: https://nektosact.com/introduction.html
