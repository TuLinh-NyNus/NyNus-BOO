# Archived Proto Files - Future Implementation

These proto files are **fully defined** but **not yet implemented** in the backend.

## Files

### blog.proto
- **Status**: Planned for future
- **Purpose**: Blog post management system
- **Priority**: Low
- **Estimated Implementation**: Q2 2025

### search.proto
- **Status**: Planned for future
- **Purpose**: Advanced search functionality
- **Priority**: Medium
- **Estimated Implementation**: Q1 2025

### import.proto
- **Status**: Planned for future
- **Purpose**: Bulk import functionality
- **Priority**: Low
- **Estimated Implementation**: Q3 2025

### tikz.proto
- **Status**: Planned for future
- **Purpose**: TikZ diagram rendering
- **Priority**: Low
- **Estimated Implementation**: Q3 2025

## How to Restore

When ready to implement:

1. Move proto file back to `packages/proto/v1/`
2. Implement backend service in `apps/backend/internal/grpc/`
3. Register service in `apps/backend/internal/app/app.go`
4. Add HTTP Gateway in `apps/backend/internal/server/http.go`
5. Create frontend client in `apps/frontend/src/services/grpc/`
6. Update documentation

## Why Archived?

These proto files were moved to archive because:
- ✅ Proto definitions are complete and well-designed
- ❌ No backend implementation exists
- ❌ No frontend integration
- ❌ Not registered in HTTP Gateway
- ⚠️ Generated files were causing confusion and build bloat

## Archive Date

**Date**: 2025-01-19
**Reason**: gRPC Proto Standardization - Phase 1 cleanup
**By**: AI Agent following PROTO_STANDARDIZATION_SOLUTION.md
