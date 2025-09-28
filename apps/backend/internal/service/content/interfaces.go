package content

import (
	"context"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
)

// ContentService defines the consolidated content service interface
// This merges functionality from contact, newsletter, and mapcode management
type ContentService interface {
	// Contact Management
	CreateContact(ctx context.Context, contact *entity.ContactSubmission) error
	GetContact(ctx context.Context, contactID string) (*entity.ContactSubmission, error)
	UpdateContact(ctx context.Context, contactID string, updates *entity.ContactSubmission) error
	DeleteContact(ctx context.Context, contactID string) error
	ListContacts(ctx context.Context, offset, limit int) (total int, contacts []entity.ContactSubmission, err error)

	// Newsletter Management
	CreateNewsletterSubscription(ctx context.Context, subscription *entity.NewsletterSubscription) error
	GetNewsletterSubscription(ctx context.Context, subscriptionID string) (*entity.NewsletterSubscription, error)
	UpdateNewsletterSubscription(ctx context.Context, subscriptionID string, updates *entity.NewsletterSubscription) error
	DeleteNewsletterSubscription(ctx context.Context, subscriptionID string) error
	ListNewsletterSubscriptions(ctx context.Context, offset, limit int) (total int, subscriptions []entity.NewsletterSubscription, err error)

	// MapCode Management
	CreateMapCode(ctx context.Context, mapCode *entity.MapCodeVersion) error
	GetMapCode(ctx context.Context, code string) (*entity.MapCodeVersion, error)
	UpdateMapCode(ctx context.Context, code string, updates *entity.MapCodeVersion) error
	DeleteMapCode(ctx context.Context, code string) error
	ListMapCodes(ctx context.Context, offset, limit int) ([]entity.MapCodeVersion, int, error)
}

// ContactRepository defines the repository interface for contact operations
type ContactRepository interface {
	Create(ctx context.Context, contact *entity.ContactSubmission) error
	GetByID(ctx context.Context, id string) (*entity.ContactSubmission, error)
	Update(ctx context.Context, contact *entity.ContactSubmission) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, offset, limit int) ([]entity.ContactSubmission, int, error)
}

// NewsletterRepository defines the repository interface for newsletter operations
type NewsletterRepository interface {
	Create(ctx context.Context, subscription *entity.NewsletterSubscription) error
	GetByID(ctx context.Context, id string) (*entity.NewsletterSubscription, error)
	Update(ctx context.Context, subscription *entity.NewsletterSubscription) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, offset, limit int) ([]entity.NewsletterSubscription, int, error)
}

// MapCodeRepository defines the repository interface for mapcode operations
type MapCodeRepository interface {
	Create(ctx context.Context, mapCode *entity.MapCodeVersion) error
	GetByCode(ctx context.Context, code string) (*entity.MapCodeVersion, error)
	Update(ctx context.Context, mapCode *entity.MapCodeVersion) error
	Delete(ctx context.Context, code string) error
	List(ctx context.Context, offset, limit int) ([]entity.MapCodeVersion, int, error)
}