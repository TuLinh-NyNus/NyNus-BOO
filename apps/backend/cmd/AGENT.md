# Command Entrypoints Agent Guide
*Go binaries and utilities under `cmd/`*

## Files
- `main.go` — Primary server bootstrap (registers services, starts gRPC + HTTP gateways).
- `hash_password.go` — Utility executable for hashing passwords via CLI.
- `test_bcrypt.go` — Tool for verifying bcrypt compatibility/performance.

## Usage
- Build server: `go run ./cmd/main.go` or `make dev`.
- Hash utility: `go run ./cmd/hash_password.go --password <value>`.
- Keep helper tools small and CLI-focused; document flags in code comments.

## Maintenance
- [ ] Add Cobra/Viper if command list grows.
- [ ] Consider moving experimental tools into `tools/` once stable.
