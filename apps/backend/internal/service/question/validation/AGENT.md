# Question Validation Agent Guide
*Validators for different question types and answer formats*

## Files
- `base_structure_validator.go` — Shared validation utilities.
- `mc_validator.go`, `tf_validator.go`, `sa_validator.go`, `es_validator.go` — Multiple-choice, true/false, short answer, essay validators.
- `answer_validation_service.go` — Entry point combining validators.
- `interfaces.go` — Contracts for validators.
- `validation_errors.go` — Error definitions.
- Tests: `answer_validation_test.go`.

## Guidelines
- When adding new question types, implement dedicated validator and register it.
- Keep error messages descriptive for importer/UX feedback.

