package contact

import (
	"fmt"
	"regexp"
	"strings"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/repository"
	"github.com/google/uuid"
)

// ContactMgmt manages contact form submissions
type ContactMgmt struct {
	contactRepo *repository.ContactRepository
}

// NewContactMgmt creates a new contact management service
func NewContactMgmt(contactRepo *repository.ContactRepository) *ContactMgmt {
	return &ContactMgmt{
		contactRepo: contactRepo,
	}
}

// SubmitContactForm handles new contact form submissions
func (m *ContactMgmt) SubmitContactForm(request *ContactFormRequest) (*entity.ContactSubmission, error) {
	// Validate request
	if err := m.validateContactForm(request); err != nil {
		return nil, err
	}

	// Create contact entity
	contact := &entity.ContactSubmission{
		Name:    request.Name,
		Email:   request.Email,
		Subject: request.Subject,
		Message: request.Message,
		Phone:   request.Phone,
		Status:  entity.ContactStatusPending,
	}

	// Add IP address and user agent if provided
	if request.IPAddress != "" {
		contact.IPAddress = &request.IPAddress
	}
	if request.UserAgent != "" {
		contact.UserAgent = &request.UserAgent
	}

	// Save to database
	if err := m.contactRepo.Create(contact); err != nil {
		return nil, fmt.Errorf("failed to submit contact form: %w", err)
	}

	return contact, nil
}

// ListContacts retrieves contact submissions with filters
func (m *ContactMgmt) ListContacts(status, search string, page, pageSize int) ([]*entity.ContactSubmission, int, error) {
	// Calculate offset
	offset := (page - 1) * pageSize

	// Get submissions from repository
	submissions, totalCount, err := m.contactRepo.List(status, search, offset, pageSize)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list contacts: %w", err)
	}

	return submissions, totalCount, nil
}

// GetContact retrieves a specific contact submission
func (m *ContactMgmt) GetContact(id string) (*entity.ContactSubmission, error) {
	// Parse UUID
	contactID, err := uuid.Parse(id)
	if err != nil {
		return nil, fmt.Errorf("invalid contact ID: %w", err)
	}

	// Get from repository
	contact, err := m.contactRepo.GetByID(contactID)
	if err != nil {
		return nil, err
	}

	// Mark as read if it was pending
	if contact.Status == entity.ContactStatusPending {
		_ = m.contactRepo.UpdateStatus(contactID, entity.ContactStatusRead)
		contact.Status = entity.ContactStatusRead
	}

	return contact, nil
}

// UpdateContactStatus updates the status of a contact submission
func (m *ContactMgmt) UpdateContactStatus(id string, status string) error {
	// Parse UUID
	contactID, err := uuid.Parse(id)
	if err != nil {
		return fmt.Errorf("invalid contact ID: %w", err)
	}

	// Validate status
	contactStatus := entity.ContactStatus(status)
	if !m.isValidStatus(contactStatus) {
		return fmt.Errorf("invalid status: %s", status)
	}

	// Update in repository
	if err := m.contactRepo.UpdateStatus(contactID, contactStatus); err != nil {
		return err
	}

	return nil
}

// DeleteContact removes a contact submission
func (m *ContactMgmt) DeleteContact(id string) error {
	// Parse UUID
	contactID, err := uuid.Parse(id)
	if err != nil {
		return fmt.Errorf("invalid contact ID: %w", err)
	}

	// Delete from repository
	if err := m.contactRepo.Delete(contactID); err != nil {
		return err
	}

	return nil
}

// GetUnreadCount returns the count of unread submissions
func (m *ContactMgmt) GetUnreadCount() (int, error) {
	return m.contactRepo.CountUnread()
}

// Helper methods

func (m *ContactMgmt) validateContactForm(request *ContactFormRequest) error {
	// Check required fields
	if strings.TrimSpace(request.Name) == "" {
		return fmt.Errorf("name is required")
	}
	if strings.TrimSpace(request.Email) == "" {
		return fmt.Errorf("email is required")
	}
	if strings.TrimSpace(request.Subject) == "" {
		return fmt.Errorf("subject is required")
	}
	if strings.TrimSpace(request.Message) == "" {
		return fmt.Errorf("message is required")
	}

	// Validate email format
	if !m.isValidEmail(request.Email) {
		return fmt.Errorf("invalid email format")
	}

	// Validate lengths
	if len(request.Name) > 255 {
		return fmt.Errorf("name is too long (max 255 characters)")
	}
	if len(request.Subject) > 500 {
		return fmt.Errorf("subject is too long (max 500 characters)")
	}
	if len(request.Message) < 10 {
		return fmt.Errorf("message is too short (min 10 characters)")
	}
	if len(request.Message) > 5000 {
		return fmt.Errorf("message is too long (max 5000 characters)")
	}

	// Validate phone if provided
	if request.Phone != nil && *request.Phone != "" {
		if !m.isValidPhone(*request.Phone) {
			return fmt.Errorf("invalid phone number format")
		}
	}

	return nil
}

func (m *ContactMgmt) isValidEmail(email string) bool {
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return emailRegex.MatchString(email)
}

func (m *ContactMgmt) isValidPhone(phone string) bool {
	// Remove spaces, dashes, and parentheses
	cleaned := regexp.MustCompile(`[\s\-\(\)]`).ReplaceAllString(phone, "")
	// Check if it's a valid phone number (digits only, 10-15 characters)
	phoneRegex := regexp.MustCompile(`^\+?[0-9]{10,15}$`)
	return phoneRegex.MatchString(cleaned)
}

func (m *ContactMgmt) isValidStatus(status entity.ContactStatus) bool {
	switch status {
	case entity.ContactStatusPending, entity.ContactStatusRead,
		entity.ContactStatusReplied, entity.ContactStatusArchived:
		return true
	default:
		return false
	}
}

// ContactFormRequest represents a contact form submission request
type ContactFormRequest struct {
	Name      string  `json:"name"`
	Email     string  `json:"email"`
	Subject   string  `json:"subject"`
	Message   string  `json:"message"`
	Phone     *string `json:"phone,omitempty"`
	IPAddress string  `json:"ip_address,omitempty"`
	UserAgent string  `json:"user_agent,omitempty"`
}

