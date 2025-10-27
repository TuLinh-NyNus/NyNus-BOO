package repository

import (
	"context"
	"database/sql"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/require"
)

func TestLibraryExamRepository_IncrementDownloadCount(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	repo := NewLibraryExamRepository(db)
	ctx := context.Background()
	userID := "teacher-1"

	mock.ExpectBegin()
	mock.ExpectQuery(regexp.QuoteMeta(`
		UPDATE library_items
		SET download_count = download_count + 1, updated_at = CURRENT_TIMESTAMP
		WHERE id = $1 AND type = 'exam'
		RETURNING download_count
	`)).
		WithArgs("exam-1").
		WillReturnRows(sqlmock.NewRows([]string{"download_count"}).AddRow(12))

	mock.ExpectExec(regexp.QuoteMeta(`
		INSERT INTO download_history (
			id, library_item_id, user_id, ip_address, user_agent
		) VALUES ($1, $2, $3, $4, $5)
	`)).
		WithArgs(sqlmock.AnyArg(), "exam-1", userID, "10.0.0.1", "grpc-client/1.0").
		WillReturnResult(sqlmock.NewResult(1, 1))

	mock.ExpectCommit()

	count, err := repo.IncrementDownloadCount(ctx, "exam-1", &userID, "10.0.0.1", "grpc-client/1.0")
	require.NoError(t, err)
	require.Equal(t, 12, count)
	require.NoError(t, mock.ExpectationsWereMet())
}

func TestLibraryExamRepository_IncrementDownloadCount_NotFound(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	repo := NewLibraryExamRepository(db)
	ctx := context.Background()

	mock.ExpectBegin()
	mock.ExpectQuery(regexp.QuoteMeta(`
		UPDATE library_items
		SET download_count = download_count + 1, updated_at = CURRENT_TIMESTAMP
		WHERE id = $1 AND type = 'exam'
		RETURNING download_count
	`)).
		WithArgs("exam-404").
		WillReturnError(sql.ErrNoRows)
	mock.ExpectRollback()

	_, err = repo.IncrementDownloadCount(ctx, "exam-404", nil, "", "")
	require.ErrorIs(t, err, ErrNotFound)
	require.NoError(t, mock.ExpectationsWereMet())
}
