# CHANGES: Exam System Alignment (Strategy A)

Date: 2025-10-14
Scope: Align to docs/arch/ExamSystem.md + migration 000008

Breaking changes
- Official fields unified (DB ⇄ Entity ⇄ Proto ⇄ gRPC ⇄ FE):
  - school_name → source_institution
  - source_file_path → file_url
  - exam_year: int32/INT → string/VARCHAR(10)
- Removed legacy columns from DB design (by 000008): is_official, exam_season, province

API/gRPC message changes
- Exam: added source_institution, file_url; exam_year now string
- CreateExamRequest/UpdateExamRequest: use source_institution, file_url, exam_year (string)
- ListExamsRequest filters (when used): repeated string exam_year, repeated string source_institution

Entity changes (Go)
- Exam: ExamYear *string; SourceInstitution *string; FileURL *string
- Removed: IsOfficial, ExamSeason, Province, SchoolName, SourceFilePath

Repository changes (Go)
- INSERT/UPDATE/SELECT use columns: exam_year (TEXT/VARCHAR), exam_code, source_institution, file_url
- Filters: ExamYear []string, SourceInstitution []string

gRPC server adjustments
- Converters map official fields correctly
- SubmitExam now returns ExamResult payload
- ListExams uses PaginationRequest (page/limit/sort_by/sort_order); PaginationResponse filled (page/limit)

Frontend types
- Ensure fields: sourceInstitution, fileUrl, examYear (string)

Migration guidance for clients
- Rename fields in requests/responses as above
- Convert year to string when calling API; accept string year values

Notes
- Ensure DB migration 000008 is applied before deploying this version
- After regenerating stubs, remove temporary int32↔string helpers in gRPC if any remain
