# Repository Interfaces Agent Guide
*Interface definitions for repository abstractions*

## Files
- `exam_repository.go` — Contract for exam repository implementations.
- `question_repository.go` — Question repository interface.
- `question_image_repository.go` — Image handling repository interface.

## Usage
- Implemented by concrete repositories in `internal/repository`.
- Facilitates mocking for tests and alternate storage implementations.

