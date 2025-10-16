# TODO – Exam System Alignment (2025-10-14)

Based on docs/arch/ExamSystem.md, align implementation to 100%.

RESEARCH
- [x] Compare design vs. codebase for Exam (DB, repo, service, gRPC, proto)

PLAN
- Schema/Entity/Repository alignment
  - [ ] Add fields to `entity.Exam`: `ShuffleAnswers`, `ShowAnswers`, `AllowReview`, `Chapter`
  - [ ] Add official exam fields: `IsOfficial`, `ExamSeason`, `Province`, `SchoolName`, `SourceFilePath`, `ExamYear` (int)
  - [ ] Update repository SQL to use `source_file_path` (replaces `file_url`) and `exam_year` INT
  - [ ] Fix difficulty analysis to use UPPERCASE values

- gRPC layer completion
  - [x] Fix `ExamYear` mapping in converters; nil-safe `Grade`
  - [x] Implement remaining RPC handlers: `ReorderExamQuestions`, `GetExamQuestions`, `StartExam`, `SubmitAnswer`, `GetExamAttempt`, `GetExamResults`, `GetExamStatistics`, `GetUserPerformance`

- Service layer (ExamService)
  - [x] Add service methods to support remaining RPCs

- Protobuf (if needed)
  - [ ] Ensure proto fields exist (`shuffle_answers`, `show_answers`, `allow_review`, `chapter`, official fields, `exam_year` int32) and regenerate

- Migrations / Indexes
  - [x] Add migration to replace indexes using status = 'published' with 'ACTIVE'

- Search & Analytics
  - [ ] Implement `ExamRepository.Search` using FTS
  - [ ] Verify analytics outputs with enum casing

- Tests
  - [ ] Add/extend repo/service/gRPC tests for new/updated behaviors

EXECUTE (Today)
- [x] gRPC converters: Fix `ExamYear` mapping; make `Grade` nil-safe; implement string->int parse for exam year pointer conversion
- [x] Repo difficulty analysis: compare with UPPERCASE
- [x] Add migration 000014 to fix indexes using `status = 'published'`

TESTING
- [ ] Build backend and run unit tests
- [ ] Apply migration on dev DB and verify index names/conditions

REVIEW
- [ ] Update checklist and prepare next PR steps for service/gRPC completion

