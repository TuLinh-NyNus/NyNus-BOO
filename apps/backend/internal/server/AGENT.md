# HTTP Gateway Agent Guide
*gRPC-Gateway and gRPC-Web HTTP server wrapper*

## Files
- `http.go` — Sets up HTTP server bridging REST/gRPC requests, configures CORS, gRPC-Web handlers.

## Usage
- Instantiated via `internal/app` when HTTP gateway is enabled.
- Provides health checks and routing for web clients.

## Maintenance
- Update allowed origins/headers alongside frontend deployments.
- Ensure graceful shutdown support remains intact for production rollouts.
