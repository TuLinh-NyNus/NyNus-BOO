package newsletter

import (
	"fmt"
	"regexp"
	"strings"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository"
	"github.com/google/uuid"
)

// NewsletterMgmt manages newsletter subscriptions
type NewsletterMgmt struct {
	newsletterRepo *repository.NewsletterRepository
}

// NewNewsletterMgmt creates a new newsletter management service
func NewNewsletterMgmt(newsletterRepo *repository.NewsletterRepository) *NewsletterMgmt {
	return &NewsletterMgmt{
		newsletterRepo: newsletterRepo,
	}
}

// Subscribe handles newsletter subscription
func (m *NewsletterMgmt) Subscribe(request *SubscribeRequest) (*entity.NewsletterSubscription, error) {
	// Validate email
	if err := m.validateEmail(request.Email); err != nil {
		return nil, err
	}

	// Create subscription entity
	subscription := &entity.NewsletterSubscription{
		Email:    request.Email,
		Tags:     request.Tags,
		Metadata: request.Metadata,
		Source:   "website",
		Status:   entity.SubscriptionStatusPending, // Start with pending status
	}

	// Add IP address if provided
	if request.IPAddress != "" {
		subscription.IPAddress = &request.IPAddress
	}

	// Save to database
	if err := m.newsletterRepo.Subscribe(subscription); err != nil {
		// Check if already subscribed
		if strings.Contains(err.Error(), "already subscribed") {
			return nil, fmt.Errorf("email is already subscribed to our newsletter")
		}
		return nil, fmt.Errorf("failed to subscribe: %w", err)
	}

	// In production, you would send a confirmation email here
	// For now, we'll auto-confirm after a short delay
	// TODO: Implement email confirmation flow

	return subscription, nil
}

// Unsubscribe handles newsletter unsubscription
func (m *NewsletterMgmt) Unsubscribe(email string, reason string) error {
	// Validate email
	if err := m.validateEmail(email); err != nil {
		return err
	}

	// Unsubscribe from repository
	if err := m.newsletterRepo.Unsubscribe(email, reason); err != nil {
		if strings.Contains(err.Error(), "not found") {
			return fmt.Errorf("email is not subscribed")
		}
		if strings.Contains(err.Error(), "already unsubscribed") {
			return fmt.Errorf("email is already unsubscribed")
		}
		return fmt.Errorf("failed to unsubscribe: %w", err)
	}

	// In production, you would send a confirmation email here
	// TODO: Send unsubscribe confirmation email

	return nil
}

// GetSubscription retrieves a subscription by email
func (m *NewsletterMgmt) GetSubscription(email string) (*entity.NewsletterSubscription, error) {
	// Validate email
	if err := m.validateEmail(email); err != nil {
		return nil, err
	}

	// Get from repository
	subscription, err := m.newsletterRepo.GetByEmail(email)
	if err != nil {
		return nil, err
	}

	return subscription, nil
}

// ListSubscriptions retrieves subscriptions with filters
func (m *NewsletterMgmt) ListSubscriptions(status, search string, tags []string, page, pageSize int) ([]*entity.NewsletterSubscription, int, error) {
	// Calculate offset
	offset := (page - 1) * pageSize

	// Get subscriptions from repository
	subscriptions, totalCount, err := m.newsletterRepo.List(status, search, tags, offset, pageSize)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list subscriptions: %w", err)
	}

	return subscriptions, totalCount, nil
}

// UpdateTags updates subscription tags
func (m *NewsletterMgmt) UpdateTags(email string, tags []string) (*entity.NewsletterSubscription, error) {
	// Validate email
	if err := m.validateEmail(email); err != nil {
		return nil, err
	}

	// Validate tags
	if err := m.validateTags(tags); err != nil {
		return nil, err
	}

	// Update tags in repository
	if err := m.newsletterRepo.UpdateTags(email, tags); err != nil {
		return nil, err
	}

	// Get updated subscription
	subscription, err := m.newsletterRepo.GetByEmail(email)
	if err != nil {
		return nil, err
	}

	return subscription, nil
}

// DeleteSubscription completely removes a subscription (admin only)
func (m *NewsletterMgmt) DeleteSubscription(id string) error {
	// Parse UUID
	subscriptionID, err := uuid.Parse(id)
	if err != nil {
		return fmt.Errorf("invalid subscription ID: %w", err)
	}

	// Delete from repository
	if err := m.newsletterRepo.Delete(subscriptionID); err != nil {
		return err
	}

	return nil
}

// GetStats returns subscription statistics
func (m *NewsletterMgmt) GetStats() (*SubscriptionStats, error) {
	statsMap, err := m.newsletterRepo.GetStats()
	if err != nil {
		return nil, fmt.Errorf("failed to get stats: %w", err)
	}

	stats := &SubscriptionStats{
		TotalActive:       statsMap["active"],
		TotalUnsubscribed: statsMap["unsubscribed"],
		TotalBounced:      statsMap["bounced"],
		TotalPending:      statsMap["pending"],
		NewThisWeek:       statsMap["new_this_week"],
		NewThisMonth:      statsMap["new_this_month"],
	}

	return stats, nil
}

// ConfirmSubscription confirms a pending subscription
func (m *NewsletterMgmt) ConfirmSubscription(email string) error {
	// Validate email
	if err := m.validateEmail(email); err != nil {
		return err
	}

	// Confirm in repository
	if err := m.newsletterRepo.ConfirmSubscription(email); err != nil {
		return err
	}

	// In production, you would send a welcome email here
	// TODO: Send welcome email

	return nil
}

// Helper methods

func (m *NewsletterMgmt) validateEmail(email string) error {
	// Check if empty
	if strings.TrimSpace(email) == "" {
		return fmt.Errorf("email is required")
	}

	// Check format
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(email) {
		return fmt.Errorf("invalid email format")
	}

	// Check length
	if len(email) > 255 {
		return fmt.Errorf("email is too long (max 255 characters)")
	}

	return nil
}

func (m *NewsletterMgmt) validateTags(tags []string) error {
	if len(tags) > 10 {
		return fmt.Errorf("too many tags (max 10)")
	}

	for _, tag := range tags {
		if len(tag) > 50 {
			return fmt.Errorf("tag '%s' is too long (max 50 characters)", tag)
		}
		// Validate tag format (alphanumeric and dashes only)
		tagRegex := regexp.MustCompile(`^[a-zA-Z0-9-]+$`)
		if !tagRegex.MatchString(tag) {
			return fmt.Errorf("invalid tag format: %s (use only letters, numbers and dashes)", tag)
		}
	}

	return nil
}

// Request/Response types

// SubscribeRequest represents a subscription request
type SubscribeRequest struct {
	Email     string                 `json:"email"`
	Tags      []string               `json:"tags"`
	Metadata  map[string]interface{} `json:"metadata"`
	IPAddress string                 `json:"ip_address,omitempty"`
}

// SubscriptionStats represents subscription statistics
type SubscriptionStats struct {
	TotalActive       int `json:"total_active"`
	TotalUnsubscribed int `json:"total_unsubscribed"`
	TotalBounced      int `json:"total_bounced"`
	TotalPending      int `json:"total_pending"`
	NewThisWeek       int `json:"new_this_week"`
	NewThisMonth      int `json:"new_this_month"`
}