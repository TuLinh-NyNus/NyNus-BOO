package repository

import (
	"context"
	"database/sql"

	"exam-bank-system/apps/backend/internal/util"
)

// UserBookmarkRepository manages bookmarks relationships.
type UserBookmarkRepository interface {
	Add(ctx context.Context, itemID, userID string) error
	Remove(ctx context.Context, itemID, userID string) error
	IsBookmarked(ctx context.Context, itemID, userID string) (bool, error)
	Count(ctx context.Context, itemID string) (int, error)
}

type userBookmarkRepository struct {
	db *sql.DB
}

// NewUserBookmarkRepository creates an instance backed by PostgreSQL.
func NewUserBookmarkRepository(db *sql.DB) UserBookmarkRepository {
	return &userBookmarkRepository{db: db}
}

func (r *userBookmarkRepository) Add(ctx context.Context, itemID, userID string) error {
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO user_bookmarks (id, library_item_id, user_id)
		VALUES ($1, $2, $3)
		ON CONFLICT (library_item_id, user_id) DO UPDATE
		SET updated_at = CURRENT_TIMESTAMP
	`, util.ULIDNow(), itemID, userID)
	return err
}

func (r *userBookmarkRepository) Remove(ctx context.Context, itemID, userID string) error {
	result, err := r.db.ExecContext(ctx, `
		DELETE FROM user_bookmarks
		WHERE library_item_id = $1 AND user_id = $2
	`, itemID, userID)
	if err != nil {
		return err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *userBookmarkRepository) IsBookmarked(ctx context.Context, itemID, userID string) (bool, error) {
	var exists bool
	if err := r.db.QueryRowContext(ctx, `
		SELECT EXISTS(
			SELECT 1 FROM user_bookmarks
			WHERE library_item_id = $1 AND user_id = $2
		)
	`, itemID, userID).Scan(&exists); err != nil {
		return false, err
	}
	return exists, nil
}

func (r *userBookmarkRepository) Count(ctx context.Context, itemID string) (int, error) {
	var total int
	if err := r.db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM user_bookmarks WHERE library_item_id = $1
	`, itemID).Scan(&total); err != nil {
		return 0, err
	}
	return total, nil
}
