# Configuration Agent Guide
*Runtime configuration loading for the backend service*

## Files
- `config.go` — Core configuration struct, environment parsing, helpers.
- `auth_config.go` — Auth/JWT configuration details.
- `production.go` — Production-specific settings and validation.

## Sources
- Values loaded from `.env`, environment variables, and sensible defaults.
- Integrates with `config.ValidateProductionConfig` to ensure secure settings.

## Maintenance
- Document new configuration fields here and in `/docs/deployment/`.
- Keep defaults aligned with docker-compose and k8s manifests.
- Add unit tests when introducing critical validation logic.
