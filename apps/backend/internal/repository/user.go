package repository

import (
	"context"
	"database/sql"
	"fmt"

	"exam-bank-system/backend/internal/database"
	"exam-bank-system/backend/internal/entity"
	"exam-bank-system/backend/internal/util"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) GetAll() ([]entity.User, error) {
	ctx := context.Background()
	
	// Create a template entity for the query
	template := &entity.User{}
	rows, err := database.SelectAll(ctx, template, r.db.QueryContext)
	if err != nil {
		return nil, fmt.Errorf("failed to query users: %w", err)
	}
	defer rows.Close()

	var users []entity.User
	for rows.Next() {
		var user entity.User
		_, values := user.FieldMap()
		if err := rows.Scan(values...); err != nil {
			return nil, fmt.Errorf("failed to scan user: %w", err)
		}
		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %w", err)
	}

	return users, nil
}

func (r *UserRepository) GetByID(id string) (*entity.User, error) {
	ctx := context.Background()
	
	user := &entity.User{}
	err := database.SelectByID(ctx, user, id, r.db.QueryContext)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return user, nil
}

func (r *UserRepository) GetByEmail(email string) (*entity.User, error) {
	ctx := context.Background()
	
	template := &entity.User{}
	rows, err := database.SelectByField(ctx, template, "email", email, r.db.QueryContext)
	if err != nil {
		return nil, fmt.Errorf("failed to query user by email: %w", err)
	}
	defer rows.Close()

	if !rows.Next() {
		return nil, fmt.Errorf("user not found")
	}

	var user entity.User
	_, values := user.FieldMap()
	if err := rows.Scan(values...); err != nil {
		return nil, fmt.Errorf("failed to scan user: %w", err)
	}

	return &user, nil
}

func (r *UserRepository) Create(user *entity.User) error {
	ctx := context.Background()
	
	// Prepare entity for insert (sets ID, timestamps)
	if err := database.PrepareEntityForInsert(user); err != nil {
		return fmt.Errorf("failed to prepare entity for insert: %w", err)
	}

	// Insert excluding resource_path (can be set later)
	cmdTag, err := database.InsertExcept(ctx, user, []string{"resource_path"}, r.db.ExecContext)
	if err != nil {
		return fmt.Errorf("failed to insert user: %w", err)
	}

	rowsAffected, err := cmdTag.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected != 1 {
		return fmt.Errorf("expected 1 row affected, got %d", rowsAffected)
	}

	return nil
}

func (r *UserRepository) Update(user *entity.User) error {
	ctx := context.Background()
	
	// Prepare entity for update (sets updated_at)
	if err := database.PrepareEntityForUpdate(user); err != nil {
		return fmt.Errorf("failed to prepare entity for update: %w", err)
	}

	// Get the ID as string for the update
	userID := util.PgTextToString(user.ID)
	if userID == "" {
		return fmt.Errorf("user ID is required for update")
	}

	// Update excluding resource_path and created_at
	cmdTag, err := database.UpdateByID(ctx, user, userID, []string{"resource_path", "created_at"}, r.db.ExecContext)
	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}

	rowsAffected, err := cmdTag.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected != 1 {
		return fmt.Errorf("expected 1 row affected, got %d", rowsAffected)
	}

	return nil
}

func (r *UserRepository) Delete(id string) error {
	ctx := context.Background()
	
	template := &entity.User{}
	cmdTag, err := database.DeleteByID(ctx, template, id, r.db.ExecContext)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	rowsAffected, err := cmdTag.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected != 1 {
		return fmt.Errorf("expected 1 row affected, got %d", rowsAffected)
	}

	return nil
}
