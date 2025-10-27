package repository

import (
	"context"
	"database/sql"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/require"
)

func TestLibraryVideoRepository_IncrementDownloadCount(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	repo := NewLibraryVideoRepository(db)
	ctx := context.Background()
	userID := "user-1"

	mock.ExpectBegin()
	mock.ExpectQuery(regexp.QuoteMeta(`
		UPDATE library_items
		SET download_count = download_count + 1, updated_at = CURRENT_TIMESTAMP
		WHERE id = $1 AND type = 'video'
		RETURNING download_count
	`)).
		WithArgs("video-1").
		WillReturnRows(sqlmock.NewRows([]string{"download_count"}).AddRow(5))

	mock.ExpectExec(regexp.QuoteMeta(`
		INSERT INTO download_history (
			id, library_item_id, user_id, ip_address, user_agent
		) VALUES ($1, $2, $3, $4, $5)
	`)).
		WithArgs(sqlmock.AnyArg(), "video-1", userID, "127.0.0.1", "Mozilla/5.0").
		WillReturnResult(sqlmock.NewResult(1, 1))

	mock.ExpectCommit()

	count, err := repo.IncrementDownloadCount(ctx, "video-1", &userID, "127.0.0.1", "Mozilla/5.0")
	require.NoError(t, err)
	require.Equal(t, 5, count)
	require.NoError(t, mock.ExpectationsWereMet())
}

func TestLibraryVideoRepository_IncrementDownloadCount_NotFound(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	repo := NewLibraryVideoRepository(db)
	ctx := context.Background()

	mock.ExpectBegin()
	mock.ExpectQuery(regexp.QuoteMeta(`
		UPDATE library_items
		SET download_count = download_count + 1, updated_at = CURRENT_TIMESTAMP
		WHERE id = $1 AND type = 'video'
		RETURNING download_count
	`)).
		WithArgs("video-404").
		WillReturnError(sql.ErrNoRows)
	mock.ExpectRollback()

	_, err = repo.IncrementDownloadCount(ctx, "video-404", nil, "", "")
	require.ErrorIs(t, err, ErrNotFound)
	require.NoError(t, mock.ExpectationsWereMet())
}
