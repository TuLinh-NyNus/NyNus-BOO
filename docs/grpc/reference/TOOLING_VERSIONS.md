# Toolchain & Version Pinning (Buf/Protobuf/Generators)

Tài liệu này mô tả phiên bản công cụ yêu cầu, cách cài đặt và quy trình sinh mã protobuf nhất quán (deterministic) cho backend (Go) và frontend (gRPC‑Web), bao gồm chiến lược fallback native Windows khi Buf local chưa hỗ trợ managed mode v2 go_package_prefix.

Liên quan:
- Cấu hình Buf managed mode: [packages/proto/buf.gen.yaml](packages/proto/buf.gen.yaml:1)
- Cấu hình Buf lint/build/breaking: [packages/proto/buf.yaml](packages/proto/buf.yaml:1)
- Script sinh mã native Windows (tự phát hiện Buf và fallback): [scripts/development/gen-all-proto.ps1](scripts/development/gen-all-proto.ps1:1)
- Fallback Go codegen (protoc + explicit M mappings): [tools/scripts/gen-proto.ps1](tools/scripts/gen-proto.ps1:1)
- Re-export giảm cảnh báo CommonJS trong Next.js: [apps/frontend/src/generated/common/index.ts](apps/frontend/src/generated/common/index.ts:1)

## 1) Phiên bản công cụ đề xuất (đã được CI ghim)

- Buf CLI: v1.47.2 (đã ghim trong CI)  
  - CI cài đặt: xem [CI Proto](.github/workflows/proto-ci.yaml:31)
  - Lý do: Hỗ trợ managed mode v2 `go_package_prefix` trong [packages/proto/buf.gen.yaml](packages/proto/buf.gen.yaml:1)

- protoc (Protocol Buffers Compiler): đề xuất 26.x trở lên (tương thích với các plugin hiện tại)  
  - Artifact hiện tại hiển thị “protoc v6.31.1” trong phần đầu các file `.pb.go`, vì vậy các bản 26.x+ là phù hợp.

- protoc-gen-go: v1.34.1  
  - `go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.34.1`

- protoc-gen-go-grpc: v1.3.0  
  - `go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.3.0`

- protoc-gen-grpc-gateway: v2.19.0  
  - `go install github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-grpc-gateway@v2.19.0`

- protoc-gen-grpc-web (frontend, tuỳ chọn cho Windows): 1.5.0 hoặc mới hơn  
  - Dùng script cài đặt hoặc tải binary chính thức (tham khảo mục 2).

Các phiên bản trên được ghim trong CI để đảm bảo tái lập và codegen nhất quán xuyên OS. Local dev nên bám sát các bản này để tránh chênh lệch.

## 2) Cài đặt nhanh trên Windows

- Cài `protoc` (Windows)
  - Dùng script: [scripts/setup/install-protoc.ps1](scripts/setup/install-protoc.ps1:1)  
  - Hoặc tải từ release chính thức Protobuf, giải nén và thêm vào PATH.

- Cài gRPC‑Web plugin (tuỳ chọn cho frontend TS, khuyến nghị)
  - Dùng script: [scripts/setup/setup-grpc-web.ps1](scripts/setup/setup-grpc-web.ps1:1)  
  - Hoặc tải `protoc-gen-grpc-web.exe` và đặt vào `tools/bin` hay PATH.

- Cài Go plugins:
  - `go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.34.1`
  - `go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.3.0`
  - `go install github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-grpc-gateway@v2.19.0`
  - Đảm bảo `$(go env GOPATH)\bin` nằm trong PATH (Windows).

- Nâng cấp Buf CLI (để dùng managed mode v2 tại local)
  - Tải binary hoặc dùng package manager (Chocolatey/Scoop).
  - Kiểm tra: `buf --version` (yêu cầu ≥ v1.47.2).

## 3) Quy trình sinh mã (cross‑platform, deterministic)

### 3.1 Backend (Go)

- Ưu tiên chạy script native Windows (tự động chọn managed hoặc fallback):
  - `.\scripts\development\gen-all-proto.ps1`
    - Bước 1: Thử `buf lint`, `buf build`, `buf generate` dùng [packages/proto/buf.gen.yaml](packages/proto/buf.gen.yaml:1) nếu Buf local ≥ v1.47.2.
    - Nếu Buf local chưa đạt, script sẽ fallback sang `protoc` với explicit M mappings qua [tools/scripts/gen-proto.ps1](tools/scripts/gen-proto.ps1:35).
    - Output Go `.pb.go` luôn ghi vào `apps/backend/pkg/proto`, ví dụ [apps/backend/pkg/proto/v1/library.pb.go](apps/backend/pkg/proto/v1/library.pb.go:1).

- Sinh mã quyết định nhờ:
  - Buf managed mode (trên CI và local đã nâng Buf) có `go_package_prefix` v2 đảm bảo import về module path chuẩn.
  - Fallback `protoc` (Windows local cũ) dùng `--go_opt M=...` để ép import path trỏ đúng `exam-bank-system/apps/backend/pkg/proto/...` (khớp module trong `apps/backend/go.mod`).

### 3.2 Frontend (gRPC‑Web, tuỳ chọn)

- Khi đã có `protoc-gen-grpc-web`:
  - Script `gen-all-proto.ps1` sẽ gọi `scripts/development/gen-proto-simple.ps1` để sinh `JS`/`d.ts` vào `apps/frontend/src/generated`.
  - Nếu chưa có plugin, script vẫn tiếp tục (non‑blocking) vì backend không phụ thuộc.

## 4) Managed mode v2 và lộ trình loại bỏ `go_package` trong .proto

- [packages/proto/buf.gen.yaml](packages/proto/buf.gen.yaml:1) đã bật `managed.enabled: true` và đặt `go_package_prefix` v2.
- Trên CI, Buf v1.47.2 đã hỗ trợ; vì vậy codegen Go sử dụng prefix này nhất quán.
- Trên máy dev Windows nếu Buf cũ, vẫn codegen ổn nhờ fallback `protoc` (không đụng chạm tới source .proto).
- Lộ trình:
  1) Nâng Buf local ≥ v1.47.2.
  2) Chạy `buf generate` thành công với managed v2.
  3) Gỡ `option go_package = ...` khỏi các file `.proto` (nếu còn), vì đã được quản lý tập trung bởi `go_package_prefix`.
  4) Chạy lại sinh mã và `go mod tidy`, kiểm tra biên dịch.

## 5) Kiểm tra “deterministic codegen” và CI

- CI đã thiết lập:
  - Buf lint/build/breaking so với baseline (main)  
    Xem [CI Proto](.github/workflows/proto-ci.yaml:45)
  - Buf generate (deterministic) và kiểm tra `git diff` không đổi:  
    Xem [CI Proto](.github/workflows/proto-ci.yaml:70)
  - Go build sau `go mod tidy`.

- Dev local:
  - Chạy `.\scripts\development\gen-all-proto.ps1`
  - Chạy `cd apps/backend; go mod tidy; go build ./...`
  - Với frontend, `cd apps/frontend; pnpm build` (non‑blocking các cảnh báo CommonJS đã được giảm thiểu – xem mục 6).

## 6) Giảm cảnh báo Next.js với CommonJS

- Nguồn cảnh báo: `export *` từ module CommonJS `common_pb.js`.
- Giải pháp hiện tại: Re-export có tên trong entry ESM `index.ts` thay cho `export *`:
  - [apps/frontend/src/generated/common/index.ts](apps/frontend/src/generated/common/index.ts:1)
- Kết quả:
  - Build Next.js production không còn cảnh báo “unexpected export *”.
  - Không thay đổi runtime semantics vì `index.ts` chỉ tái xuất danh định các symbol cần thiết.

## 7) Kiểm thử & xác minh

- Backend:
  - `cd apps/backend`
  - `go test ./...` (đã thêm helper [apps/backend/internal/middleware/auth_interceptor.go](apps/backend/internal/middleware/auth_interceptor.go:270) để inject context trong test)
  - Xác minh round‑trip Timestamp tại test [apps/backend/internal/grpc/admin_service_timestamp_test.go](apps/backend/internal/grpc/admin_service_timestamp_test.go:201)

- Frontend:
  - `cd apps/frontend`
  - `pnpm build` (đã xác nhận không còn cảnh báo sau cập nhật re-export)

## 8) Sự cố thường gặp

- Buf local lỗi `go_package_prefix`:
  - Nâng cấp Buf ≥ v1.47.2; hoặc dùng script Windows (tự fallback) [scripts/development/gen-all-proto.ps1](scripts/development/gen-all-proto.ps1:1)

- Thiếu `protoc`/plugin:
  - Kiểm tra bằng script Windows; cài đặt theo hint in ra (xem mục 2).

- gRPC‑Web ENOENT (Windows):
  - Dùng `protoc.exe` + `protoc-gen-grpc-web.exe` native nhanh hơn `grpc-tools` (Node) và tránh lỗi spawn. Cài bằng [scripts/setup/setup-grpc-web.ps1](scripts/setup/setup-grpc-web.ps1:1).

## 9) Tóm tắt lệnh nhanh

- Sinh toàn bộ protobuf (Windows):
  - `.\scripts\development\gen-all-proto.ps1`

- Backend build & test:
  - `cd apps/backend`
  - `go mod tidy && go build ./...`
  - `go test ./...`

- Frontend build:
  - `cd apps/frontend`
  - `pnpm build`

- CI sẽ fail nếu:
  - `buf lint/build/breaking` vi phạm
  - `buf generate` sinh ra diff chưa commit
  - `go build` lỗi

Last Updated: 2023-10-27