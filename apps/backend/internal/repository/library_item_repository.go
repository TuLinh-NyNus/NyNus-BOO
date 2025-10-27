package repository

import (
	"context"
	"database/sql"
	"errors"
	"strings"

	"github.com/lib/pq"
)

// LibraryItemAccess contains minimal information used for RBAC checks.
type LibraryItemAccess struct {
	ItemType      string
	RequiredRole  string
	RequiredLevel sql.NullInt32
	TargetRoles   []string
}

// LibraryItemRepository groups generic operations on library_items.
type LibraryItemRepository interface {
	UpdateApproval(ctx context.Context, itemID, status string, reviewerID *string) error
	UpdateRatingAggregate(ctx context.Context, itemID string, average float64, count int) error
	GetAccessMetadata(ctx context.Context, itemID string) (LibraryItemAccess, error)
}

type libraryItemRepository struct {
	db *sql.DB
}

// NewLibraryItemRepository constructs the repository.
func NewLibraryItemRepository(db *sql.DB) LibraryItemRepository {
	return &libraryItemRepository{db: db}
}

func (r *libraryItemRepository) UpdateApproval(ctx context.Context, itemID, status string, reviewerID *string) error {
	status = strings.ToLower(strings.TrimSpace(status))
	switch status {
	case "pending", "approved", "rejected", "archived":
	default:
		return ErrInvalidInput
	}

	approver := optionalStringValue(reviewerID)
	isActive := status == "approved"
	result, err := r.db.ExecContext(ctx, `
		UPDATE library_items
		SET upload_status = $1,
		    approved_by = $2,
		    is_active = $3,
		    updated_at = CURRENT_TIMESTAMP
		WHERE id = $4
	`, status, approver, isActive, itemID)
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

func (r *libraryItemRepository) UpdateRatingAggregate(ctx context.Context, itemID string, average float64, count int) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE library_items
		SET average_rating = $1,
		    review_count = $2,
		    updated_at = CURRENT_TIMESTAMP
		WHERE id = $3
	`, average, count, itemID)
	return err
}

func (r *libraryItemRepository) GetAccessMetadata(ctx context.Context, itemID string) (LibraryItemAccess, error) {
	var access LibraryItemAccess
	var targetRoles []string
	err := r.db.QueryRowContext(ctx, `
		SELECT li.type,
		       COALESCE(bm.required_role, em.required_role, vm.required_role, 'GUEST'),
		       COALESCE(bm.required_level, em.required_level, vm.required_level),
		       COALESCE(bm.target_roles, em.target_roles, vm.target_roles, ARRAY['GUEST'])
		FROM library_items li
		LEFT JOIN book_metadata bm ON bm.library_item_id = li.id
		LEFT JOIN exam_metadata em ON em.library_item_id = li.id
		LEFT JOIN video_metadata vm ON vm.library_item_id = li.id
		WHERE li.id = $1
	`, itemID).Scan(&access.ItemType, &access.RequiredRole, &access.RequiredLevel, pqArrayScanner(&targetRoles))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return LibraryItemAccess{}, ErrNotFound
		}
		return LibraryItemAccess{}, err
	}
	access.TargetRoles = append([]string(nil), targetRoles...)
	return access, nil
}

// helper to scan text[] without pq dependency in signatures.
func pqArrayScanner(dest *[]string) interface{} {
	return pq.Array(dest)
}

func optionalStringValue(value *string) interface{} {
	if value == nil {
		return nil
	}
	trimmed := strings.TrimSpace(*value)
	if trimmed == "" {
		return nil
	}
	return trimmed
}
