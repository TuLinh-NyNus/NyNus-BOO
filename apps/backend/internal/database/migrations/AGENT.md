# Embedded Migrations Agent Guide
*Backend-local copy of SQL migrations*

## Overview
- Mirrors `packages/database/migrations` for embedding within backend binary.
- Files follow sequential numbering with paired `.up.sql` and `.down.sql`.
- Loaded by `internal/migration` during application startup.

## Maintenance
- Whenever migrations change upstream, update both locations and keep versions aligned.
- Validate with `make migrate` after modifying scripts.
- Note: Avoid editing executed migrations in production; add new files instead.
