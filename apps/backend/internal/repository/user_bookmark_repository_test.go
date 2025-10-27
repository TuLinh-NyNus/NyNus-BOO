package repository

import (
	"context"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/require"
)

func TestUserBookmarkRepository_Add(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	repo := NewUserBookmarkRepository(db)
	ctx := context.Background()

	mock.ExpectExec(regexp.QuoteMeta(`
		INSERT INTO user_bookmarks (id, library_item_id, user_id)
		VALUES ($1, $2, $3)
		ON CONFLICT (library_item_id, user_id) DO UPDATE
		SET updated_at = CURRENT_TIMESTAMP
	`)).
		WithArgs(sqlmock.AnyArg(), "item-1", "user-1").
		WillReturnResult(sqlmock.NewResult(1, 1))

	err = repo.Add(ctx, "item-1", "user-1")
	require.NoError(t, err)
	require.NoError(t, mock.ExpectationsWereMet())
}

func TestUserBookmarkRepository_Remove(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	repo := NewUserBookmarkRepository(db)
	ctx := context.Background()

	mock.ExpectExec(regexp.QuoteMeta(`
		DELETE FROM user_bookmarks
		WHERE library_item_id = $1 AND user_id = $2
	`)).
		WithArgs("item-1", "user-1").
		WillReturnResult(sqlmock.NewResult(0, 1))

	err = repo.Remove(ctx, "item-1", "user-1")
	require.NoError(t, err)
	require.NoError(t, mock.ExpectationsWereMet())
}

func TestUserBookmarkRepository_Remove_NotFound(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	repo := NewUserBookmarkRepository(db)
	ctx := context.Background()

	mock.ExpectExec(regexp.QuoteMeta(`
		DELETE FROM user_bookmarks
		WHERE library_item_id = $1 AND user_id = $2
	`)).
		WithArgs("item-404", "user-404").
		WillReturnResult(sqlmock.NewResult(0, 0))

	err = repo.Remove(ctx, "item-404", "user-404")
	require.ErrorIs(t, err, ErrNotFound)
	require.NoError(t, mock.ExpectationsWereMet())
}

func TestUserBookmarkRepository_IsBookmarked(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	repo := NewUserBookmarkRepository(db)
	ctx := context.Background()

	mock.ExpectQuery(regexp.QuoteMeta(`
		SELECT EXISTS(
			SELECT 1 FROM user_bookmarks
			WHERE library_item_id = $1 AND user_id = $2
		)
	`)).
		WithArgs("item-1", "user-1").
		WillReturnRows(sqlmock.NewRows([]string{"exists"}).AddRow(true))

	flag, err := repo.IsBookmarked(ctx, "item-1", "user-1")
	require.NoError(t, err)
	require.True(t, flag)
	require.NoError(t, mock.ExpectationsWereMet())
}

func TestUserBookmarkRepository_Count(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	repo := NewUserBookmarkRepository(db)
	ctx := context.Background()

	mock.ExpectQuery(regexp.QuoteMeta(`
		SELECT COUNT(*) FROM user_bookmarks WHERE library_item_id = $1
	`)).
		WithArgs("item-1").
		WillReturnRows(sqlmock.NewRows([]string{"count"}).AddRow(3))

	total, err := repo.Count(ctx, "item-1")
	require.NoError(t, err)
	require.Equal(t, 3, total)
	require.NoError(t, mock.ExpectationsWereMet())
}
