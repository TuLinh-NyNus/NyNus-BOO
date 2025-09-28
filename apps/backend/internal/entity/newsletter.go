package entity

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgtype"
	"github.com/lib/pq"
)

// SubscriptionStatus represents the status of a newsletter subscription
type SubscriptionStatus string

const (
	SubscriptionStatusActive       SubscriptionStatus = "active"
	SubscriptionStatusUnsubscribed SubscriptionStatus = "unsubscribed"
	SubscriptionStatusBounced      SubscriptionStatus = "bounced"
	SubscriptionStatusPending      SubscriptionStatus = "pending"
)

// NewsletterSubscription represents a newsletter subscription
type NewsletterSubscription struct {
	ID                uuid.UUID              `json:"id"`
	Email             string                 `json:"email"`
	Status            SubscriptionStatus     `json:"status"`
	SubscriptionID    string                 `json:"subscription_id"`
	ConfirmedAt       *time.Time             `json:"confirmed_at,omitempty"`
	UnsubscribedAt    *time.Time             `json:"unsubscribed_at,omitempty"`
	UnsubscribeReason *string                `json:"unsubscribe_reason,omitempty"`
	IPAddress         *string                `json:"ip_address,omitempty"`
	Source            string                 `json:"source"` // website, admin, import
	Tags              []string               `json:"tags"`
	Metadata          map[string]interface{} `json:"metadata"`
	CreatedAt         time.Time              `json:"created_at"`
	UpdatedAt         time.Time              `json:"updated_at"`
}

// NewsletterSubscriptionDB represents the database structure
type NewsletterSubscriptionDB struct {
	ID                pgtype.UUID        `db:"id"`
	Email             pgtype.Text        `db:"email"`
	Status            pgtype.Text        `db:"status"`
	SubscriptionID    pgtype.Text        `db:"subscription_id"`
	ConfirmedAt       pgtype.Timestamptz `db:"confirmed_at"`
	UnsubscribedAt    pgtype.Timestamptz `db:"unsubscribed_at"`
	UnsubscribeReason pgtype.Text        `db:"unsubscribe_reason"`
	IPAddress         pgtype.Text        `db:"ip_address"`
	Source            pgtype.Text        `db:"source"`
	Tags              pq.StringArray     `db:"tags"`
	Metadata          []byte             `db:"metadata"`
	CreatedAt         pgtype.Timestamptz `db:"created_at"`
	UpdatedAt         pgtype.Timestamptz `db:"updated_at"`
}

// ToEntity converts database model to entity
func (db *NewsletterSubscriptionDB) ToEntity() *NewsletterSubscription {
	entity := &NewsletterSubscription{
		SubscriptionID: db.SubscriptionID.String,
		Tags:           []string{},
		Metadata:       make(map[string]interface{}),
	}

	// Convert UUID
	if db.ID.Status == pgtype.Present {
		entity.ID = uuid.UUID(db.ID.Bytes)
	}

	// Convert required fields
	if db.Email.Status == pgtype.Present {
		entity.Email = db.Email.String
	}
	if db.Status.Status == pgtype.Present {
		entity.Status = SubscriptionStatus(db.Status.String)
	}
	if db.Source.Status == pgtype.Present {
		entity.Source = db.Source.String
	}

	// Convert optional fields
	if db.ConfirmedAt.Status == pgtype.Present {
		entity.ConfirmedAt = &db.ConfirmedAt.Time
	}
	if db.UnsubscribedAt.Status == pgtype.Present {
		entity.UnsubscribedAt = &db.UnsubscribedAt.Time
	}
	if db.UnsubscribeReason.Status == pgtype.Present {
		entity.UnsubscribeReason = &db.UnsubscribeReason.String
	}
	if db.IPAddress.Status == pgtype.Present {
		entity.IPAddress = &db.IPAddress.String
	}

	// Convert arrays and JSON
	if db.Tags != nil {
		entity.Tags = []string(db.Tags)
	}
	if len(db.Metadata) > 0 {
		_ = json.Unmarshal(db.Metadata, &entity.Metadata)
	}

	// Convert timestamps
	if db.CreatedAt.Status == pgtype.Present {
		entity.CreatedAt = db.CreatedAt.Time
	}
	if db.UpdatedAt.Status == pgtype.Present {
		entity.UpdatedAt = db.UpdatedAt.Time
	}

	return entity
}

// ToDBModel converts entity to database model
func (entity *NewsletterSubscription) ToDBModel() *NewsletterSubscriptionDB {
	db := &NewsletterSubscriptionDB{}

	// Set UUID
	db.ID = pgtype.UUID{Bytes: entity.ID, Status: pgtype.Present}

	// Set required fields
	db.Email = pgtype.Text{String: entity.Email, Status: pgtype.Present}
	db.Status = pgtype.Text{String: string(entity.Status), Status: pgtype.Present}
	db.SubscriptionID = pgtype.Text{String: entity.SubscriptionID, Status: pgtype.Present}
	db.Source = pgtype.Text{String: entity.Source, Status: pgtype.Present}

	// Set optional fields
	if entity.ConfirmedAt != nil {
		db.ConfirmedAt = pgtype.Timestamptz{Time: *entity.ConfirmedAt, Status: pgtype.Present}
	}
	if entity.UnsubscribedAt != nil {
		db.UnsubscribedAt = pgtype.Timestamptz{Time: *entity.UnsubscribedAt, Status: pgtype.Present}
	}
	if entity.UnsubscribeReason != nil {
		db.UnsubscribeReason = pgtype.Text{String: *entity.UnsubscribeReason, Status: pgtype.Present}
	}
	if entity.IPAddress != nil {
		db.IPAddress = pgtype.Text{String: *entity.IPAddress, Status: pgtype.Present}
	}

	// Set arrays and JSON
	if entity.Tags != nil {
		db.Tags = pq.StringArray(entity.Tags)
	}
	if entity.Metadata != nil {
		db.Metadata, _ = json.Marshal(entity.Metadata)
	}

	// Set timestamps
	db.CreatedAt = pgtype.Timestamptz{Time: entity.CreatedAt, Status: pgtype.Present}
	db.UpdatedAt = pgtype.Timestamptz{Time: entity.UpdatedAt, Status: pgtype.Present}

	return db
}
