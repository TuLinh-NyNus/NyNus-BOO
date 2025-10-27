# BookService Implementation Plan

## Objectives
- Provide a fully functional `BookService` on the Go gRPC backend that satisfies every RPC defined in `packages/proto/v1/book.proto`.
- Align the implementation with the library architecture described in `docs/arch/LIBRARY_IMPLEMENT.md`.
- Unlock the admin frontend so it can fetch real book statistics instead of falling back to empty data.

## Scope Summary
1. **Read APIs**: `ListBooks`, `GetBook`, `IncrementDownloadCount` with pagination, filters, and history logging.
2. **Write APIs**: `CreateBook`, `UpdateBook`, `DeleteBook` (soft delete/archiving with audit metadata).
3. **Data model**: Shared base table `library_items` + `library_book_metadata`, tag bridge tables, download history.
4. **Wiring**: Repository, domain service, gRPC handler, dependency container, server registration, migrations.

## Data Design
Create migration `000015_library_book_system` containing:
- `library_items`: core library record (`type='book'`, status, files, ratings, counters).
- `library_book_metadata`: book-specific fields (author, publisher, ISBN, publication metadata, access roles).
- `library_tags` & `library_item_tags`: reusable tagging system.
- `library_download_history`: audit trail for download count increments.
- Supporting indexes for common filters (type/active, category, author, ISBN).

## Implementation Layers
1. **Entity** (`internal/entity/book.go`): aggregate struct merging item + metadata + tags.
2. **Repository** (`internal/repository/book_repository.go`): SQL queries, transactions, tag upserts, pagination, soft delete.
3. **Domain service** (`internal/service/content/book/book_service.go`): validation, defaulting, tag dedupe, role normalization.
4. **gRPC server** (`internal/grpc/book_service.go`): request/response mapping, context-based user metadata, error mapping.
5. **Container wiring** (`internal/container/container.go`): instantiate repository/service, expose gRPC server.
6. **App registration** (`internal/app/app.go`): register the new service and update startup logging.

## Risk & Mitigation Notes
- **Approval workflow**: default to pending/approved flags; future work can add reviewer logic.
- **Search integration**: current implementation uses SQL filters; OpenSearch hook remains a TODO.
- **Role enforcement**: requires future middleware to enforce required role/level on read actions.
- **Seed data**: follow-up migration or seeder work needed for demo environments.

## Verification
- Unit level: rely on repository/service coverage via `go test ./...`.
- Manual: smoke with gRPC-Web (e.g. `ListBooks`) once migrations applied and server restarted.

## Next Steps After Merge
1. Seed sample book data and backfill existing content if any.
2. Implement rating/review aggregation and moderation endpoints.
3. Extend admin UI flows to call create/update/delete RPCs.
