# OAuth Service Agent Guide
*External OAuth provider integrations*

## Files
- `oauth.go` — Orchestrates OAuth flows and repository interactions.
- `google_client.go` — Google-specific client implementation.

## Maintenance
- Rotate client secrets securely via configuration, not hardcoded values.
- Update scopes and endpoints when providers change APIs.

