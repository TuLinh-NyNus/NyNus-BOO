# MapCode Service Agent Guide
*Maintains MapCode taxonomy and translations*

## File
- `mapcode_mgmt.go` — Business logic for creating, updating, and publishing MapCode data.

## Responsibilities
- Sync MapCode entities with repositories.
- Provide helper methods for translation management and versioning.

## Maintenance
- Coordinate schema changes with `entity/mapcode_version.go`.
- Add validation to prevent duplicate codes or inconsistent hierarchies.
