package repository

import (
	"context"
	"database/sql"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/require"
)

func TestItemRatingRepository_Upsert(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	repo := NewItemRatingRepository(db)

	ctx := context.Background()
	query := regexp.QuoteMeta(`
		INSERT INTO item_ratings (id, library_item_id, user_id, rating, review)
		VALUES ($1, $2, $3, $4, NULLIF($5, ''))
		ON CONFLICT (library_item_id, user_id)
		DO UPDATE SET rating = EXCLUDED.rating,
		               review = EXCLUDED.review,
		               updated_at = CURRENT_TIMESTAMP
	`)

	mock.ExpectExec(query).
		WithArgs(sqlmock.AnyArg(), "item-1", "user-1", 5, "great resource").
		WillReturnResult(sqlmock.NewResult(1, 1))

	err = repo.Upsert(ctx, "item-1", "user-1", 5, "  great resource  ")
	require.NoError(t, err)
	require.NoError(t, mock.ExpectationsWereMet())
}

func TestItemRatingRepository_Upsert_InvalidRating(t *testing.T) {
	db, _, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	repo := NewItemRatingRepository(db)
	ctx := context.Background()

	err = repo.Upsert(ctx, "item-1", "user-1", 6, "invalid")
	require.ErrorIs(t, err, ErrInvalidInput)
}

func TestItemRatingRepository_Delete(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	repo := NewItemRatingRepository(db)
	ctx := context.Background()

	mock.ExpectExec(regexp.QuoteMeta(`
		DELETE FROM item_ratings
		WHERE library_item_id = $1 AND user_id = $2
	`)).
		WithArgs("item-1", "user-1").
		WillReturnResult(sqlmock.NewResult(0, 1))

	err = repo.Delete(ctx, "item-1", "user-1")
	require.NoError(t, err)
	require.NoError(t, mock.ExpectationsWereMet())
}

func TestItemRatingRepository_Delete_NotFound(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	repo := NewItemRatingRepository(db)
	ctx := context.Background()

	mock.ExpectExec(regexp.QuoteMeta(`
		DELETE FROM item_ratings
		WHERE library_item_id = $1 AND user_id = $2
	`)).
		WithArgs("item-404", "user-404").
		WillReturnResult(sqlmock.NewResult(0, 0))

	err = repo.Delete(ctx, "item-404", "user-404")
	require.ErrorIs(t, err, ErrNotFound)
	require.NoError(t, mock.ExpectationsWereMet())
}

func TestItemRatingRepository_GetAggregate(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	repo := NewItemRatingRepository(db)
	ctx := context.Background()

	mock.ExpectQuery(regexp.QuoteMeta(`
		SELECT COALESCE(AVG(rating), 0)::float8, COUNT(*)
		FROM item_ratings
		WHERE library_item_id = $1
	`)).
		WithArgs("item-1").
		WillReturnRows(sqlmock.NewRows([]string{"avg", "count"}).AddRow(4.5, 3))

	agg, err := repo.GetAggregate(ctx, "item-1")
	require.NoError(t, err)
	require.InDelta(t, 4.5, agg.Average, 0.001)
	require.Equal(t, 3, agg.Count)
	require.NoError(t, mock.ExpectationsWereMet())
}

func TestItemRatingRepository_GetUserRating(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	repo := NewItemRatingRepository(db)
	ctx := context.Background()

	mock.ExpectQuery(regexp.QuoteMeta(`
		SELECT rating, review
		FROM item_ratings
		WHERE library_item_id = $1 AND user_id = $2
	`)).
		WithArgs("item-1", "user-1").
		WillReturnRows(sqlmock.NewRows([]string{"rating", "review"}).AddRow(5, "excellent"))

	rating, review, err := repo.GetUserRating(ctx, "item-1", "user-1")
	require.NoError(t, err)
	require.Equal(t, 5, rating)
	require.Equal(t, "excellent", review)
	require.NoError(t, mock.ExpectationsWereMet())
}

func TestItemRatingRepository_GetUserRating_NotFound(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	repo := NewItemRatingRepository(db)
	ctx := context.Background()

	mock.ExpectQuery(regexp.QuoteMeta(`
		SELECT rating, review
		FROM item_ratings
		WHERE library_item_id = $1 AND user_id = $2
	`)).
		WithArgs("item-404", "user-404").
		WillReturnError(sql.ErrNoRows)

	_, _, err = repo.GetUserRating(ctx, "item-404", "user-404")
	require.ErrorIs(t, err, ErrNotFound)
	require.NoError(t, mock.ExpectationsWereMet())
}
