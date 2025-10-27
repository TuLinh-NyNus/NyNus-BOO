# Exam Service Agent Guide
*Business logic for exam lifecycle management*

## Capabilities
- Create, update, and retrieve exams (`exam_service.go`).
- Coordinate participant enrolment and scheduling workflows.
- Provide interfaces used by gRPC handlers (`interfaces.go`).
- Includes E2E tests (`exam_flow_e2e_test.go`) and unit tests (`exam_service_test.go`).

## Integration
- Depends on repositories for exams, questions, and attempts.
- Delegates grading to `scoring/` submodule.

## Maintenance
- Keep service interfaces stable with gRPC definitions.
- Add tests when modifying grading policies or scheduling rules.

