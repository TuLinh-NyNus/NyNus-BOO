# Common Utilities Agent Guide
*Placeholder for shared packages across backend and frontend*

## Current Status
- Directory intentionally empty; reserved for future cross-application libraries.
- Ideal home for shared Go packages, TypeScript utilities, or configuration DSLs.

## Guidelines
- Before adding code, confirm functionality cannot live in existing app-specific folders.
- Maintain language separation (e.g., Go vs TS) via subfolders to avoid tooling conflicts.
- Document new modules with README or update this file as soon as assets are added.

## Next Steps
- [ ] Evaluate candidates for shared domain definitions (e.g., exam constants, feature flags).
- [ ] Add lint/testing configuration once the first package is introduced.
- [ ] Establish versioning strategy if used by external consumers.
