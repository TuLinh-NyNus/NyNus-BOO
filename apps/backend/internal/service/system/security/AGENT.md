# Exam Security Service Agent Guide
*Protects exam integrity and prevents abuse*

## Files
- `exam_session_security.go` — Session-level security checks.
- `anti_cheating_service.go` — Anti-cheat detection logic.
- `exam_rate_limiter.go` — Rate limiting for exam operations.
- Tests: `security_integration_test.go`.

## Maintenance
- Keep policies in sync with middleware interceptors.
- Document new anti-cheat signals shared with frontend.

