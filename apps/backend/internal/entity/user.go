package entity

import (
	"github.com/jackc/pgtype"
)

type User struct {
	ID           pgtype.Text        `json:"id"`
	Email        pgtype.Text        `json:"email"`
	PasswordHash pgtype.Text        `json:"-"` // Hidden from JSON
	FirstName    pgtype.Text        `json:"first_name"`
	LastName     pgtype.Text        `json:"last_name"`
	Role         pgtype.Text        `json:"role"`
	IsActive     pgtype.Bool        `json:"is_active"`
	CreatedAt    pgtype.Timestamptz `json:"created_at"`
	UpdatedAt    pgtype.Timestamptz `json:"updated_at"`
	ResourcePath pgtype.Text        `json:"resource_path"`
}

func (e *User) FieldMap() ([]string, []interface{}) {
	return []string{
			"id",
			"email",
			"password_hash",
			"first_name",
			"last_name",
			"role",
			"is_active",
			"created_at",
			"updated_at",
			"resource_path",
		}, []interface{}{
			&e.ID,
			&e.Email,
			&e.PasswordHash,
			&e.FirstName,
			&e.LastName,
			&e.Role,
			&e.IsActive,
			&e.CreatedAt,
			&e.UpdatedAt,
			&e.ResourcePath,
		}
}

func (e *User) TableName() string {
	return "users"
}
