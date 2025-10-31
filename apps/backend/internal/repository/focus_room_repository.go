package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/repository/interfaces"
	"github.com/google/uuid"
)

// FocusRoomRepository implements the FocusRoomRepository interface
type FocusRoomRepository struct {
	db *sql.DB
}

// NewFocusRoomRepository creates a new focus room repository instance
func NewFocusRoomRepository(db *sql.DB) interfaces.FocusRoomRepository {
	return &FocusRoomRepository{db: db}
}

// Create creates a new focus room
func (r *FocusRoomRepository) Create(ctx context.Context, room *entity.FocusRoom) error {
	query := `
		INSERT INTO focus_rooms (
			id, name, description, owner_user_id, room_type,
			max_participants, is_active, settings, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`

	// Generate ID if not provided
	if room.ID == uuid.Nil {
		room.ID = uuid.New()
	}

	// Set timestamps
	now := time.Now()
	room.CreatedAt = now
	room.UpdatedAt = now

	// Marshal settings to JSON
	settingsJSON, err := json.Marshal(room.Settings)
	if err != nil {
		return fmt.Errorf("failed to marshal room settings: %w", err)
	}

	_, err = r.db.ExecContext(
		ctx,
		query,
		room.ID,
		room.Name,
		room.Description,
		room.OwnerUserID,
		room.RoomType,
		room.MaxParticipants,
		room.IsActive,
		settingsJSON,
		room.CreatedAt,
		room.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create focus room: %w", err)
	}

	return nil
}

// GetByID retrieves a focus room by ID
func (r *FocusRoomRepository) GetByID(ctx context.Context, id uuid.UUID) (*entity.FocusRoom, error) {
	query := `
		SELECT id, name, description, owner_user_id, room_type,
		       max_participants, is_active, settings, created_at, updated_at
		FROM focus_rooms
		WHERE id = $1
	`

	var room entity.FocusRoom
	var settingsJSON []byte

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&room.ID,
		&room.Name,
		&room.Description,
		&room.OwnerUserID,
		&room.RoomType,
		&room.MaxParticipants,
		&room.IsActive,
		&settingsJSON,
		&room.CreatedAt,
		&room.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("focus room not found: %w", err)
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get focus room: %w", err)
	}

	// Unmarshal settings
	if err := json.Unmarshal(settingsJSON, &room.Settings); err != nil {
		return nil, fmt.Errorf("failed to unmarshal settings: %w", err)
	}

	return &room, nil
}

// List retrieves focus rooms with filters and pagination
func (r *FocusRoomRepository) List(ctx context.Context, filter interfaces.RoomFilter) ([]*entity.FocusRoom, int, error) {
	// Build WHERE clause
	where := "WHERE 1=1"
	args := []interface{}{}
	argPos := 1

	if filter.RoomType != nil {
		where += fmt.Sprintf(" AND room_type = $%d", argPos)
		args = append(args, *filter.RoomType)
		argPos++
	}

	if filter.ActiveOnly {
		where += fmt.Sprintf(" AND is_active = $%d", argPos)
		args = append(args, true)
		argPos++
	}

	if filter.OwnerUserID != nil {
		where += fmt.Sprintf(" AND owner_user_id = $%d", argPos)
		args = append(args, *filter.OwnerUserID)
		argPos++
	}

	// Get total count
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM focus_rooms %s", where)
	var total int
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("failed to count rooms: %w", err)
	}

	// Set pagination defaults
	page := filter.Page
	if page < 1 {
		page = 1
	}
	pageSize := filter.PageSize
	if pageSize < 1 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize

	// Get rooms
	query := fmt.Sprintf(`
		SELECT id, name, description, owner_user_id, room_type,
		       max_participants, is_active, settings, created_at, updated_at
		FROM focus_rooms
		%s
		ORDER BY created_at DESC
		LIMIT $%d OFFSET $%d
	`, where, argPos, argPos+1)

	args = append(args, pageSize, offset)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list rooms: %w", err)
	}
	defer rows.Close()

	var rooms []*entity.FocusRoom
	for rows.Next() {
		var room entity.FocusRoom
		var settingsJSON []byte

		err := rows.Scan(
			&room.ID,
			&room.Name,
			&room.Description,
			&room.OwnerUserID,
			&room.RoomType,
			&room.MaxParticipants,
			&room.IsActive,
			&settingsJSON,
			&room.CreatedAt,
			&room.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan room: %w", err)
		}

		// Unmarshal settings
		if err := json.Unmarshal(settingsJSON, &room.Settings); err != nil {
			return nil, 0, fmt.Errorf("failed to unmarshal settings: %w", err)
		}

		rooms = append(rooms, &room)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error iterating rooms: %w", err)
	}

	return rooms, total, nil
}

// Update updates a focus room
func (r *FocusRoomRepository) Update(ctx context.Context, room *entity.FocusRoom) error {
	query := `
		UPDATE focus_rooms
		SET name = $2, description = $3, room_type = $4,
		    max_participants = $5, is_active = $6, settings = $7, updated_at = $8
		WHERE id = $1
	`

	room.UpdatedAt = time.Now()

	// Marshal settings
	settingsJSON, err := json.Marshal(room.Settings)
	if err != nil {
		return fmt.Errorf("failed to marshal settings: %w", err)
	}

	result, err := r.db.ExecContext(
		ctx,
		query,
		room.ID,
		room.Name,
		room.Description,
		room.RoomType,
		room.MaxParticipants,
		room.IsActive,
		settingsJSON,
		room.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to update room: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rows == 0 {
		return fmt.Errorf("room not found")
	}

	return nil
}

// Delete deletes a focus room
func (r *FocusRoomRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM focus_rooms WHERE id = $1`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete room: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rows == 0 {
		return fmt.Errorf("room not found")
	}

	return nil
}

// AddParticipant adds a participant to a room
func (r *FocusRoomRepository) AddParticipant(ctx context.Context, roomID uuid.UUID, userID string) error {
	query := `
		INSERT INTO room_participants (room_id, user_id, joined_at, is_focusing)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (room_id, user_id) DO NOTHING
	`

	_, err := r.db.ExecContext(ctx, query, roomID, userID, time.Now(), false)
	if err != nil {
		return fmt.Errorf("failed to add participant: %w", err)
	}

	return nil
}

// RemoveParticipant removes a participant from a room
func (r *FocusRoomRepository) RemoveParticipant(ctx context.Context, roomID uuid.UUID, userID string) error {
	query := `DELETE FROM room_participants WHERE room_id = $1 AND user_id = $2`

	result, err := r.db.ExecContext(ctx, query, roomID, userID)
	if err != nil {
		return fmt.Errorf("failed to remove participant: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rows == 0 {
		return fmt.Errorf("participant not found")
	}

	return nil
}

// GetParticipants retrieves all participants in a room
func (r *FocusRoomRepository) GetParticipants(ctx context.Context, roomID uuid.UUID) ([]*entity.RoomParticipant, error) {
	query := `
		SELECT id, room_id, user_id, joined_at, is_focusing, current_task
		FROM room_participants
		WHERE room_id = $1
		ORDER BY joined_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query, roomID)
	if err != nil {
		return nil, fmt.Errorf("failed to get participants: %w", err)
	}
	defer rows.Close()

	var participants []*entity.RoomParticipant
	for rows.Next() {
		var p entity.RoomParticipant
		err := rows.Scan(
			&p.ID,
			&p.RoomID,
			&p.UserID,
			&p.JoinedAt,
			&p.IsFocusing,
			&p.CurrentTask,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan participant: %w", err)
		}
		participants = append(participants, &p)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating participants: %w", err)
	}

	return participants, nil
}

// GetParticipantCount gets the number of participants in a room
func (r *FocusRoomRepository) GetParticipantCount(ctx context.Context, roomID uuid.UUID) (int, error) {
	query := `SELECT COUNT(*) FROM room_participants WHERE room_id = $1`

	var count int
	err := r.db.QueryRowContext(ctx, query, roomID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count participants: %w", err)
	}

	return count, nil
}

// UpdateParticipantStatus updates a participant's focusing status and current task
func (r *FocusRoomRepository) UpdateParticipantStatus(ctx context.Context, roomID uuid.UUID, userID string, isFocusing bool, currentTask *string) error {
	query := `
		UPDATE room_participants
		SET is_focusing = $3, current_task = $4, last_activity_at = $5
		WHERE room_id = $1 AND user_id = $2
	`

	result, err := r.db.ExecContext(ctx, query, roomID, userID, isFocusing, currentTask, time.Now())
	if err != nil {
		return fmt.Errorf("failed to update participant status: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}
	if rows == 0 {
		return fmt.Errorf("participant not found")
	}

	return nil
}
