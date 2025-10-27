# Backend Deployment Docs Agent Guide
*References for deploying the Go backend service*

## Files
- `PRODUCTION_GRPC_POLICY.md` — Guidelines for securing gRPC endpoints in production (auth, TLS, rate limits).

## Usage
- Consult when updating ingress policies or rolling out new environments.
- Link related ADRs or runbooks from `/docs/deployment/` when adding new documents.

## Next Steps
- [ ] Add rollout checklist covering migrations + config sync.
- [ ] Document blue/green strategy once infrastructure supports it.
