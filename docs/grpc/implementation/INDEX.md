#  Implementation - Kỹ Thuật Triển Khai

Cài đặt, sinh code, validation.

## 📚 Files Trong Mục Này

1. **GENERATION_WORKFLOW.md** (95 dòng)
   - Cài đặt protoc + tools
   - Sinh Go code
   - Sinh TypeScript code
   - Validation
   - Windows-specific guide

## 🎯 Sử Dụng

Khi bạn modify .proto files, chạy workflow này:

\\\
1. buf lint (validate proto syntax)
2. buf generate (generate code)
3. go mod tidy (Go dependencies)
4. pnpm install (TypeScript dependencies)
\\\

---

Guides: [../guides/](../guides/)
