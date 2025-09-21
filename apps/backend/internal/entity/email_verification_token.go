package entity

import (
	"github.com/jackc/pgtype"
)

// EmailVerificationToken represents email verification token in database
type EmailVerificationToken struct {
	ID        pgtype.Text        `json:"id"`
	UserID    pgtype.Text        `json:"user_id"`
	Token     pgtype.Text        `json:"token"`
	ExpiresAt pgtype.Timestamptz `json:"expires_at"`
	Used      pgtype.Bool        `json:"used"`
	CreatedAt pgtype.Timestamptz `json:"created_at"`
}

// FieldMap returns field names and pointers for database scanning
func (e *EmailVerificationToken) FieldMap() ([]string, []interface{}) {
	return []string{
			"id",
			"user_id",
			"token",
			"expires_at",
			"used",
			"created_at",
		}, []interface{}{
			&e.ID,
			&e.UserID,
			&e.Token,
			&e.ExpiresAt,
			&e.Used,
			&e.CreatedAt,
		}
}

func (e *EmailVerificationToken) TableName() string {
	return "email_verification_tokens"
}
