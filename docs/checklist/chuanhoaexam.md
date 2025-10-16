# Checklist Chuẩn Hóa Exam — PHƯƠNG ÁN A (Align 100% với ExamSystem.md + 000008)

Mục tiêu: Đồng bộ 100% với tài liệu thiết kế và migration 000008 (DB dùng `source_institution`, `file_url`, `exam_year` VARCHAR(10)). Loại bỏ sai khác và mapping tạm thời.

Tóm tắt thay đổi then chốt Phương án A
- Official fields theo DB/Design: `source_institution` (string), `file_url` (string), `exam_year` (string).
- Loại bỏ các cột cũ đã bị 000008 bỏ: `is_official`, `exam_season`, `province`.
- Proto/gRPC/Entity/Repo phải đổi để trùng tên và kiểu với DB.

---

## 0) Khởi tạo và ghi quyết định
- [x] Tạo branch: `feat/exam-align-A` (logic làm việc theo A)
- [x] Ghi nhận quyết định: `docs/TODO/Exam-Alignment-Decision.md` (chọn A, tác động, rollback plan)

---

## 1) Proto v1/exam.proto — chốt field names/types theo A
File: `packages/proto/v1/exam.proto`

- [x] message `Exam`: đảm bảo có và đúng tên/kiểu:
  - Official: `source_institution: string`, `exam_year: string`, `exam_code: string`, `file_url: string`
  - Settings: `shuffle_questions`, `shuffle_answers`, `show_results`, `show_answers`, `allow_review`, `max_attempts`, `chapter`
  - Metadata: `version`, `question_ids`, `created_by`, `updated_by`, `published_at`, `created_at`, `updated_at`
- [x] message `CreateExamRequest`/`UpdateExamRequest`: dùng `source_institution`, `exam_year (string)`, `file_url`; bỏ hoàn toàn `school_name`, `source_file_path`, `exam_year int32`
- [x] message `ListExamsRequest`: nếu có filters, dùng `repeated string exam_year`, `repeated string source_institution`
- [x] Giữ enums đã đúng (ExamStatus/ExamType/Difficulty/AttemptStatus)
- [x] Kiểm tra các message khác (ExamAnswer/ExamResult/ExamStatistics/UserPerformance) không xung đột với entity/repo

Regenerate stubs
- [ ] `cd packages/proto && protoc -I . --go_out=. --go-grpc_out=. v1/exam.proto`
- [ ] `tools/scripts/gen-proto.sh` (Windows cần protoc sẵn)
- [ ] Sửa lỗi biên dịch phát sinh do đổi field/kiểu (tiếp tục các bước dưới)

---

## 2) Entity — đổi tên/kiểu trường cho khớp DB
File: `apps/backend/internal/entity/exam.go`

- [x] Đổi/trùng tên official fields:
  - `SchoolName *string` → `SourceInstitution *string` (tag: `json:"source_institution,omitempty" db:"source_institution"`)
  - `SourceFilePath *string` → `FileURL *string` (tag: `json:"file_url,omitempty" db:"file_url"`)
  - `ExamYear *int` → `ExamYear *string` (tag: `json:"exam_year,omitempty" db:"exam_year"`)
- [x] Loại bỏ các trường không còn trong DB: `IsOfficial`, `ExamSeason`, `Province`
- [x] Rà các tag json/db cho `ShuffleAnswers`, `ShowAnswers`, `AllowReview`, `Chapter` đã đúng
- [x] Cập nhật `NewExam(...)` khởi tạo theo kiểu mới (ExamYear/official fields = nil)

---

## 3) Repository — sửa SQL và Scan/Exec theo DB mới
File: `apps/backend/internal/repository/exam_repository.go`

- [x] INSERT `exams`: bỏ hoàn toàn các cột bị drop (`is_official`, `exam_season`, `province`); dùng đúng tên cột mới `source_institution`, `file_url`; `exam_year` kiểu text (scan vào `*string`)
- [x] UPDATE `exams`: tương tự — bỏ cột drop, dùng tên mới
- [x] SELECT `GetByID`: cập nhật danh sách cột select và thứ tự Scan:
  - Dùng `source_institution`, `file_url`, `exam_year` (text)
  - Không select `is_official`, `exam_season`, `province`
- [x] Các hàm khác (List/Search/FindBy*/Analytics) nếu có tham chiếu trường cũ — cập nhật tương ứng
- [x] Kiểm tra indexes/WHERE dùng `status = 'ACTIVE'` (khớp design)

Interfaces/filters
File: `apps/backend/internal/repository/interfaces/exam_repository.go`
- [x] `ExamFilters`: đổi `SourceInstitution []string`, `ExamYear []string` (loại `SchoolName`, `[]int`)
- [x] `OfficialExamFilters`: đổi `SourceInstitution []string`, `ExamYear []string`
- [x] Cập nhật chữ ký các hàm tìm kiếm/locate official exams để dùng trường mới

Search & Replace tham khảo
- [ ] Tìm tất cả tham chiếu cần đổi: `rg -n "school_name|source_file_path|is_official|exam_season|province|ExamYear\s*\*int"`

---

## 4) gRPC server — converters/handlers đồng bộ với proto mới
File: `apps/backend/internal/grpc/exam_service.go`

Converters
- [x] `convertProtoToExam`/`convertUpdateProtoToExam`:
  - Map `req.source_institution` → `exam.SourceInstitution`
  - Map `req.file_url` → `exam.FileURL`
  - Map `req.exam_year (string)` → `exam.ExamYear (*string)` (dùng helper `stringToStringPtr`)
  - Giữ mapping settings: `shuffle_*`, `show_*`, `allow_review`, `chapter`
- [x] `convertExamToProto`:
  - Map `exam.SourceInstitution` → `proto.source_institution`
  - Map `exam.FileURL` → `proto.file_url`
  - Map `exam.ExamYear (*string)` → `proto.exam_year (string)`

Handlers
- [x] `ListExams`: đọc offset/limit/sort_* từ request (phù hợp stub hiện tại)
- [x] `SubmitExam`: bỏ TODO, trả đủ `ExamResult` (score/percentage/passed/total_points/feedback/created_at)
- [x] Rà soát validate inputs và error codes thống nhất
Lưu ý: sẽ đổi sang `common.Pagination*` sau khi regenerate proto.

---

## 5) Service layer — xác nhận không lệch semantics
File: `apps/backend/internal/service/exam/exam_service.go`

- [x] Publish/Archive/CRUD logic không phụ thuộc trường bị drop
- [x] `StartExamAttempt`/`SubmitExamAnswer`/`GetAttemptWithAnswers` hoạt động bình thường sau đổi kiểu ExamYear
- [x] Thống kê/analytics trả dữ liệu phù hợp gRPC messages

---

## 6) Database migrations — kiểm chứng trạng thái theo 000008
- [ ] Đảm bảo `apps/backend/internal/database/migrations/000008_align_exam_schema_with_design.up.sql` đã được áp dụng trên môi trường dev/test
- [ ] Nếu chưa: áp dụng và kiểm tra indexes mới (official indexes, status ACTIVE)

---

## 7) Frontend types (nếu dùng)
File: `apps/frontend/src/types/exam.ts`
- [x] Đổi `schoolName` → `sourceInstitution`, `sourceFilePath` → `fileUrl`, `examYear: string`
- [x] Rà soát các component quản trị/làm bài/kết quả có dùng official fields và `examYear`

---

## 8) Tests (unit/integration/e2e)
- [ ] Unit: converters gRPC (proto ↔ entity) với `exam_year` dạng string và official fields mới
- [ ] Repo: test INSERT/UPDATE/SELECT sau khi đổi cột; xác thực scan không lỗi
- [ ] E2E: tạo official exam → add questions → publish → start → submit → grade → get results/statistics

---

## 9) Tài liệu & Release notes
- [ ] Cập nhật `docs/arch/ExamSystem.md` xác nhận field names/types (source_institution, file_url, exam_year string)
- [ ] Cập nhật `docs/report/MISMATCH-SUMMARY.md` đánh dấu đã xử theo A
- [ ] Thêm `docs/api/CHANGES.md` mô tả breaking changes và migration guide cho client
- [ ] README: hướng dẫn regenerate proto

---

## 10) Acceptance Criteria
- [ ] Backend build xanh; không còn TODO ở gRPC results/pagination
- [ ] Tests (unit/integration/e2e) xanh
- [ ] API/gRPC nhận/trả đúng fields (source_institution/file_url/exam_year string), không còn alias tạm
- [ ] Luồng E2E official exam chạy trơn tru
- [ ] Tài liệu cập nhật đầy đủ và thống nhất

---

## 11) Lệnh tham khảo
- Regenerate proto: `cd packages/proto && protoc -I . --go_out=. --go-grpc_out=. v1/exam.proto`
- Build backend: `cd apps/backend && go build ./...`
- Test backend: `cd apps/backend && go test ./...`

---

## 12) Rủi ro & Rollback
- [ ] Làm trên branch riêng; chỉ merge khi FE/clients đã cập nhật stub
- [ ] Tag phiên bản trước khi đổi proto để rollback nhanh
- [ ] Nếu phát hiện môi trường chưa có 000008: áp dụng migration trước rồi mới đổi code

Ghi chú triển khai
- Ưu tiên fix tận gốc (DB ⇄ Entity ⇄ Repo ⇄ Service ⇄ gRPC ⇄ Proto ⇄ FE Types) để tránh mapping tạm thời.
