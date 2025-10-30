package middleware

// Security Interceptor Constants
// Äá»‹nh nghÄ©a cÃ¡c háº±ng sá»‘ cho security interceptor (exam security)

const (
	// Exam-related gRPC methods
	ExamMethodStartExam        = "/exam.ExamService/StartExam"
	ExamMethodSubmitAnswer     = "/exam.ExamService/SubmitAnswer"
	ExamMethodSubmitExam       = "/exam.ExamService/SubmitExam"
	ExamMethodGetExamAttempt   = "/exam.ExamService/GetExamAttempt"
	ExamMethodGetExamQuestions = "/exam.ExamService/GetExamQuestions"

	// Metadata headers
	HeaderExamSessionID     = "x-exam-session-id"
	HeaderDeviceFingerprint = "x-device-fingerprint"
	HeaderUserAgent         = "user-agent"
	HeaderIPAddress         = "x-forwarded-for"

	// Error messages
	ErrMissingMetadata       = "missing metadata"
	ErrUserNotAuthenticated  = "user not authenticated"
	ErrMissingExamSessionID  = "missing exam session ID"
	ErrInvalidExamSession    = "invalid exam session"
	ErrExamSessionExpired    = "exam session has expired"
	ErrSuspiciousActivity    = "suspicious activity detected"
	ErrDeviceMismatch        = "device fingerprint mismatch"
	ErrIPAddressMismatch     = "IP address mismatch"
	ErrExamRateLimitExceeded = "exam rate limit exceeded"
)
