package grpc

import (
	"context"
	"testing"
	"time"

	"exam-bank-system/apps/backend/internal/middleware"
	"exam-bank-system/apps/backend/internal/repository"
	"exam-bank-system/apps/backend/pkg/proto/common"
	v1 "exam-bank-system/apps/backend/pkg/proto/v1"
	"google.golang.org/protobuf/types/known/timestamppb"
)

// --- Mocks ---

type mockAuditLogRepo struct {
	logs []*repository.AuditLog
}

func (m *mockAuditLogRepo) Create(ctx context.Context, log *repository.AuditLog) error { return nil }
func (m *mockAuditLogRepo) GetByID(ctx context.Context, id string) (*repository.AuditLog, error) {
	if len(m.logs) > 0 {
		return m.logs[0], nil
	}
	return nil, nil
}
func (m *mockAuditLogRepo) GetByUserID(ctx context.Context, userID string, limit, offset int) ([]*repository.AuditLog, error) {
	return m.logs, nil
}
func (m *mockAuditLogRepo) GetByResource(ctx context.Context, resource, resourceID string, limit, offset int) ([]*repository.AuditLog, error) {
	return m.logs, nil
}
func (m *mockAuditLogRepo) GetByDateRange(ctx context.Context, startDate, endDate time.Time, limit, offset int) ([]*repository.AuditLog, error) {
	return m.logs, nil
}
func (m *mockAuditLogRepo) GetFailedActions(ctx context.Context, limit, offset int) ([]*repository.AuditLog, error) {
	return m.logs, nil
}
func (m *mockAuditLogRepo) GetSecurityEvents(ctx context.Context, limit, offset int) ([]*repository.AuditLog, error) {
	return m.logs, nil
}
func (m *mockAuditLogRepo) DeleteOldLogs(ctx context.Context, olderThan time.Time) error { return nil }

type mockResourceAccessRepo struct {
	accesses []*repository.ResourceAccess
}

func (m *mockResourceAccessRepo) Create(ctx context.Context, access *repository.ResourceAccess) error {
	return nil
}
func (m *mockResourceAccessRepo) GetByID(ctx context.Context, id string) (*repository.ResourceAccess, error) {
	if len(m.accesses) > 0 {
		return m.accesses[0], nil
	}
	return nil, nil
}
func (m *mockResourceAccessRepo) GetUserAccesses(ctx context.Context, userID string, limit int) ([]*repository.ResourceAccess, error) {
	return m.accesses, nil
}
func (m *mockResourceAccessRepo) GetResourceAccesses(ctx context.Context, resourceType, resourceID string, limit int) ([]*repository.ResourceAccess, error) {
	return m.accesses, nil
}
func (m *mockResourceAccessRepo) GetSuspiciousAccesses(ctx context.Context, minRiskScore int) ([]*repository.ResourceAccess, error) {
	return m.accesses, nil
}
func (m *mockResourceAccessRepo) CountUserAccesses(ctx context.Context, userID string, since time.Time) (int, error) {
	return 0, nil
}
func (m *mockResourceAccessRepo) CalculateRiskScore(ctx context.Context, userID string) (int, error) {
	return 0, nil
}
func (m *mockResourceAccessRepo) GetByUserID(ctx context.Context, userID string, limit, offset int) ([]*repository.ResourceAccess, error) {
	return m.accesses, nil
}
func (m *mockResourceAccessRepo) GetByResourceID(ctx context.Context, resourceID string, limit, offset int) ([]*repository.ResourceAccess, error) {
	return m.accesses, nil
}
func (m *mockResourceAccessRepo) GetSuspiciousAccess(ctx context.Context, minRiskScore int, limit, offset int) ([]*repository.ResourceAccess, error) {
	return m.accesses, nil
}
func (m *mockResourceAccessRepo) GetRecentAccess(ctx context.Context, limit, offset int) ([]*repository.ResourceAccess, error) {
	return m.accesses, nil
}
func (m *mockResourceAccessRepo) GetAccessStats(ctx context.Context, since time.Time) (*repository.ResourceAccessStats, error) {
	return &repository.ResourceAccessStats{}, nil
}

type mockUserRepo struct{}

func (m *mockUserRepo) Create(ctx context.Context, user *repository.User) error { return nil }
func (m *mockUserRepo) GetByID(ctx context.Context, id string) (*repository.User, error) {
	// Return an ADMIN user for permission checks
	return &repository.User{
		ID:            id,
		Email:         "admin@example.com",
		FirstName:     "Admin",
		LastName:      "User",
		Role:          common.UserRole_USER_ROLE_ADMIN,
		IsActive:      true,
		Status:        "ACTIVE",
		Username:      "admin",
		Level:         0,
		EmailVerified: true,
		CreatedAt:     time.Now().Add(-24 * time.Hour),
		UpdatedAt:     time.Now(),
	}, nil
}
func (m *mockUserRepo) GetByEmail(ctx context.Context, email string) (*repository.User, error) {
	return nil, nil
}
func (m *mockUserRepo) GetByGoogleID(ctx context.Context, googleID string) (*repository.User, error) {
	return nil, nil
}
func (m *mockUserRepo) GetByUsername(ctx context.Context, username string) (*repository.User, error) {
	return nil, nil
}
func (m *mockUserRepo) GetAll(ctx context.Context) ([]*repository.User, error) { return nil, nil }
func (m *mockUserRepo) GetUsersWithFilters(ctx context.Context, filters repository.UserFilters, offset, limit int) ([]*repository.User, int, error) {
	return nil, 0, nil
}
func (m *mockUserRepo) Update(ctx context.Context, user *repository.User) error           { return nil }
func (m *mockUserRepo) UpdateGoogleID(ctx context.Context, userID, googleID string) error { return nil }
func (m *mockUserRepo) UpdateAvatar(ctx context.Context, userID, avatar string) error     { return nil }
func (m *mockUserRepo) UpdateLastLogin(ctx context.Context, userID, ipAddress string) error {
	return nil
}
func (m *mockUserRepo) IncrementLoginAttempts(ctx context.Context, userID string) error { return nil }
func (m *mockUserRepo) ResetLoginAttempts(ctx context.Context, userID string) error     { return nil }
func (m *mockUserRepo) LockAccount(ctx context.Context, userID string, until time.Time) error {
	return nil
}
func (m *mockUserRepo) Delete(ctx context.Context, id string) error { return nil }
func (m *mockUserRepo) CreateEmailVerificationToken(ctx context.Context, token *repository.EmailVerificationToken) error {
	return nil
}
func (m *mockUserRepo) GetEmailVerificationToken(ctx context.Context, token string) (*repository.EmailVerificationToken, error) {
	return nil, nil
}
func (m *mockUserRepo) MarkEmailVerificationTokenUsed(ctx context.Context, token string) error {
	return nil
}
func (m *mockUserRepo) DeleteExpiredEmailVerificationTokens(ctx context.Context) error { return nil }
func (m *mockUserRepo) CreatePasswordResetToken(ctx context.Context, token *repository.PasswordResetToken) error {
	return nil
}
func (m *mockUserRepo) GetPasswordResetToken(ctx context.Context, token string) (*repository.PasswordResetToken, error) {
	return nil, nil
}
func (m *mockUserRepo) MarkPasswordResetTokenUsed(ctx context.Context, token string) error {
	return nil
}
func (m *mockUserRepo) DeleteExpiredPasswordResetTokens(ctx context.Context) error { return nil }

type mockSessionRepo struct{}

func (m *mockSessionRepo) CreateSession(ctx context.Context, session *repository.Session) error {
	return nil
}
func (m *mockSessionRepo) GetByID(ctx context.Context, id string) (*repository.Session, error) {
	return nil, nil
}
func (m *mockSessionRepo) GetByToken(ctx context.Context, token string) (*repository.Session, error) {
	return nil, nil
}
func (m *mockSessionRepo) GetUserSessions(ctx context.Context, userID string) ([]*repository.Session, error) {
	return nil, nil
}
func (m *mockSessionRepo) GetActiveSessions(ctx context.Context, userID string) ([]*repository.Session, error) {
	return nil, nil
}
func (m *mockSessionRepo) GetExpiredSessions(ctx context.Context) ([]*repository.Session, error) {
	return nil, nil
}
func (m *mockSessionRepo) UpdateLastActivity(ctx context.Context, sessionID string) error { return nil }
func (m *mockSessionRepo) TerminateSession(ctx context.Context, sessionID string) error   { return nil }
func (m *mockSessionRepo) DeleteSession(ctx context.Context, sessionID string) error      { return nil }
func (m *mockSessionRepo) GetAllActiveSessions(ctx context.Context, limit, offset int) ([]*repository.Session, error) {
	return nil, nil
}
func (m *mockSessionRepo) GetAllSessionsCount(ctx context.Context) (int, error) { return 0, nil }
func (m *mockSessionRepo) SearchSessions(ctx context.Context, query string, limit, offset int) ([]*repository.Session, error) {
	return nil, nil
}

type mockNotificationRepo struct{}

func (m *mockNotificationRepo) GetAllNotifications(ctx context.Context, limit, offset int, notifType, userID string, unreadOnly bool) ([]*repository.NotificationWithUser, error) {
	return nil, nil
}
func (m *mockNotificationRepo) GetAllNotificationsCount(ctx context.Context, notifType, userID string, unreadOnly bool) (int, error) {
	return 0, nil
}
func (m *mockNotificationRepo) SearchNotifications(ctx context.Context, query string, limit, offset int) ([]*repository.NotificationWithUser, error) {
	return nil, nil
}
func (m *mockNotificationRepo) GetNotificationStats(ctx context.Context) (*repository.NotificationStats, error) {
	return &repository.NotificationStats{}, nil
}

// Implement all methods to satisfy repository.NotificationRepository
func (m *mockNotificationRepo) Create(ctx context.Context, n *repository.Notification) error {
	return nil
}
func (m *mockNotificationRepo) GetByID(ctx context.Context, id string) (*repository.Notification, error) {
	return &repository.Notification{}, nil
}
func (m *mockNotificationRepo) GetByUserID(ctx context.Context, userID string, limit, offset int) ([]*repository.Notification, error) {
	return nil, nil
}
func (m *mockNotificationRepo) GetUnreadByUserID(ctx context.Context, userID string) ([]*repository.Notification, error) {
	return nil, nil
}
func (m *mockNotificationRepo) MarkAsRead(ctx context.Context, id string) error        { return nil }
func (m *mockNotificationRepo) MarkAllAsRead(ctx context.Context, userID string) error { return nil }
func (m *mockNotificationRepo) GetUnreadCount(ctx context.Context, userID string) (int, error) {
	return 0, nil
}
func (m *mockNotificationRepo) Delete(ctx context.Context, id string) error { return nil }
func (m *mockNotificationRepo) DeleteExpired(ctx context.Context) error     { return nil }
func (m *mockNotificationRepo) DeleteAllByUserID(ctx context.Context, userID string) error {
	return nil
}

// --- Tests ---

func newAdminServerForTest(auditLogs []*repository.AuditLog, accesses []*repository.ResourceAccess) *AdminServiceServer {
	return &AdminServiceServer{
		UnimplementedAdminServiceServer: v1.UnimplementedAdminServiceServer{},
		userRepo:                        &mockUserRepo{},
		auditLogRepo:                    &mockAuditLogRepo{logs: auditLogs},
		resourceRepo:                    &mockResourceAccessRepo{accesses: accesses},
		enrollmentRepo:                  nil,
		notificationSvc:                 nil,
		sessionRepo:                     &mockSessionRepo{},
		notificationRepo:                &mockNotificationRepo{},
	}
}

func TestGetAuditLogs_TimestampRoundTrip(t *testing.T) {
	now := time.Now().UTC().Truncate(time.Second)
	log := &repository.AuditLog{
		ID:         "01ARZ3NDEKTSV4RRFFQ69G5FAV",
		UserID:     strPtr("01ARZ3NDEKTSV4RRFFQ69G5FAY"),
		Action:     "UPDATE",
		Resource:   "USER",
		ResourceID: "01ARZ3NDEKTSV4RRFFQ69G5FAZ",
		Success:    true,
		CreatedAt:  now,
	}
	srv := newAdminServerForTest([]*repository.AuditLog{log}, nil)

	req := &v1.GetAuditLogsRequest{
		Pagination: &common.PaginationRequest{Page: 1, Limit: 10},
		StartDate:  timestamppb.New(now.Add(-time.Hour)),
		EndDate:    timestamppb.New(now.Add(time.Hour)),
	}
	ctx := context.Background()
	// Inject authenticated ADMIN into context for permissioned admin endpoints
	ctx = middleware.WithUserContext(ctx, "01ADMINTEST", "admin@example.com", "ADMIN", 0)
	resp, err := srv.GetAuditLogs(ctx, req)
	if err != nil {
		t.Fatalf("GetAuditLogs error: %v", err)
	}
	if len(resp.Logs) != 1 {
		t.Fatalf("expected 1 log, got %d", len(resp.Logs))
	}
	got := resp.Logs[0].GetCreatedAt().AsTime().UTC()
	if !got.Equal(now) {
		t.Fatalf("created_at mismatch: got %s want %s", got.Format(time.RFC3339), now.Format(time.RFC3339))
	}
}

func TestGetResourceAccess_TimestampRoundTrip(t *testing.T) {
	now := time.Now().UTC().Truncate(time.Second)
	access := &repository.ResourceAccess{
		ID:            "01ARZ3NDEKTSV4RRFFQ69G5FAA",
		UserID:        "01ARZ3NDEKTSV4RRFFQ69G5FAB",
		ResourceType:  "PDF",
		ResourceID:    "RSC-1",
		Action:        "DOWNLOAD",
		IPAddress:     "127.0.0.1",
		IsValidAccess: true,
		RiskScore:     5,
		CreatedAt:     now,
	}
	srv := newAdminServerForTest(nil, []*repository.ResourceAccess{access})

	req := &v1.GetResourceAccessRequest{
		Pagination: &common.PaginationRequest{Page: 1, Limit: 10},
	}
	ctx := context.Background()
	// Inject authenticated ADMIN into context for permissioned admin endpoints
	ctx = middleware.WithUserContext(ctx, "01ADMINTEST", "admin@example.com", "ADMIN", 0)
	resp, err := srv.GetResourceAccess(ctx, req)
	if err != nil {
		t.Fatalf("GetResourceAccess error: %v", err)
	}
	if len(resp.Accesses) != 1 {
		t.Fatalf("expected 1 access, got %d", len(resp.Accesses))
	}
	got := resp.Accesses[0].GetCreatedAt().AsTime().UTC()
	if !got.Equal(now) {
		t.Fatalf("created_at mismatch: got %s want %s", got.Format(time.RFC3339), now.Format(time.RFC3339))
	}
}

func strPtr(s string) *string { return &s }

// ---- Additional mocks for timestamp round-trip tests ----

type mockSessionRepoData struct {
	sessions []*repository.Session
	count    int
}

func (m *mockSessionRepoData) CreateSession(ctx context.Context, session *repository.Session) error {
	return nil
}
func (m *mockSessionRepoData) GetByID(ctx context.Context, id string) (*repository.Session, error) {
	if len(m.sessions) > 0 {
		return m.sessions[0], nil
	}
	return nil, nil
}
func (m *mockSessionRepoData) GetByToken(ctx context.Context, token string) (*repository.Session, error) {
	if len(m.sessions) > 0 {
		return m.sessions[0], nil
	}
	return nil, nil
}
func (m *mockSessionRepoData) GetUserSessions(ctx context.Context, userID string) ([]*repository.Session, error) {
	return m.sessions, nil
}
func (m *mockSessionRepoData) GetActiveSessions(ctx context.Context, userID string) ([]*repository.Session, error) {
	return m.sessions, nil
}
func (m *mockSessionRepoData) GetExpiredSessions(ctx context.Context) ([]*repository.Session, error) {
	return nil, nil
}
func (m *mockSessionRepoData) UpdateLastActivity(ctx context.Context, sessionID string) error {
	return nil
}
func (m *mockSessionRepoData) TerminateSession(ctx context.Context, sessionID string) error {
	return nil
}
func (m *mockSessionRepoData) DeleteSession(ctx context.Context, sessionID string) error {
	return nil
}
func (m *mockSessionRepoData) GetAllActiveSessions(ctx context.Context, limit, offset int) ([]*repository.Session, error) {
	return m.sessions, nil
}
func (m *mockSessionRepoData) GetAllSessionsCount(ctx context.Context) (int, error) {
	return m.count, nil
}
func (m *mockSessionRepoData) SearchSessions(ctx context.Context, query string, limit, offset int) ([]*repository.Session, error) {
	return m.sessions, nil
}

type mockNotificationRepoData struct {
	items  []*repository.NotificationWithUser
	total  int
	unread int
}

func (m *mockNotificationRepoData) GetAllNotifications(ctx context.Context, limit, offset int, notifType, userID string, unreadOnly bool) ([]*repository.NotificationWithUser, error) {
	return m.items, nil
}
func (m *mockNotificationRepoData) GetAllNotificationsCount(ctx context.Context, notifType, userID string, unreadOnly bool) (int, error) {
	if unreadOnly {
		return m.unread, nil
	}
	return m.total, nil
}
func (m *mockNotificationRepoData) SearchNotifications(ctx context.Context, query string, limit, offset int) ([]*repository.NotificationWithUser, error) {
	return m.items, nil
}
func (m *mockNotificationRepoData) GetNotificationStats(ctx context.Context) (*repository.NotificationStats, error) {
	return &repository.NotificationStats{}, nil
}

// Satisfy remaining methods of repository.NotificationRepository
func (m *mockNotificationRepoData) Create(ctx context.Context, n *repository.Notification) error {
	return nil
}
func (m *mockNotificationRepoData) GetByID(ctx context.Context, id string) (*repository.Notification, error) {
	return &repository.Notification{}, nil
}
func (m *mockNotificationRepoData) GetByUserID(ctx context.Context, userID string, limit, offset int) ([]*repository.Notification, error) {
	return nil, nil
}
func (m *mockNotificationRepoData) GetUnreadByUserID(ctx context.Context, userID string) ([]*repository.Notification, error) {
	return nil, nil
}
func (m *mockNotificationRepoData) MarkAsRead(ctx context.Context, id string) error { return nil }
func (m *mockNotificationRepoData) MarkAllAsRead(ctx context.Context, userID string) error {
	return nil
}
func (m *mockNotificationRepoData) GetUnreadCount(ctx context.Context, userID string) (int, error) {
	return m.unread, nil
}
func (m *mockNotificationRepoData) Delete(ctx context.Context, id string) error { return nil }
func (m *mockNotificationRepoData) DeleteExpired(ctx context.Context) error     { return nil }
func (m *mockNotificationRepoData) DeleteAllByUserID(ctx context.Context, userID string) error {
	return nil
}

// ---- New tests for additional flows ----

// Sessions: Verify Timestamp round-trip for LastActivity, ExpiresAt, CreatedAt
func TestGetAllUserSessions_TimestampRoundTrip(t *testing.T) {
	now := time.Now().UTC().Truncate(time.Second)
	sessions := []*repository.Session{
		{
			ID:                "SESS-1",
			UserID:            "USER-1",
			SessionToken:      "token-1",
			IPAddress:         "127.0.0.1",
			UserAgent:         "UA",
			DeviceFingerprint: "fp",
			Location:          "VN",
			IsActive:          true,
			LastActivity:      now,
			ExpiresAt:         now,
			CreatedAt:         now,
		},
	}

	srv := newAdminServerForTest(nil, nil)
	srv.sessionRepo = &mockSessionRepoData{sessions: sessions, count: 1}

	req := &v1.GetAllUserSessionsRequest{
		Pagination: &common.PaginationRequest{Page: 1, Limit: 10},
	}
	ctx := context.Background()
	ctx = middleware.WithUserContext(ctx, "01ADMINTEST", "admin@example.com", "ADMIN", 0)

	resp, err := srv.GetAllUserSessions(ctx, req)
	if err != nil {
		t.Fatalf("GetAllUserSessions error: %v", err)
	}
	if len(resp.Sessions) != 1 {
		t.Fatalf("expected 1 session, got %d", len(resp.Sessions))
	}

	gotCreated := resp.Sessions[0].GetCreatedAt().AsTime().UTC()
	gotLastAct := resp.Sessions[0].GetLastActivity().AsTime().UTC()
	gotExpires := resp.Sessions[0].GetExpiresAt().AsTime().UTC()

	if !gotCreated.Equal(now) {
		t.Fatalf("created_at mismatch: got %s want %s", gotCreated.Format(time.RFC3339), now.Format(time.RFC3339))
	}
	if !gotLastAct.Equal(now) {
		t.Fatalf("last_activity mismatch: got %s want %s", gotLastAct.Format(time.RFC3339), now.Format(time.RFC3339))
	}
	if !gotExpires.Equal(now) {
		t.Fatalf("expires_at mismatch: got %s want %s", gotExpires.Format(time.RFC3339), now.Format(time.RFC3339))
	}
}

// Notifications: Verify Timestamp round-trip for CreatedAt, ReadAt, ExpiresAt
func TestGetAllNotifications_TimestampRoundTrip(t *testing.T) {
	now := time.Now().UTC().Truncate(time.Second)
	readAt := now.Add(5 * time.Minute).UTC()
	expiresAt := now.Add(24 * time.Hour).UTC()

	n := &repository.Notification{
		ID:        "NOTIF-1",
		UserID:    "USER-1",
		Type:      "INFO",
		Title:     "T1",
		Message:   "M1",
		Data:      []byte(`{"k":"v"}`),
		IsRead:    false,
		CreatedAt: now,
		ReadAt:    &readAt,
		ExpiresAt: &expiresAt,
	}
	items := []*repository.NotificationWithUser{
		{
			Notification: n,
			UserEmail:    "user@example.com",
			UserName:     "User One",
		},
	}

	srv := newAdminServerForTest(nil, nil)
	srv.notificationRepo = &mockNotificationRepoData{items: items, total: 1, unread: 1}

	req := &v1.GetAllNotificationsRequest{
		Pagination: &common.PaginationRequest{Page: 1, Limit: 10},
	}
	ctx := context.Background()
	ctx = middleware.WithUserContext(ctx, "01ADMINTEST", "admin@example.com", "ADMIN", 0)

	resp, err := srv.GetAllNotifications(ctx, req)
	if err != nil {
		t.Fatalf("GetAllNotifications error: %v", err)
	}
	if len(resp.Notifications) != 1 {
		t.Fatalf("expected 1 notification, got %d", len(resp.Notifications))
	}

	gotCreated := resp.Notifications[0].GetNotification().GetCreatedAt().AsTime().UTC()
	gotRead := resp.Notifications[0].GetNotification().GetReadAt().AsTime().UTC()
	gotExpires := resp.Notifications[0].GetNotification().GetExpiresAt().AsTime().UTC()

	if !gotCreated.Equal(now) {
		t.Fatalf("created_at mismatch: got %s want %s", gotCreated.Format(time.RFC3339), now.Format(time.RFC3339))
	}
	if !gotRead.Equal(readAt) {
		t.Fatalf("read_at mismatch: got %s want %s", gotRead.Format(time.RFC3339), readAt.Format(time.RFC3339))
	}
	if !gotExpires.Equal(expiresAt) {
		t.Fatalf("expires_at mismatch: got %s want %s", gotExpires.Format(time.RFC3339), expiresAt.Format(time.RFC3339))
	}
}
