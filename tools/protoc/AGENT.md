# Protoc Bundle Agent Guide
*Embedded Protocol Buffers compiler distribution*

## Contents
- `readme.txt` — Original installation notes from protoc distribution.
- `include/` — Standard `.proto` definitions required during compilation (google/api, etc.).
- Binary `protoc.exe` lives in `tools/protoc/bin/` (ensure PATH references point here).

## Usage
- Scripts reference `${REPO}/tools/protoc/bin/protoc.exe`; avoid installing global protoc unless necessary.
- When upgrading protoc, replace entire bundle and update version references in scripts and documentation.

## Maintenance
- [ ] Verify executable version with `protoc --version` after updates.
- [ ] Sync include files with official release to avoid mismatched annotations.
- [ ] Document any custom patches applied to bundled proto includes.
