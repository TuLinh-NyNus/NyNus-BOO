package repository

import (
	"context"
	"fmt"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/database"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/util"
)

type UserRepository struct {
	db database.QueryExecer
}

func NewUserRepository(db database.QueryExecer) *UserRepository {
	return &UserRepository{db: db}
}

// Create creates a new user with automatic ULID generation and timestamps
func (r *UserRepository) Create(ctx context.Context, user *entity.User) error {
	span, ctx := util.StartSpan(ctx, "UserRepository.Create")
	defer span.Finish()

	cmdTag, err := database.Create(ctx, user, r.db.ExecContext)
	if err != nil {
		span.FinishWithError(err)
		return fmt.Errorf("failed to create user: %w", err)
	}

	rowsAffected, err := cmdTag.RowsAffected()
	if err != nil {
		span.FinishWithError(err)
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected != 1 {
		err := fmt.Errorf("expected 1 row affected, got %d", rowsAffected)
		span.FinishWithError(err)
		return err
	}

	return nil
}

// GetByID retrieves a user by ID
func (r *UserRepository) GetByID(ctx context.Context, id string) (*entity.User, error) {
	span, ctx := util.StartSpan(ctx, "UserRepository.GetByID")
	defer span.Finish()

	user := &entity.User{}
	err := database.SelectByID(ctx, user, id, r.db.QueryContext)
	if err != nil {
		span.FinishWithError(err)
		return nil, fmt.Errorf("failed to get user by ID: %w", err)
	}

	return user, nil
}

// GetByIDForUpdate retrieves a user by ID with FOR UPDATE lock
func (r *UserRepository) GetByIDForUpdate(ctx context.Context, id string) (*entity.User, error) {
	span, ctx := util.StartSpan(ctx, "UserRepository.GetByIDForUpdate")
	defer span.Finish()

	user := &entity.User{}
	err := database.SelectByIDForUpdate(ctx, user, id, r.db.QueryContext)
	if err != nil {
		span.FinishWithError(err)
		return nil, fmt.Errorf("failed to get user by ID for update: %w", err)
	}

	return user, nil
}

func (r *UserRepository) GetAll() ([]entity.User, error) {
	ctx := context.Background()
	span, ctx := util.StartSpan(ctx, "UserRepository.GetAll")
	defer span.Finish()

	// Create a template entity for the query
	template := &entity.User{}
	rows, err := database.SelectAll(ctx, template, r.db.QueryContext)
	if err != nil {
		span.FinishWithError(err)
		return nil, fmt.Errorf("failed to query users: %w", err)
	}
	defer rows.Close()

	var users []entity.User
	for rows.Next() {
		var user entity.User
		_, values := user.FieldMap()
		if err := rows.Scan(values...); err != nil {
			span.FinishWithError(err)
			return nil, fmt.Errorf("failed to scan user: %w", err)
		}
		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		span.FinishWithError(err)
		return nil, fmt.Errorf("rows error: %w", err)
	}

	return users, nil
}

func (r *UserRepository) GetByEmail(email string) (*entity.User, error) {
	ctx := context.Background()
	span, ctx := util.StartSpan(ctx, "UserRepository.GetByEmail")
	defer span.Finish()

	template := &entity.User{}
	rows, err := database.SelectByField(ctx, template, "email", email, r.db.QueryContext)
	if err != nil {
		span.FinishWithError(err)
		return nil, fmt.Errorf("failed to query user by email: %w", err)
	}
	defer rows.Close()

	if !rows.Next() {
		err := fmt.Errorf("user not found")
		span.FinishWithError(err)
		return nil, err
	}

	var user entity.User
	_, values := user.FieldMap()
	if err := rows.Scan(values...); err != nil {
		span.FinishWithError(err)
		return nil, fmt.Errorf("failed to scan user: %w", err)
	}

	return &user, nil
}

// Update updates an existing user
func (r *UserRepository) Update(ctx context.Context, user *entity.User) error {
	span, ctx := util.StartSpan(ctx, "UserRepository.Update")
	defer span.Finish()

	// Get the ID as string for the update
	userID := util.PgTextToString(user.ID)
	if userID == "" {
		err := fmt.Errorf("user ID is required for update")
		span.FinishWithError(err)
		return err
	}

	cmdTag, err := database.Update(ctx, user, userID, r.db.ExecContext)
	if err != nil {
		span.FinishWithError(err)
		return fmt.Errorf("failed to update user: %w", err)
	}

	rowsAffected, err := cmdTag.RowsAffected()
	if err != nil {
		span.FinishWithError(err)
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected != 1 {
		err := fmt.Errorf("expected 1 row affected, got %d", rowsAffected)
		span.FinishWithError(err)
		return err
	}

	return nil
}

// Delete deletes a user by ID
func (r *UserRepository) Delete(ctx context.Context, id string) error {
	span, ctx := util.StartSpan(ctx, "UserRepository.Delete")
	defer span.Finish()

	template := &entity.User{}
	cmdTag, err := database.DeleteByID(ctx, template, id, r.db.ExecContext)
	if err != nil {
		span.FinishWithError(err)
		return fmt.Errorf("failed to delete user: %w", err)
	}

	rowsAffected, err := cmdTag.RowsAffected()
	if err != nil {
		span.FinishWithError(err)
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected != 1 {
		err := fmt.Errorf("expected 1 row affected, got %d", rowsAffected)
		span.FinishWithError(err)
		return err
	}

	return nil
}

// GetByRole returns all users with a specific role
func (r *UserRepository) GetByRole(role string) ([]entity.User, error) {
	ctx := context.Background()
	span, ctx := util.StartSpan(ctx, "UserRepository.GetByRole")
	defer span.Finish()

	query := `
		SELECT id, email, password_hash, first_name, last_name, role, is_active, created_at, updated_at
		FROM users
		WHERE role = $1 AND is_active = true
		ORDER BY created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, role)
	if err != nil {
		span.FinishWithError(err)
		return nil, fmt.Errorf("failed to query users by role: %w", err)
	}
	defer rows.Close()

	var users []entity.User
	for rows.Next() {
		var user entity.User
		_, values := user.FieldMap()
		if err := rows.Scan(values...); err != nil {
			span.FinishWithError(err)
			return nil, fmt.Errorf("failed to scan user: %w", err)
		}
		users = append(users, user)
	}

	if err = rows.Err(); err != nil {
		span.FinishWithError(err)
		return nil, fmt.Errorf("error iterating over users: %w", err)
	}

	return users, nil
}
