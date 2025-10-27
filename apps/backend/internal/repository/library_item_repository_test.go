package repository

import (
	"context"
	"database/sql"
	"regexp"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/require"
)

func TestLibraryItemRepository_UpdateApproval(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	repo := NewLibraryItemRepository(db)
	ctx := context.Background()
	reviewer := " reviewer-1 "

	mock.ExpectExec(regexp.QuoteMeta(`
		UPDATE library_items
		SET upload_status = $1,
		    approved_by = $2,
		    is_active = $3,
		    updated_at = CURRENT_TIMESTAMP
		WHERE id = $4
	`)).
		WithArgs("approved", "reviewer-1", true, "item-1").
		WillReturnResult(sqlmock.NewResult(0, 1))

	err = repo.UpdateApproval(ctx, "item-1", " APPROVED ", &reviewer)
	require.NoError(t, err)
	require.NoError(t, mock.ExpectationsWereMet())
}

func TestLibraryItemRepository_UpdateApproval_InvalidStatus(t *testing.T) {
	db, _, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	repo := NewLibraryItemRepository(db)
	ctx := context.Background()

	err = repo.UpdateApproval(ctx, "item-1", "invalid", nil)
	require.ErrorIs(t, err, ErrInvalidInput)
}

func TestLibraryItemRepository_UpdateApproval_NotFound(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	repo := NewLibraryItemRepository(db)
	ctx := context.Background()

	mock.ExpectExec(regexp.QuoteMeta(`
		UPDATE library_items
		SET upload_status = $1,
		    approved_by = $2,
		    is_active = $3,
		    updated_at = CURRENT_TIMESTAMP
		WHERE id = $4
	`)).
		WithArgs("rejected", nil, false, "item-404").
		WillReturnResult(sqlmock.NewResult(0, 0))

	err = repo.UpdateApproval(ctx, "item-404", "rejected", nil)
	require.ErrorIs(t, err, ErrNotFound)
	require.NoError(t, mock.ExpectationsWereMet())
}

func TestLibraryItemRepository_UpdateRatingAggregate(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	repo := NewLibraryItemRepository(db)
	ctx := context.Background()

	mock.ExpectExec(regexp.QuoteMeta(`
		UPDATE library_items
		SET average_rating = $1,
		    review_count = $2,
		    updated_at = CURRENT_TIMESTAMP
		WHERE id = $3
	`)).
		WithArgs(4.5, 3, "item-1").
		WillReturnResult(sqlmock.NewResult(0, 1))

	err = repo.UpdateRatingAggregate(ctx, "item-1", 4.5, 3)
	require.NoError(t, err)
	require.NoError(t, mock.ExpectationsWereMet())
}

func TestLibraryItemRepository_GetAccessMetadata(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	repo := NewLibraryItemRepository(db)
	ctx := context.Background()

	mock.ExpectQuery(regexp.QuoteMeta(`
		SELECT li.type,
		       COALESCE(bm.required_role, em.required_role, vm.required_role, 'GUEST'),
		       COALESCE(bm.required_level, em.required_level, vm.required_level),
		       COALESCE(bm.target_roles, em.target_roles, vm.target_roles, ARRAY['GUEST'])
		FROM library_items li
		LEFT JOIN book_metadata bm ON bm.library_item_id = li.id
		LEFT JOIN exam_metadata em ON em.library_item_id = li.id
		LEFT JOIN video_metadata vm ON vm.library_item_id = li.id
		WHERE li.id = $1
	`)).
		WithArgs("item-1").
		WillReturnRows(sqlmock.NewRows([]string{"type", "required_role", "required_level", "target_roles"}).
			AddRow("video", "STUDENT", int32(3), "{STUDENT,TUTOR}"))

	access, err := repo.GetAccessMetadata(ctx, "item-1")
	require.NoError(t, err)
	require.Equal(t, "video", access.ItemType)
	require.Equal(t, "STUDENT", access.RequiredRole)
	require.True(t, access.RequiredLevel.Valid)
	require.Equal(t, int32(3), access.RequiredLevel.Int32)
	require.ElementsMatch(t, []string{"STUDENT", "TUTOR"}, access.TargetRoles)
	require.NoError(t, mock.ExpectationsWereMet())
}

func TestLibraryItemRepository_GetAccessMetadata_NotFound(t *testing.T) {
	db, mock, err := sqlmock.New()
	require.NoError(t, err)
	defer db.Close()

	repo := NewLibraryItemRepository(db)
	ctx := context.Background()

	mock.ExpectQuery(regexp.QuoteMeta(`
		SELECT li.type,
		       COALESCE(bm.required_role, em.required_role, vm.required_role, 'GUEST'),
		       COALESCE(bm.required_level, em.required_level, vm.required_level),
		       COALESCE(bm.target_roles, em.target_roles, vm.target_roles, ARRAY['GUEST'])
		FROM library_items li
		LEFT JOIN book_metadata bm ON bm.library_item_id = li.id
		LEFT JOIN exam_metadata em ON em.library_item_id = li.id
		LEFT JOIN video_metadata vm ON vm.library_item_id = li.id
		WHERE li.id = $1
	`)).
		WithArgs("item-404").
		WillReturnError(sql.ErrNoRows)

	_, err = repo.GetAccessMetadata(ctx, "item-404")
	require.ErrorIs(t, err, ErrNotFound)
	require.NoError(t, mock.ExpectationsWereMet())
}
