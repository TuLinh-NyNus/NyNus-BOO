# Protocol Buffers Generation Workflow (Windows) — gRPC-Web CLI Standard

This guide standardizes how developers generate protobuf code for both backend (Go) and frontend (Next.js) without duplication or drift, based on CLI gRPC-Web for TypeScript stubs and Buf for Go/gRPC/gateway.

References
- Buf managed config: packages/proto/buf.gen.yaml
- Frontend generated output: apps/frontend/src/generated/
- Common enums/types: packages/proto/common/common.proto
- v1 services: packages/proto/v1/*.proto
- CI lint/breaking: .github/workflows/proto-ci.yaml

Goals
- Use a single generation method per target:
  - Backend (Go): Buf + managed go_package_prefix
  - Frontend (TS): protoc + protoc-gen-grpc-web (messages + service stubs)
- Prevent duplication by NOT using packages/proto/buf.gen.ts.yaml when following CLI gRPC-Web
- Ensure imports compile cleanly and frontend builds consistently

Prerequisites (Windows)
1) Install protoc (managed):
   - scripts/setup/install-protoc.ps1 → installs to tools/protoc/bin/protoc.exe
2) Install gRPC-Web plugin:
   - scripts/setup/setup-grpc-web.ps1 → downloads tools/bin/protoc-gen-grpc-web.exe and installs FE deps (grpc-web, google-protobuf, @improbable-eng/grpc-web types as needed)
3) Include well-known protos:
   - tools/tools/protoc/include (google/api, google/protobuf)

Frontend (TypeScript) — CLI gRPC-Web generation
1) Pin google-protobuf to avoid peer mismatch:
   - cd apps/frontend
   - pnpm add google-protobuf@3.21.2
2) Generate messages and stubs (run in repo root: d:\exam-bank-system)
   - tools\protoc\bin\protoc.exe --proto_path=packages\proto --proto_path=tools\tools\protoc\include --js_out=import_style=commonjs,binary:apps\frontend\src\generated packages\proto\common\common.proto
   - for %f in (packages\proto\v1\*.proto) do (tools\protoc\bin\protoc.exe --proto_path=packages\proto --proto_path=tools\tools\protoc\include --js_out=import_style=commonjs,binary:apps\frontend\src\generated "%f")
   - for %f in (packages\proto\v1\*.proto) do (tools\protoc\bin\protoc.exe --proto_path=packages\proto --proto_path=tools\tools\protoc\include --plugin=protoc-gen-grpc-web=tools\bin\protoc-gen-grpc-web.exe --grpc-web_out=import_style=typescript,mode=grpcwebtext:apps\frontend\src\generated "%f")
3) Import usage in Next.js:
   - Messages: import { LoginRequest } from '@/generated/v1/user_pb';
   - Service stubs: import { UserServiceClient } from '@/generated/v1/user_grpc_web_pb';
   - Endpoint: new UserServiceClient(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080', null, null)
   - Metadata: const md = { 'content-type': 'application/grpc-web+proto', authorization: 'Bearer ...', 'x-session-token': '...' }
   - Example call:
     const client = new UserServiceClient(apiUrl, null, null);
     client.login(loginReq, md, (err, resp) => { /* handle */ });

Important: Do NOT use packages/proto/buf.gen.ts.yaml alongside CLI generation. It produces protobuf messages via protocolbuffers/js that can diverge from CLI outputs. Stick to CLI-only for TS generation.

Backend (Go) — Buf generation (managed mode v2 enabled)
1) State: Buf managed mode v2 go_package_prefix is enabled and pinned; prefix default [test-hash/apps/backend/pkg/proto](packages/proto/buf.gen.yaml:5).
2) Regenerate Go artifacts deterministically:
   - buf lint [packages/proto](packages/proto/buf.yaml:1)
   - buf build [packages/proto](packages/proto/buf.yaml:1)
   - buf generate -c [packages/proto/buf.gen.yaml](packages/proto/buf.gen.yaml:1)
3) Build and tidy:
   - go mod tidy
   - go build ./...
4) Managed mode notes:
   - Per-file option go_package is not required; remove if encountered for clarity. Managed mode controls imports centrally.
   - Generated outputs are written to [apps/backend/pkg/proto](packages/proto/buf.gen.yaml:9) with source_relative paths.
5) Troubleshooting:
   - Ensure [go.mod](go.mod:1) module path matches the managed prefix.
   - If generation produced files under packages/proto/apps/backend/pkg/proto, delete them and re-run generation to avoid drift.

Gateway notes (currently gRPC-first)
- generate_unbound_methods=true is active for development convenience
- No additional google.api.http annotations added per current policy

Tooling versions (pinned)
- Buf CLI: 1.47.2 (see CI pin in [.github/workflows/proto-ci.yaml](.github/workflows/proto-ci.yaml:1))
- protoc: 25.3
- protoc-gen-go: v1.34.1
- protoc-gen-go-grpc: v1.3.0
- protoc-gen-grpc-gateway: v2.19.0
- protoc-gen-grpc-web: latest official binary (protoc-gen-grpc-web.exe); install via scripts/setup/setup-grpc-web.ps1

Native Windows generation (no WSL)
- Unified script: [gen-all-proto.ps1](scripts/development/gen-all-proto.ps1:1)
  - Validates presence of protoc, protoc-gen-go, protoc-gen-go-grpc, protoc-gen-grpc-gateway, and protoc-gen-grpc-web
  - Generates Go via [gen-proto.ps1](tools/scripts/gen-proto.ps1:1)
  - Generates TypeScript via [gen-proto-simple.ps1](scripts/development/gen-proto-simple.ps1:1)
  - Idempotent outputs:
    - Go: apps/backend/pkg/proto/**
    - TS: apps/frontend/src/generated/**
- Troubleshooting:
  - If protoc missing, run scripts/setup/install-protoc.ps1
  - If grpc-web plugin missing, run scripts/setup/setup-grpc-web.ps1
  - Ensure tools/tools/protoc/include is on --proto_path for google/api, google/protobuf

Next.js CommonJS warnings (optional mitigation)
- Current TS generation uses grpc-web (CommonJS). Next.js may emit CommonJS tree-shaking warnings for generated *_pb.js.
- Options:
  - Keep current approach; warnings are benign. Consider Next.js experimental.disableOptimizedLoading or silencing warnings in dev.
  - Plan migration to ESM-compatible generators (e.g., @bufbuild/protobuf + connect-web or ts-proto) for improved SSR/tree-shaking. Migration requires coordinated changes to import paths and runtime clients; do not mix generators concurrently.

CI
- .github/workflows/proto-ci.yaml runs buf lint + breaking checks on PRs against main baseline
- Enforce append-only evolution policy:
  - No enum renumbering (reserve names if deprecated)
  - No field type changes; add new fields with new numbers
  - oneof: only append new variants

Troubleshooting
- Missing protoc: verify tools/protoc/bin/protoc.exe exists after scripts/setup/install-protoc.ps1
- Missing plugin: verify tools/bin/protoc-gen-grpc-web.exe exists after scripts/setup/setup-grpc-web.ps1
- Timestamp types: ensure import "google/protobuf/timestamp.proto" is present in v1 files and include path tools/tools/protoc/include used in CLI
- Next.js build: clear .next cache if switching generator approach
- Peer mismatch: google-protobuf should be 3.21.2 for grpc-web TS stubs

Migration Tips
- If switching from CLI to Connect-Web in future, replace CLI with Buf TS plugins (protobuf-es + connect-web) and remove protoc-gen-grpc-web dependencies/scripts entirely to avoid duplication.
