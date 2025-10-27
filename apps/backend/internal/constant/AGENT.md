# Constants Agent Guide
*Shared constant definitions for backend modules*

## Files
- `roles.go` — Role identifiers, hierarchy, and related helpers used for authorization.

## Usage
- Imported by middleware, services, and repositories for RBAC checks.
- Ensure new roles propagate to frontend and documentation.

## Maintenance
- Avoid magic strings elsewhere; extend this package instead.
