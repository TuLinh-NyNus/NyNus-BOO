package repository

import (
	"context"
	"database/sql"
	"errors"
	"strings"

	"exam-bank-system/apps/backend/internal/util"
)

// RatingAggregate represents summary statistics for a library item.
type RatingAggregate struct {
	Average float64
	Count   int
}

// ItemRatingRepository exposes operations on item_ratings table.
type ItemRatingRepository interface {
	Upsert(ctx context.Context, itemID, userID string, rating int, review string) error
	Delete(ctx context.Context, itemID, userID string) error
	GetAggregate(ctx context.Context, itemID string) (RatingAggregate, error)
	GetUserRating(ctx context.Context, itemID, userID string) (int, string, error)
}

type itemRatingRepository struct {
	db *sql.DB
}

// NewItemRatingRepository creates a new repository instance.
func NewItemRatingRepository(db *sql.DB) ItemRatingRepository {
	return &itemRatingRepository{db: db}
}

func (r *itemRatingRepository) Upsert(ctx context.Context, itemID, userID string, rating int, review string) error {
	if rating < 1 || rating > 5 {
		return ErrInvalidInput
	}

	trimmedReview := strings.TrimSpace(review)
	if _, err := r.db.ExecContext(ctx, `
		INSERT INTO item_ratings (id, library_item_id, user_id, rating, review)
		VALUES ($1, $2, $3, $4, NULLIF($5, ''))
		ON CONFLICT (library_item_id, user_id)
		DO UPDATE SET rating = EXCLUDED.rating,
		               review = EXCLUDED.review,
		               updated_at = CURRENT_TIMESTAMP
	`, util.ULIDNow(), itemID, userID, rating, trimmedReview); err != nil {
		return err
	}
	return nil
}

func (r *itemRatingRepository) Delete(ctx context.Context, itemID, userID string) error {
	result, err := r.db.ExecContext(ctx, `
		DELETE FROM item_ratings
		WHERE library_item_id = $1 AND user_id = $2
	`, itemID, userID)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *itemRatingRepository) GetAggregate(ctx context.Context, itemID string) (RatingAggregate, error) {
	var agg RatingAggregate
	if err := r.db.QueryRowContext(ctx, `
		SELECT COALESCE(AVG(rating), 0)::float8, COUNT(*)
		FROM item_ratings
		WHERE library_item_id = $1
	`, itemID).Scan(&agg.Average, &agg.Count); err != nil {
		return RatingAggregate{}, err
	}
	return agg, nil
}

func (r *itemRatingRepository) GetUserRating(ctx context.Context, itemID, userID string) (int, string, error) {
	var rating int
	var review sql.NullString
	if err := r.db.QueryRowContext(ctx, `
		SELECT rating, review
		FROM item_ratings
		WHERE library_item_id = $1 AND user_id = $2
	`, itemID, userID).Scan(&rating, &review); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 0, "", ErrNotFound
		}
		return 0, "", err
	}
	if review.Valid {
		return rating, review.String, nil
	}
	return rating, "", nil
}
