# LaTeX Parsing Agent Guide
*Utilities for parsing and validating LaTeX-based question content*

## Files
- `latex_parser.go`, `enhanced_parser.go` — Core parsing pipelines.
- `content_extractor.go`, `answer_extractor.go` — Extract question/answer structures.
- `bracket_parser.go` — Helper for matching LaTeX bracket pairs.
- `question_code_parser.go` — Parse MapCode/ID references embedded in LaTeX.

## Usage
- Invoked by `internal/service/question` and bulk import pipelines.
- Designed to normalise input before persisting to database.

## Maintenance
- Add regression tests when updating parsing rules (see `test/backend/service/question`).
- Keep parsing tolerant to malformed input; surface actionable errors.
