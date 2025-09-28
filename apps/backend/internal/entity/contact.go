package entity

import (
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgtype"
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
	if db.ID.Status == pgtype.Present {
		entity.ID = uuid.UUID(db.ID.Bytes)
	}

	// Convert required fields
	if db.Name.Status == pgtype.Present {
		entity.Name = db.Name.String
	}
	if db.Email.Status == pgtype.Present {
		entity.Email = db.Email.String
	}
	if db.Subject.Status == pgtype.Present {
		entity.Subject = db.Subject.String
	}
	if db.Message.Status == pgtype.Present {
		entity.Message = db.Message.String
	}
	if db.Status.Status == pgtype.Present {
		entity.Status = ContactStatus(db.Status.String)
	}

	// Convert optional fields
	if db.Phone.Status == pgtype.Present {
		entity.Phone = &db.Phone.String
	}
	if db.IPAddress.Status == pgtype.Present {
		entity.IPAddress = &db.IPAddress.String
	}
	if db.UserAgent.Status == pgtype.Present {
		entity.UserAgent = &db.UserAgent.String
	}

	// Convert timestamps
	if db.CreatedAt.Status == pgtype.Present {
		entity.CreatedAt = db.CreatedAt.Time
	}
	if db.UpdatedAt.Status == pgtype.Present {
		entity.UpdatedAt = db.UpdatedAt.Time
	}
	if db.RepliedAt.Status == pgtype.Present {
		entity.RepliedAt = &db.RepliedAt.Time
	}

	// Convert reply fields
	if db.ReplyMessage.Status == pgtype.Present {
		entity.ReplyMessage = &db.ReplyMessage.String
	}
	if db.RepliedBy.Status == pgtype.Present {
		repliedBy := uuid.UUID(db.RepliedBy.Bytes)
		entity.RepliedBy = &repliedBy
	}

	return entity
}

// FromEntity converts entity to database model
func (entity *ContactSubmission) ToDBModel() *ContactSubmissionDB {
	db := &ContactSubmissionDB{}

	// Set UUID
	db.ID = pgtype.UUID{Bytes: entity.ID, Status: pgtype.Present}

	// Set required fields
	db.Name = pgtype.Text{String: entity.Name, Status: pgtype.Present}
	db.Email = pgtype.Text{String: entity.Email, Status: pgtype.Present}
	db.Subject = pgtype.Text{String: entity.Subject, Status: pgtype.Present}
	db.Message = pgtype.Text{String: entity.Message, Status: pgtype.Present}
	db.Status = pgtype.Text{String: string(entity.Status), Status: pgtype.Present}
	db.SubmissionID = pgtype.Text{String: entity.SubmissionID, Status: pgtype.Present}

	// Set optional fields
	if entity.Phone != nil {
		db.Phone = pgtype.Text{String: *entity.Phone, Status: pgtype.Present}
	}
	if entity.IPAddress != nil {
		db.IPAddress = pgtype.Text{String: *entity.IPAddress, Status: pgtype.Present}
	}
	if entity.UserAgent != nil {
		db.UserAgent = pgtype.Text{String: *entity.UserAgent, Status: pgtype.Present}
	}

	// Set timestamps
	db.CreatedAt = pgtype.Timestamptz{Time: entity.CreatedAt, Status: pgtype.Present}
	db.UpdatedAt = pgtype.Timestamptz{Time: entity.UpdatedAt, Status: pgtype.Present}
	if entity.RepliedAt != nil {
		db.RepliedAt = pgtype.Timestamptz{Time: *entity.RepliedAt, Status: pgtype.Present}
	}

	// Set reply fields
	if entity.ReplyMessage != nil {
		db.ReplyMessage = pgtype.Text{String: *entity.ReplyMessage, Status: pgtype.Present}
	}
	if entity.RepliedBy != nil {
		db.RepliedBy = pgtype.UUID{Bytes: *entity.RepliedBy, Status: pgtype.Present}
	}

	return db
}
