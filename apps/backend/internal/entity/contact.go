package entity

import (
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

// ContactStatus represents the status of a contact submission
type ContactStatus string

const (
	ContactStatusPending  ContactStatus = "pending"
	ContactStatusRead     ContactStatus = "read"
	ContactStatusReplied  ContactStatus = "replied"
	ContactStatusArchived ContactStatus = "archived"
)

// ContactSubmission represents a contact form submission
type ContactSubmission struct {
	ID           uuid.UUID     `json:"id"`
	Name         string        `json:"name"`
	Email        string        `json:"email"`
	Subject      string        `json:"subject"`
	Message      string        `json:"message"`
	Phone        *string       `json:"phone,omitempty"`
	Status       ContactStatus `json:"status"`
	SubmissionID string        `json:"submission_id"`
	IPAddress    *string       `json:"ip_address,omitempty"`
	UserAgent    *string       `json:"user_agent,omitempty"`
	CreatedAt    time.Time     `json:"created_at"`
	UpdatedAt    time.Time     `json:"updated_at"`
	RepliedAt    *time.Time    `json:"replied_at,omitempty"`
	ReplyMessage *string       `json:"reply_message,omitempty"`
	RepliedBy    *uuid.UUID    `json:"replied_by,omitempty"`
}

// ContactSubmissionDB represents the database structure
type ContactSubmissionDB struct {
	ID           pgtype.UUID        `db:"id"`
	Name         pgtype.Text        `db:"name"`
	Email        pgtype.Text        `db:"email"`
	Subject      pgtype.Text        `db:"subject"`
	Message      pgtype.Text        `db:"message"`
	Phone        pgtype.Text        `db:"phone"`
	Status       pgtype.Text        `db:"status"`
	SubmissionID pgtype.Text        `db:"submission_id"`
	IPAddress    pgtype.Text        `db:"ip_address"`
	UserAgent    pgtype.Text        `db:"user_agent"`
	CreatedAt    pgtype.Timestamptz `db:"created_at"`
	UpdatedAt    pgtype.Timestamptz `db:"updated_at"`
	RepliedAt    pgtype.Timestamptz `db:"replied_at"`
	ReplyMessage pgtype.Text        `db:"reply_message"`
	RepliedBy    pgtype.UUID        `db:"replied_by"`
}

// ToEntity converts database model to entity
func (db *ContactSubmissionDB) ToEntity() *ContactSubmission {
	entity := &ContactSubmission{
		SubmissionID: db.SubmissionID.String,
	}

	// Convert UUID
	if db.ID.Valid {
		entity.ID = uuid.UUID(db.ID.Bytes)
	}

	// Convert required fields
	if db.Name.Valid {
		entity.Name = db.Name.String
	}
	if db.Email.Valid {
		entity.Email = db.Email.String
	}
	if db.Subject.Valid {
		entity.Subject = db.Subject.String
	}
	if db.Message.Valid {
		entity.Message = db.Message.String
	}
	if db.Status.Valid {
		entity.Status = ContactStatus(db.Status.String)
	}

	// Convert optional fields
	if db.Phone.Valid {
		entity.Phone = &db.Phone.String
	}
	if db.IPAddress.Valid {
		entity.IPAddress = &db.IPAddress.String
	}
	if db.UserAgent.Valid {
		entity.UserAgent = &db.UserAgent.String
	}

	// Convert timestamps
	if db.CreatedAt.Valid {
		entity.CreatedAt = db.CreatedAt.Time
	}
	if db.UpdatedAt.Valid {
		entity.UpdatedAt = db.UpdatedAt.Time
	}
	if db.RepliedAt.Valid {
		entity.RepliedAt = &db.RepliedAt.Time
	}

	// Convert reply fields
	if db.ReplyMessage.Valid {
		entity.ReplyMessage = &db.ReplyMessage.String
	}
	if db.RepliedBy.Valid {
		repliedBy := uuid.UUID(db.RepliedBy.Bytes)
		entity.RepliedBy = &repliedBy
	}

	return entity
}

// FromEntity converts entity to database model
func (entity *ContactSubmission) ToDBModel() *ContactSubmissionDB {
	db := &ContactSubmissionDB{}

	// Set UUID
	db.ID = pgtype.UUID{Bytes: entity.ID, Valid: true}

	// Set required fields
	db.Name = pgtype.Text{String: entity.Name, Valid: true}
	db.Email = pgtype.Text{String: entity.Email, Valid: true}
	db.Subject = pgtype.Text{String: entity.Subject, Valid: true}
	db.Message = pgtype.Text{String: entity.Message, Valid: true}
	db.Status = pgtype.Text{String: string(entity.Status), Valid: true}
	db.SubmissionID = pgtype.Text{String: entity.SubmissionID, Valid: true}

	// Set optional fields
	if entity.Phone != nil {
		db.Phone = pgtype.Text{String: *entity.Phone, Valid: true}
	}
	if entity.IPAddress != nil {
		db.IPAddress = pgtype.Text{String: *entity.IPAddress, Valid: true}
	}
	if entity.UserAgent != nil {
		db.UserAgent = pgtype.Text{String: *entity.UserAgent, Valid: true}
	}

	// Set timestamps
	db.CreatedAt = pgtype.Timestamptz{Time: entity.CreatedAt, Valid: true}
	db.UpdatedAt = pgtype.Timestamptz{Time: entity.UpdatedAt, Valid: true}
	if entity.RepliedAt != nil {
		db.RepliedAt = pgtype.Timestamptz{Time: *entity.RepliedAt, Valid: true}
	}

	// Set reply fields
	if entity.ReplyMessage != nil {
		db.ReplyMessage = pgtype.Text{String: *entity.ReplyMessage, Valid: true}
	}
	if entity.RepliedBy != nil {
		db.RepliedBy = pgtype.UUID{Bytes: *entity.RepliedBy, Valid: true}
	}

	return db
}
