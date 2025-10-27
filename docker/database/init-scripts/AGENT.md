# Database Init Scripts Agent Guide
*SQL scripts executed during PostgreSQL container initialization*

## Files
- `03-seed-custom-users.sql`, `03-seed-custom-users-part2.sql`, `03-seed-custom-users-part3.sql` — Seed extended user datasets for testing and demos.

## Usage
- Mounted into `/docker-entrypoint-initdb.d` via docker-compose; executed alphabetically on first boot.

## Maintenance
- Keep filenames ordered with prefixes to control execution.
- Ensure scripts are idempotent to avoid duplicate records.

