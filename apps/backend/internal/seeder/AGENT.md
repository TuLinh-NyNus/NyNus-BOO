# Database Seeder Agent Guide
*Populate default data sets for local and test environments*

## Files
- `seeder.go` — Implements seeding routines for default users, sample questions, etc.

## Usage
- Invoked from `internal/app` (optional) or manual scripts/tests.
- Works alongside migrations to ensure consistent baseline data.

## Maintenance
- Keep seed data aligned with current schema and business rules.
- Provide idempotent operations to avoid duplicate records.
