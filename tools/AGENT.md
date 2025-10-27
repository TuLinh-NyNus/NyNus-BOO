# Tooling Assets Agent Guide
*Catalog of auxiliary tools supporting development and data workflows*

## Directories
- `protoc/` — Bundled Protocol Buffers compiler and includes for offline builds.
- `protoc-gen-grpc-web.exe` — gRPC-Web plugin binary used by frontend code generation.
- `image/` — Python utilities for question image processing (resize, optimisation).
- `parsing-question/` — Streamlit app + libs for parsing imported questions.
- `scripts/` — Helper scripts for toolchain management.
- `tools/` — Legacy or experimental utility scripts (verify contents before use).

## Usage Guidelines
- Keep binary versions aligned with scripts in `scripts/development/`.
- Python-based tools require dependencies listed in their respective `requirements.txt`.
- When updating protoc, adjust PATH references inside scripts and AGENT docs accordingly.

## Maintenance
- [ ] Automate integrity checks (e.g., hash verification) for bundled binaries.
- [ ] Add Dockerfiles for Python utilities to ensure reproducible environments.
- [ ] Document any new experimental tools before wider adoption.

## Troubleshooting
- gRPC generation fails → verify `protoc` and `protoc-gen-grpc-web.exe` paths.
- Python script crashes → install dependencies via `pip install -r requirements.txt`.
