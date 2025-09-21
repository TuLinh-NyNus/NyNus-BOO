package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/database"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/util"
)

// ResourceAccess represents a resource access record
type ResourceAccess struct {
	ID            string
	UserID        string
	ResourceType  string
	ResourceID    string
	Action        string
	IPAddress     string
	UserAgent     string
	SessionToken  string
	IsValidAccess bool
	RiskScore     int
	Duration      int
	Metadata      map[string]interface{}
	CreatedAt     time.Time
}

// ResourceAccessRepository interface
type ResourceAccessRepository interface {
	Create(ctx context.Context, access *ResourceAccess) error
	GetByID(ctx context.Context, id string) (*ResourceAccess, error)
	GetUserAccesses(ctx context.Context, userID string, limit int) ([]*ResourceAccess, error)
	GetResourceAccesses(ctx context.Context, resourceType, resourceID string, limit int) ([]*ResourceAccess, error)
	GetSuspiciousAccesses(ctx context.Context, minRiskScore int) ([]*ResourceAccess, error)
	CountUserAccesses(ctx context.Context, userID string, since time.Time) (int, error)
	CalculateRiskScore(ctx context.Context, userID string) (int, error)
	// Add aliases for admin service
	GetByUserID(ctx context.Context, userID string, limit, offset int) ([]*ResourceAccess, error)
	GetByResourceID(ctx context.Context, resourceID string, limit, offset int) ([]*ResourceAccess, error)
	GetSuspiciousAccess(ctx context.Context, minRiskScore int, limit, offset int) ([]*ResourceAccess, error)
	GetRecentAccess(ctx context.Context, limit, offset int) ([]*ResourceAccess, error)
}

// resourceAccessRepository implementation
type resourceAccessRepository struct {
	db database.QueryExecer
}

// NewResourceAccessRepository creates a new resource access repository
func NewResourceAccessRepository(db database.QueryExecer) ResourceAccessRepository {
	return &resourceAccessRepository{db: db}
}

// Create creates a new resource access record
func (r *resourceAccessRepository) Create(ctx context.Context, access *ResourceAccess) error {
	access.ID = util.ULIDNow()
	access.CreatedAt = time.Now()

	// Calculate risk score based on patterns
	access.RiskScore = r.calculateAccessRiskScore(ctx, access)

	query := `
		INSERT INTO resource_access (
			id, user_id, resource_type, resource_id, action,
			ip_address, user_agent, session_token, is_valid_access,
			risk_score, duration, metadata, created_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`

	_, err := r.db.ExecContext(ctx, query,
		access.ID,
		access.UserID,
		access.ResourceType,
		access.ResourceID,
		access.Action,
		access.IPAddress,
		access.UserAgent,
		access.SessionToken,
		access.IsValidAccess,
		access.RiskScore,
		access.Duration,
		access.Metadata,
		access.CreatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create resource access: %w", err)
	}

	return nil
}

// GetByID gets a resource access by ID
func (r *resourceAccessRepository) GetByID(ctx context.Context, id string) (*ResourceAccess, error) {
	query := `
		SELECT id, user_id, resource_type, resource_id, action,
			   ip_address, user_agent, session_token, is_valid_access,
			   risk_score, duration, metadata, created_at
		FROM resource_access
		WHERE id = $1`

	access := &ResourceAccess{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&access.ID,
		&access.UserID,
		&access.ResourceType,
		&access.ResourceID,
		&access.Action,
		&access.IPAddress,
		&access.UserAgent,
		&access.SessionToken,
		&access.IsValidAccess,
		&access.RiskScore,
		&access.Duration,
		&access.Metadata,
		&access.CreatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to get resource access: %w", err)
	}

	return access, nil
}

// GetUserAccesses gets recent resource accesses for a user
func (r *resourceAccessRepository) GetUserAccesses(ctx context.Context, userID string, limit int) ([]*ResourceAccess, error) {
	query := `
		SELECT id, user_id, resource_type, resource_id, action,
			   ip_address, user_agent, session_token, is_valid_access,
			   risk_score, duration, metadata, created_at
		FROM resource_access
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2`

	rows, err := r.db.QueryContext(ctx, query, userID, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get user accesses: %w", err)
	}
	defer rows.Close()

	var accesses []*ResourceAccess
	for rows.Next() {
		access := &ResourceAccess{}
		err := rows.Scan(
			&access.ID,
			&access.UserID,
			&access.ResourceType,
			&access.ResourceID,
			&access.Action,
			&access.IPAddress,
			&access.UserAgent,
			&access.SessionToken,
			&access.IsValidAccess,
			&access.RiskScore,
			&access.Duration,
			&access.Metadata,
			&access.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan resource access: %w", err)
		}
		accesses = append(accesses, access)
	}

	return accesses, nil
}

// GetResourceAccesses gets access logs for a specific resource
func (r *resourceAccessRepository) GetResourceAccesses(ctx context.Context, resourceType, resourceID string, limit int) ([]*ResourceAccess, error) {
	query := `
		SELECT id, user_id, resource_type, resource_id, action,
			   ip_address, user_agent, session_token, is_valid_access,
			   risk_score, duration, metadata, created_at
		FROM resource_access
		WHERE resource_type = $1 AND resource_id = $2
		ORDER BY created_at DESC
		LIMIT $3`

	rows, err := r.db.QueryContext(ctx, query, resourceType, resourceID, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get resource accesses: %w", err)
	}
	defer rows.Close()

	var accesses []*ResourceAccess
	for rows.Next() {
		access := &ResourceAccess{}
		err := rows.Scan(
			&access.ID,
			&access.UserID,
			&access.ResourceType,
			&access.ResourceID,
			&access.Action,
			&access.IPAddress,
			&access.UserAgent,
			&access.SessionToken,
			&access.IsValidAccess,
			&access.RiskScore,
			&access.Duration,
			&access.Metadata,
			&access.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan resource access: %w", err)
		}
		accesses = append(accesses, access)
	}

	return accesses, nil
}

// GetSuspiciousAccesses gets accesses with high risk scores
func (r *resourceAccessRepository) GetSuspiciousAccesses(ctx context.Context, minRiskScore int) ([]*ResourceAccess, error) {
	query := `
		SELECT id, user_id, resource_type, resource_id, action,
			   ip_address, user_agent, session_token, is_valid_access,
			   risk_score, duration, metadata, created_at
		FROM resource_access
		WHERE risk_score >= $1
		ORDER BY risk_score DESC, created_at DESC
		LIMIT 100`

	rows, err := r.db.QueryContext(ctx, query, minRiskScore)
	if err != nil {
		return nil, fmt.Errorf("failed to get suspicious accesses: %w", err)
	}
	defer rows.Close()

	var accesses []*ResourceAccess
	for rows.Next() {
		access := &ResourceAccess{}
		err := rows.Scan(
			&access.ID,
			&access.UserID,
			&access.ResourceType,
			&access.ResourceID,
			&access.Action,
			&access.IPAddress,
			&access.UserAgent,
			&access.SessionToken,
			&access.IsValidAccess,
			&access.RiskScore,
			&access.Duration,
			&access.Metadata,
			&access.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan resource access: %w", err)
		}
		accesses = append(accesses, access)
	}

	return accesses, nil
}

// CountUserAccesses counts user accesses since a given time
func (r *resourceAccessRepository) CountUserAccesses(ctx context.Context, userID string, since time.Time) (int, error) {
	query := `
		SELECT COUNT(*)
		FROM resource_access
		WHERE user_id = $1 AND created_at >= $2`

	var count int
	err := r.db.QueryRowContext(ctx, query, userID, since).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count user accesses: %w", err)
	}

	return count, nil
}

// CalculateRiskScore calculates overall risk score for a user
func (r *resourceAccessRepository) CalculateRiskScore(ctx context.Context, userID string) (int, error) {
	// Get recent accesses
	recentAccesses, err := r.GetUserAccesses(ctx, userID, 100)
	if err != nil {
		return 0, err
	}

	if len(recentAccesses) == 0 {
		return 0, nil
	}

	// Calculate factors
	uniqueIPs := make(map[string]bool)
	downloadCount := 0
	totalRiskScore := 0

	for _, access := range recentAccesses {
		uniqueIPs[access.IPAddress] = true
		if access.Action == "DOWNLOAD" {
			downloadCount++
		}
		totalRiskScore += access.RiskScore
	}

	// Risk factors
	riskScore := 0

	// Multiple IPs increase risk
	if len(uniqueIPs) > 3 {
		riskScore += 20
	}

	// High download rate
	if downloadCount > 10 {
		riskScore += 30
	}

	// Average existing risk score
	if len(recentAccesses) > 0 {
		avgRisk := totalRiskScore / len(recentAccesses)
		riskScore += avgRisk / 2
	}

	// Cap at 100
	if riskScore > 100 {
		riskScore = 100
	}

	return riskScore, nil
}

// calculateAccessRiskScore calculates risk score for a single access
func (r *resourceAccessRepository) calculateAccessRiskScore(ctx context.Context, access *ResourceAccess) int {
	riskScore := 0

	// Check recent access patterns
	recentCount, _ := r.CountUserAccesses(ctx, access.UserID, time.Now().Add(-1*time.Hour))

	// High frequency access
	if recentCount > 50 {
		riskScore += 40
	} else if recentCount > 20 {
		riskScore += 20
	}

	// Download actions have higher risk
	if access.Action == "DOWNLOAD" {
		riskScore += 15

		// PDF downloads are highest risk
		if access.ResourceType == "PDF" {
			riskScore += 10
		}
	}

	// Very short duration might indicate automation
	if access.Duration > 0 && access.Duration < 100 { // Less than 100ms
		riskScore += 25
	}

	// Cap at 100
	if riskScore > 100 {
		riskScore = 100
	}

	return riskScore
}

// GetByUserID is an alias for GetUserAccesses with offset support
func (r *resourceAccessRepository) GetByUserID(ctx context.Context, userID string, limit, offset int) ([]*ResourceAccess, error) {
	query := `
		SELECT id, user_id, resource_type, resource_id, action,
			   ip_address, user_agent, session_token, is_valid_access,
			   risk_score, duration, metadata, created_at
		FROM resource_access
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3`

	rows, err := r.db.QueryContext(ctx, query, userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get user accesses: %w", err)
	}
	defer rows.Close()

	var accesses []*ResourceAccess
	for rows.Next() {
		access := &ResourceAccess{}
		err := rows.Scan(
			&access.ID,
			&access.UserID,
			&access.ResourceType,
			&access.ResourceID,
			&access.Action,
			&access.IPAddress,
			&access.UserAgent,
			&access.SessionToken,
			&access.IsValidAccess,
			&access.RiskScore,
			&access.Duration,
			&access.Metadata,
			&access.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan resource access: %w", err)
		}
		accesses = append(accesses, access)
	}
	return accesses, nil
}

// GetByResourceID gets accesses for a specific resource
func (r *resourceAccessRepository) GetByResourceID(ctx context.Context, resourceID string, limit, offset int) ([]*ResourceAccess, error) {
	query := `
		SELECT id, user_id, resource_type, resource_id, action,
			   ip_address, user_agent, session_token, is_valid_access,
			   risk_score, duration, metadata, created_at
		FROM resource_access
		WHERE resource_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3`

	rows, err := r.db.QueryContext(ctx, query, resourceID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get resource accesses: %w", err)
	}
	defer rows.Close()

	var accesses []*ResourceAccess
	for rows.Next() {
		access := &ResourceAccess{}
		err := rows.Scan(
			&access.ID,
			&access.UserID,
			&access.ResourceType,
			&access.ResourceID,
			&access.Action,
			&access.IPAddress,
			&access.UserAgent,
			&access.SessionToken,
			&access.IsValidAccess,
			&access.RiskScore,
			&access.Duration,
			&access.Metadata,
			&access.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan resource access: %w", err)
		}
		accesses = append(accesses, access)
	}
	return accesses, nil
}

// GetSuspiciousAccess gets suspicious accesses
func (r *resourceAccessRepository) GetSuspiciousAccess(ctx context.Context, minRiskScore int, limit, offset int) ([]*ResourceAccess, error) {
	query := `
		SELECT id, user_id, resource_type, resource_id, action,
			   ip_address, user_agent, session_token, is_valid_access,
			   risk_score, duration, metadata, created_at
		FROM resource_access
		WHERE risk_score >= $1
		ORDER BY risk_score DESC, created_at DESC
		LIMIT $2 OFFSET $3`

	rows, err := r.db.QueryContext(ctx, query, minRiskScore, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get suspicious accesses: %w", err)
	}
	defer rows.Close()

	var accesses []*ResourceAccess
	for rows.Next() {
		access := &ResourceAccess{}
		err := rows.Scan(
			&access.ID,
			&access.UserID,
			&access.ResourceType,
			&access.ResourceID,
			&access.Action,
			&access.IPAddress,
			&access.UserAgent,
			&access.SessionToken,
			&access.IsValidAccess,
			&access.RiskScore,
			&access.Duration,
			&access.Metadata,
			&access.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan resource access: %w", err)
		}
		accesses = append(accesses, access)
	}
	return accesses, nil
}

// GetRecentAccess gets recent accesses
func (r *resourceAccessRepository) GetRecentAccess(ctx context.Context, limit, offset int) ([]*ResourceAccess, error) {
	query := `
		SELECT id, user_id, resource_type, resource_id, action,
			   ip_address, user_agent, session_token, is_valid_access,
			   risk_score, duration, metadata, created_at
		FROM resource_access
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2`

	rows, err := r.db.QueryContext(ctx, query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get recent accesses: %w", err)
	}
	defer rows.Close()

	var accesses []*ResourceAccess
	for rows.Next() {
		access := &ResourceAccess{}
		err := rows.Scan(
			&access.ID,
			&access.UserID,
			&access.ResourceType,
			&access.ResourceID,
			&access.Action,
			&access.IPAddress,
			&access.UserAgent,
			&access.SessionToken,
			&access.IsValidAccess,
			&access.RiskScore,
			&access.Duration,
			&access.Metadata,
			&access.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan resource access: %w", err)
		}
		accesses = append(accesses, access)
	}
	return accesses, nil
}
