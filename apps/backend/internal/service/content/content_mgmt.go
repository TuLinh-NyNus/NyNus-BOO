package content

import (
	"context"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/database"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository"
	"github.com/sirupsen/logrus"
)

// ContentMgmt provides management layer for content operations
// This consolidates functionality from service_mgmt/contact_mgmt, newsletter_mgmt, mapcode_mgmt
type ContentMgmt struct {
	DB             database.QueryExecer
	ContentService ContentService
	newsletterRepo *repository.NewsletterRepository
	contactRepo    *repository.ContactRepository
	mapCodeRepo    *repository.MapCodeRepository
	logger         *logrus.Logger
}

// NewContentMgmt creates a new content management service
func NewContentMgmt(
	db database.QueryExecer,
	newsletterRepo *repository.NewsletterRepository,
	contactRepo *repository.ContactRepository,
	mapCodeRepo *repository.MapCodeRepository,
	logger *logrus.Logger,
) *ContentMgmt {
	contentService := NewContentServiceWithDB(
		db,
		newsletterRepo,
		contactRepo,
		mapCodeRepo,
		logger,
	)

	return &ContentMgmt{
		DB:             db,
		ContentService: contentService,
		newsletterRepo: newsletterRepo,
		contactRepo:    contactRepo,
		mapCodeRepo:    mapCodeRepo,
		logger:         logger,
	}
}

// Newsletter Operations - delegate to ContentService
func (m *ContentMgmt) CreateNewsletter(ctx context.Context, newsletter *entity.NewsletterSubscription) error {
	return m.ContentService.CreateNewsletter(ctx, newsletter)
}

func (m *ContentMgmt) GetNewsletter(ctx context.Context, newsletterID string) (*entity.NewsletterSubscription, error) {
	return m.ContentService.GetNewsletter(ctx, newsletterID)
}

func (m *ContentMgmt) UpdateNewsletter(ctx context.Context, newsletter *entity.NewsletterSubscription) error {
	return m.ContentService.UpdateNewsletter(ctx, newsletter)
}

func (m *ContentMgmt) DeleteNewsletter(ctx context.Context, newsletterID string) error {
	return m.ContentService.DeleteNewsletter(ctx, newsletterID)
}

func (m *ContentMgmt) ListNewsletters(ctx context.Context, offset, limit int) ([]entity.NewsletterSubscription, int, error) {
	return m.ContentService.ListNewsletters(ctx, offset, limit)
}

func (m *ContentMgmt) SubscribeNewsletter(ctx context.Context, email string, preferences *NewsletterPreferences) error {
	return m.ContentService.SubscribeNewsletter(ctx, email, preferences)
}

func (m *ContentMgmt) UnsubscribeNewsletter(ctx context.Context, email string, reason string) error {
	return m.ContentService.UnsubscribeNewsletter(ctx, email, reason)
}

func (m *ContentMgmt) GetNewsletterSubscriptions(ctx context.Context, offset, limit int) ([]entity.NewsletterSubscription, int, error) {
	return m.ContentService.GetNewsletterSubscribers(ctx, offset, limit)
}

// Contact Operations - delegate to ContentService
func (m *ContentMgmt) CreateContact(ctx context.Context, contact *entity.ContactSubmission) error {
	return m.ContentService.CreateContact(ctx, contact)
}

func (m *ContentMgmt) GetContact(ctx context.Context, contactID string) (*entity.ContactSubmission, error) {
	return m.ContentService.GetContact(ctx, contactID)
}

func (m *ContentMgmt) UpdateContact(ctx context.Context, contact *entity.ContactSubmission) error {
	return m.ContentService.UpdateContact(ctx, contact)
}

func (m *ContentMgmt) DeleteContact(ctx context.Context, contactID string) error {
	return m.ContentService.DeleteContact(ctx, contactID)
}

func (m *ContentMgmt) ListContacts(ctx context.Context, offset, limit int) ([]entity.ContactSubmission, int, error) {
	return m.ContentService.ListContacts(ctx, offset, limit)
}

func (m *ContentMgmt) MarkContactAsRead(ctx context.Context, contactID string) error {
	return m.ContentService.MarkMessageAsRead(ctx, contactID)
}

func (m *ContentMgmt) ReplyToContact(ctx context.Context, contactID string, reply *ContactReply) error {
	messageReply := &MessageReply{
		Message:   reply.Message,
		RepliedBy: reply.RepliedBy,
	}
	return m.ContentService.ReplyToContactMessage(ctx, contactID, messageReply)
}

// MapCode Operations - delegate to ContentService
func (m *ContentMgmt) CreateMapCode(ctx context.Context, mapCode *entity.MapCodeVersion) error {
	return m.ContentService.CreateMapCode(ctx, mapCode)
}

func (m *ContentMgmt) GetMapCode(ctx context.Context, code string) (*entity.MapCodeVersion, error) {
	return m.ContentService.GetMapCode(ctx, code)
}

func (m *ContentMgmt) UpdateMapCode(ctx context.Context, mapCode *entity.MapCodeVersion) error {
	return m.ContentService.UpdateMapCode(ctx, mapCode)
}

func (m *ContentMgmt) DeleteMapCode(ctx context.Context, code string) error {
	return m.ContentService.DeleteMapCode(ctx, code)
}

func (m *ContentMgmt) ListMapCodes(ctx context.Context, offset, limit int) ([]entity.MapCodeVersion, int, error) {
	return m.ContentService.ListMapCodes(ctx, offset, limit)
}

// Content Analytics - delegate to ContentService
func (m *ContentMgmt) GetNewsletterAnalytics(ctx context.Context, newsletterID string) (*NewsletterAnalytics, error) {
	return m.ContentService.GetNewsletterAnalytics(ctx, newsletterID)
}

func (m *ContentMgmt) GetContactAnalytics(ctx context.Context, dateFrom, dateTo string) (*ContactAnalytics, error) {
	return m.ContentService.GetContactAnalytics(ctx, dateFrom, dateTo)
}

func (m *ContentMgmt) GetContentEngagementStats(ctx context.Context) (*ContentEngagementStats, error) {
	return m.ContentService.GetContentEngagementStats(ctx)
}

// Legacy methods for backward compatibility

// Newsletter legacy methods
func (m *ContentMgmt) Subscribe(request *NewsletterSubscribeRequest) (*entity.NewsletterSubscription, error) {
	// Convert request to entity
	subscription := &entity.NewsletterSubscription{
		Email:  request.Email,
		Status: entity.SubscriptionStatusPending,
		Source: "api",
	}
	
	if request.Preferences != nil {
		subscription.Tags = request.Preferences.Topics
		subscription.Metadata = map[string]interface{}{
			"frequency": request.Preferences.Frequency,
		}
	}
	
	err := m.newsletterRepo.Subscribe(subscription)
	return subscription, err
}

func (m *ContentMgmt) Unsubscribe(email string, reason string) error {
	return m.newsletterRepo.Unsubscribe(email, reason)
}

func (m *ContentMgmt) GetSubscriptions(offset, limit int) ([]*entity.NewsletterSubscription, error) {
	return m.newsletterRepo.GetSubscriptions(offset, limit)
}

func (m *ContentMgmt) ConfirmSubscription(email string) error {
	return m.newsletterRepo.ConfirmSubscription(email)
}

// Contact legacy methods
func (m *ContentMgmt) SubmitContact(request *ContactSubmitRequest) (*entity.ContactSubmission, error) {
	// Convert request to entity
	contact := &entity.ContactSubmission{
		Name:    request.Name,
		Email:   request.Email,
		Subject: request.Subject,
		Message: request.Message,
		Status:  entity.ContactStatusPending,
	}
	
	if request.Phone != "" {
		contact.Phone = &request.Phone
	}
	
	if request.IPAddress != "" {
		contact.IPAddress = &request.IPAddress
	}
	
	err := m.contactRepo.Create(contact)
	return contact, err
}

func (m *ContentMgmt) GetContactByID(contactID string) (*entity.ContactSubmission, error) {
	return m.contactRepo.GetByID(contactID)
}

func (m *ContentMgmt) GetContacts(offset, limit int) ([]*entity.ContactSubmission, error) {
	return m.contactRepo.List(offset, limit)
}

func (m *ContentMgmt) UpdateContactStatus(contactID string, status entity.ContactStatus) error {
	return m.contactRepo.UpdateStatus(contactID, status)
}

// MapCode legacy methods
func (m *ContentMgmt) CreateVersion(ctx context.Context, version, name, description, createdBy string) (*entity.MapCodeVersion, error) {
	// TODO: Implement version creation logic
	mapCodeVersion := &entity.MapCodeVersion{}
	// Set fields using the entity's methods
	mapCodeVersion.Version.Set(version)
	mapCodeVersion.Name.Set(name)
	mapCodeVersion.Description.Set(description)
	mapCodeVersion.CreatedBy.Set(createdBy)
	mapCodeVersion.IsActive.Set(false)
	
	err := m.mapCodeRepo.CreateVersion(ctx, mapCodeVersion)
	return mapCodeVersion, err
}

func (m *ContentMgmt) GetActiveVersion(ctx context.Context) (*entity.MapCodeVersion, error) {
	return m.mapCodeRepo.GetActiveVersion(ctx)
}

func (m *ContentMgmt) SetActiveVersion(ctx context.Context, versionID string) error {
	return m.mapCodeRepo.SetActiveVersion(ctx, versionID)
}

func (m *ContentMgmt) TranslateQuestionCode(ctx context.Context, questionCode string) (string, error) {
	// TODO: Implement translation logic
	// For now, return the original code
	return questionCode, nil
}

func (m *ContentMgmt) GetVersions(ctx context.Context, offset, limit int) ([]*entity.MapCodeVersion, error) {
	return m.mapCodeRepo.GetVersions(ctx, offset, limit)
}
