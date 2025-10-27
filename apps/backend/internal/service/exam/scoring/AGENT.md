# Exam Scoring Service Agent Guide
*Auto-grading logic and scoring helpers*

## Files
- `auto_grading_service.go` — Core grading algorithms for question types.
- `scoring_service.go` — Public service API.
- `interfaces.go` — Contracts for integrations.
- `scoring_service_test.go` — Unit tests ensuring scoring accuracy.

## Responsibilities
- Compute scores for exams using question metadata and answer submissions.
- Provide hooks for advanced analytics (partial credit, weighting).

## Maintenance
- Document new question types in both scoring logic and `.proto` contracts.
- Add regression tests for edge cases before deploying.

