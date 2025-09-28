package system

import (
	"context"
	"fmt"
	"time"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/domain_service/notification"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/common"
)

// ResourceProtectionService handles resource access protection and auto-blocking
type ResourceProtectionService struct {
	resourceRepo    repository.ResourceAccessRepository
	userRepo        repository.IUserRepository
	auditLogRepo    repository.AuditLogRepository
	notificationSvc *notification.NotificationService
}

// ResourceAccessAttempt represents an attempt to access a resource
type ResourceAccessAttempt struct {
	UserID       string
	ResourceType string
	ResourceID   string
	Action       string
	IPAddress    string
	UserAgent    string
	SessionToken string
	Duration     int // milliseconds
	Metadata     map[string]interface{}
}

// RiskFactors holds risk calculation factors
type RiskFactors struct {
	RecentAccessCount  int      // Accesses in last hour
	UniqueIPCount      int      // Different IPs used recently
	DownloadCount      int      // Downloads in recent period
	FailedAttemptCount int      // Failed attempts
	AverageRiskScore   float64  // Average risk of recent accesses
	SuspiciousPatterns []string // List of suspicious patterns detected
}

// BlockingRule defines conditions for automatic blocking
type BlockingRule struct {
	Name               string
	MaxRiskScore       int
	MaxAccessesPerHour int
	MaxDownloadsPerDay int
	MaxFailedAttempts  int
	BlockDurationHours int
	SendNotification   bool
}

// Default blocking rules
var DefaultBlockingRules = []BlockingRule{
	{
		Name:               "High Risk Score Block",
		MaxRiskScore:       90,
		BlockDurationHours: 2,
		SendNotification:   true,
	},
	{
		Name:               "Rapid Fire Access",
		MaxAccessesPerHour: 100,
		BlockDurationHours: 1,
		SendNotification:   true,
	},
	{
		Name:               "Mass Download",
		MaxDownloadsPerDay: 50,
		BlockDurationHours: 4,
		SendNotification:   true,
	},
	{
		Name:               "Failed Attempt Spam",
		MaxFailedAttempts:  10,
		BlockDurationHours: 1,
		SendNotification:   true,
	},
}

// NewResourceProtectionService creates a new resource protection service
func NewResourceProtectionService(
	resourceRepo repository.ResourceAccessRepository,
	userRepo repository.IUserRepository,
	auditLogRepo repository.AuditLogRepository,
	notificationSvc *notification.NotificationService,
) *ResourceProtectionService {
	return &ResourceProtectionService{
		resourceRepo:    resourceRepo,
		userRepo:        userRepo,
		auditLogRepo:    auditLogRepo,
		notificationSvc: notificationSvc,
	}
}

// ValidateAndTrackAccess validates resource access and tracks it
func (s *ResourceProtectionService) ValidateAndTrackAccess(ctx context.Context, attempt *ResourceAccessAttempt) error {
	// Check if user is blocked
	if blocked, reason, until := s.isUserBlocked(ctx, attempt.UserID); blocked {
		// Log failed access attempt
		s.logResourceAccess(ctx, attempt, false, fmt.Sprintf("User blocked: %s", reason))

		// Create security alert
		s.createSecurityAlert(ctx, attempt.UserID, "Access Blocked",
			fmt.Sprintf("Your access was blocked due to: %s. Block expires at: %v", reason, until))

		return fmt.Errorf("access blocked: %s until %v", reason, until)
	}

	// Calculate risk factors
	riskFactors, err := s.calculateRiskFactors(ctx, attempt.UserID)
	if err != nil {
		return fmt.Errorf("failed to calculate risk factors: %w", err)
	}

	// Calculate risk score for this access
	riskScore := s.calculateAccessRiskScore(ctx, attempt, riskFactors)

	// Log the access attempt
	access := &repository.ResourceAccess{
		UserID:        attempt.UserID,
		ResourceType:  attempt.ResourceType,
		ResourceID:    attempt.ResourceID,
		Action:        attempt.Action,
		IPAddress:     attempt.IPAddress,
		UserAgent:     attempt.UserAgent,
		SessionToken:  attempt.SessionToken,
		IsValidAccess: true,
		RiskScore:     riskScore,
		Duration:      attempt.Duration,
		Metadata:      attempt.Metadata,
	}

	if err := s.resourceRepo.Create(ctx, access); err != nil {
		return fmt.Errorf("failed to log resource access: %w", err)
	}

	// Check if user should be auto-blocked
	if shouldBlock, rule := s.shouldAutoBlock(ctx, attempt.UserID, riskFactors, riskScore); shouldBlock {
		if err := s.blockUser(ctx, attempt.UserID, rule); err != nil {
			// Log error but don't fail the access
			fmt.Printf("Failed to block user %s: %v\n", attempt.UserID, err)
		}

		// Still allow current access but mark as suspicious
		access.IsValidAccess = false
		s.resourceRepo.Create(ctx, access)
	}

	return nil
}

// calculateRiskFactors analyzes user's recent activity for risk assessment
func (s *ResourceProtectionService) calculateRiskFactors(ctx context.Context, userID string) (*RiskFactors, error) {
	// Get recent accesses (last 24 hours)
	recentAccesses, err := s.resourceRepo.GetUserAccesses(ctx, userID, 200)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	oneHourAgo := now.Add(-1 * time.Hour)
	oneDayAgo := now.Add(-24 * time.Hour)

	factors := &RiskFactors{
		SuspiciousPatterns: []string{},
	}

	uniqueIPs := make(map[string]bool)
	var totalRiskScore int
	var validAccessCount int

	for _, access := range recentAccesses {
		// Only consider recent accesses
		if access.CreatedAt.Before(oneDayAgo) {
			break
		}

		uniqueIPs[access.IPAddress] = true
		totalRiskScore += access.RiskScore
		validAccessCount++

		// Count accesses in last hour
		if access.CreatedAt.After(oneHourAgo) {
			factors.RecentAccessCount++
		}

		// Count downloads
		if access.Action == "DOWNLOAD" {
			factors.DownloadCount++
		}

		// Count failed attempts
		if !access.IsValidAccess {
			factors.FailedAttemptCount++
		}

		// Detect suspicious patterns
		if access.Duration > 0 && access.Duration < 50 { // Very fast access
			factors.SuspiciousPatterns = append(factors.SuspiciousPatterns, "Automated access detected")
		}

		if access.UserAgent == "curl/7.68.0" || access.UserAgent == "wget" {
			factors.SuspiciousPatterns = append(factors.SuspiciousPatterns, "Bot user agent detected")
		}
	}

	factors.UniqueIPCount = len(uniqueIPs)

	if validAccessCount > 0 {
		factors.AverageRiskScore = float64(totalRiskScore) / float64(validAccessCount)
	}

	return factors, nil
}

// calculateAccessRiskScore calculates risk score for a single access
func (s *ResourceProtectionService) calculateAccessRiskScore(ctx context.Context, attempt *ResourceAccessAttempt, factors *RiskFactors) int {
	riskScore := 0

	// Base risk from recent activity
	if factors.RecentAccessCount > 50 {
		riskScore += 40
	} else if factors.RecentAccessCount > 20 {
		riskScore += 20
	}

	// Multiple IP risk
	if factors.UniqueIPCount > 5 {
		riskScore += 30
	} else if factors.UniqueIPCount > 3 {
		riskScore += 15
	}

	// Download risk
	if attempt.Action == "DOWNLOAD" {
		riskScore += 15

		// PDF downloads are highest risk
		if attempt.ResourceType == "PDF" {
			riskScore += 10
		}
	}

	// High download frequency
	if factors.DownloadCount > 30 {
		riskScore += 25
	} else if factors.DownloadCount > 15 {
		riskScore += 10
	}

	// Failed attempts
	if factors.FailedAttemptCount > 5 {
		riskScore += 20
	}

	// Very fast access (automation)
	if attempt.Duration > 0 && attempt.Duration < 100 {
		riskScore += 25
	}

	// Suspicious user agents
	if attempt.UserAgent == "curl/7.68.0" || attempt.UserAgent == "wget" {
		riskScore += 30
	}

	// Historical risk factor
	riskScore += int(factors.AverageRiskScore * 0.3)

	// Suspicious patterns
	riskScore += len(factors.SuspiciousPatterns) * 10

	// Cap at 100
	if riskScore > 100 {
		riskScore = 100
	}

	return riskScore
}

// shouldAutoBlock determines if a user should be automatically blocked
func (s *ResourceProtectionService) shouldAutoBlock(ctx context.Context, userID string, factors *RiskFactors, currentRiskScore int) (bool, BlockingRule) {
	for _, rule := range DefaultBlockingRules {
		if rule.MaxRiskScore > 0 && currentRiskScore >= rule.MaxRiskScore {
			return true, rule
		}

		if rule.MaxAccessesPerHour > 0 && factors.RecentAccessCount >= rule.MaxAccessesPerHour {
			return true, rule
		}

		if rule.MaxDownloadsPerDay > 0 && factors.DownloadCount >= rule.MaxDownloadsPerDay {
			return true, rule
		}

		if rule.MaxFailedAttempts > 0 && factors.FailedAttemptCount >= rule.MaxFailedAttempts {
			return true, rule
		}
	}

	return false, BlockingRule{}
}

// blockUser blocks a user according to the specified rule
func (s *ResourceProtectionService) blockUser(ctx context.Context, userID string, rule BlockingRule) error {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to get user: %w", err)
	}

	// Don't block admins
	if user.Role == common.UserRole_USER_ROLE_ADMIN {
		return nil
	}

	// Set user status to suspended
	user.Status = "SUSPENDED"

	// Calculate block expiry
	blockUntil := time.Now().Add(time.Duration(rule.BlockDurationHours) * time.Hour)

	// Store block expiry in metadata (would need to add this field to user model)
	// For now, we'll just suspend the user

	if err := s.userRepo.Update(ctx, user); err != nil {
		return fmt.Errorf("failed to update user status: %w", err)
	}

	// Create audit log
	if s.auditLogRepo != nil {
		s.createAuditLog(ctx, "SYSTEM", "AUTO_BLOCK_USER", "USER", userID,
			map[string]interface{}{"rule": rule.Name, "block_until": blockUntil})
	}

	// Send notification
	if rule.SendNotification && s.notificationSvc != nil {
		title := "Tài khoản tạm thời bị khóa"
		message := fmt.Sprintf("Tài khoản của bạn đã bị khóa tự động do vi phạm: %s. Khóa đến: %v",
			rule.Name, blockUntil.Format("2006-01-02 15:04:05"))

		s.notificationSvc.CreateSecurityAlert(ctx, userID, title, message, "", "")
	}

	return nil
}

// isUserBlocked checks if a user is currently blocked
func (s *ResourceProtectionService) isUserBlocked(ctx context.Context, userID string) (bool, string, time.Time) {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return false, "", time.Time{}
	}

	if user.Status == "SUSPENDED" {
		// In a real implementation, you'd check block expiry from user metadata
		// For now, assume suspended means blocked
		return true, "Account suspended", time.Now().Add(1 * time.Hour)
	}

	return false, "", time.Time{}
}

// logResourceAccess logs a failed resource access attempt
func (s *ResourceProtectionService) logResourceAccess(ctx context.Context, attempt *ResourceAccessAttempt, success bool, reason string) {
	access := &repository.ResourceAccess{
		UserID:        attempt.UserID,
		ResourceType:  attempt.ResourceType,
		ResourceID:    attempt.ResourceID,
		Action:        attempt.Action,
		IPAddress:     attempt.IPAddress,
		UserAgent:     attempt.UserAgent,
		SessionToken:  attempt.SessionToken,
		IsValidAccess: success,
		RiskScore:     100, // Max risk for blocked attempts
		Duration:      0,
		Metadata:      map[string]interface{}{"block_reason": reason},
	}

	s.resourceRepo.Create(ctx, access)
}

// createSecurityAlert creates a security alert for the user
func (s *ResourceProtectionService) createSecurityAlert(ctx context.Context, userID, title, message string) {
	if s.notificationSvc != nil {
		s.notificationSvc.CreateSecurityAlert(ctx, userID, title, message, "", "")
	}
}

// createAuditLog creates an audit log entry
func (s *ResourceProtectionService) createAuditLog(ctx context.Context, userID, action, resource, resourceID string, metadata map[string]interface{}) {
	if s.auditLogRepo != nil {
		// Implementation would depend on audit log repository structure
		// This is a placeholder
	}
}

// GetUserRiskScore gets the current risk score for a user
func (s *ResourceProtectionService) GetUserRiskScore(ctx context.Context, userID string) (int, error) {
	return s.resourceRepo.CalculateRiskScore(ctx, userID)
}

// GetSuspiciousUsers gets users with high risk scores
func (s *ResourceProtectionService) GetSuspiciousUsers(ctx context.Context, minRiskScore int, limit int) ([]*repository.ResourceAccess, error) {
	return s.resourceRepo.GetSuspiciousAccesses(ctx, minRiskScore)
}

// ResetUserRiskScore resets a user's risk level (admin function)
func (s *ResourceProtectionService) ResetUserRiskScore(ctx context.Context, userID string, adminID string) error {
	// In a real implementation, you might clear recent suspicious accesses
	// or add a "risk reset" record

	// Create audit log
	if s.auditLogRepo != nil {
		s.createAuditLog(ctx, adminID, "RESET_RISK_SCORE", "USER", userID,
			map[string]interface{}{"reset_by": adminID, "reset_at": time.Now()})
	}

	return nil
}
