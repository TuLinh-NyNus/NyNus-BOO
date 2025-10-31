package focus

import (
	"context"
	"fmt"
	"time"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/repository/interfaces"
	"github.com/google/uuid"
)

// RoomService handles business logic for focus rooms
type RoomService struct {
	roomRepo interfaces.FocusRoomRepository
}

// NewRoomService creates a new room service instance
func NewRoomService(roomRepo interfaces.FocusRoomRepository) *RoomService {
	return &RoomService{
		roomRepo: roomRepo,
	}
}

// CreateRoom creates a new focus room with validation
func (s *RoomService) CreateRoom(ctx context.Context, room *entity.FocusRoom) error {
	// Validate room data
	if err := room.Validate(); err != nil {
		return fmt.Errorf("validation failed: %w", err)
	}

	// Set default settings if not provided
	if room.Settings.FocusDuration == 0 {
		room.Settings = entity.DefaultRoomSettings()
	}

	// Set defaults
	if room.MaxParticipants == 0 {
		room.MaxParticipants = 50
	}
	room.IsActive = true
	room.ID = uuid.New()

	// Create room
	if err := s.roomRepo.Create(ctx, room); err != nil {
		return fmt.Errorf("failed to create room: %w", err)
	}

	return nil
}

// GetRoom retrieves a room by ID
func (s *RoomService) GetRoom(ctx context.Context, roomID uuid.UUID) (*entity.FocusRoom, error) {
	room, err := s.roomRepo.GetByID(ctx, roomID)
	if err != nil {
		return nil, fmt.Errorf("failed to get room: %w", err)
	}

	return room, nil
}

// ListRooms retrieves rooms with filters
func (s *RoomService) ListRooms(ctx context.Context, filter interfaces.RoomFilter) ([]*entity.FocusRoom, int, error) {
	rooms, total, err := s.roomRepo.List(ctx, filter)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list rooms: %w", err)
	}

	return rooms, total, nil
}

// JoinRoom adds a user to a room with capacity check
func (s *RoomService) JoinRoom(ctx context.Context, roomID uuid.UUID, userID string) error {
	// Get room
	room, err := s.roomRepo.GetByID(ctx, roomID)
	if err != nil {
		return fmt.Errorf("room not found: %w", err)
	}

	// Check if room is active
	if !room.IsActive {
		return fmt.Errorf("room is not active")
	}

	// Check capacity
	count, err := s.roomRepo.GetParticipantCount(ctx, roomID)
	if err != nil {
		return fmt.Errorf("failed to get participant count: %w", err)
	}

	if count >= room.MaxParticipants {
		return fmt.Errorf("room is full (max %d participants)", room.MaxParticipants)
	}

	// Add participant
	if err := s.roomRepo.AddParticipant(ctx, roomID, userID); err != nil {
		return fmt.Errorf("failed to join room: %w", err)
	}

	return nil
}

// LeaveRoom removes a user from a room
func (s *RoomService) LeaveRoom(ctx context.Context, roomID uuid.UUID, userID string) error {
	if err := s.roomRepo.RemoveParticipant(ctx, roomID, userID); err != nil {
		return fmt.Errorf("failed to leave room: %w", err)
	}

	return nil
}

// UpdateRoomSettings updates room settings (owner only)
func (s *RoomService) UpdateRoomSettings(ctx context.Context, roomID uuid.UUID, ownerUserID string, settings entity.RoomSettings) error {
	// Get room
	room, err := s.roomRepo.GetByID(ctx, roomID)
	if err != nil {
		return fmt.Errorf("room not found: %w", err)
	}

	// Check ownership
	if room.OwnerUserID != ownerUserID {
		return fmt.Errorf("only room owner can update settings")
	}

	// Update settings
	room.Settings = settings
	room.UpdatedAt = time.Now()

	if err := s.roomRepo.Update(ctx, room); err != nil {
		return fmt.Errorf("failed to update room: %w", err)
	}

	return nil
}

// GetParticipants retrieves all participants in a room
func (s *RoomService) GetParticipants(ctx context.Context, roomID uuid.UUID) ([]*entity.RoomParticipant, error) {
	participants, err := s.roomRepo.GetParticipants(ctx, roomID)
	if err != nil {
		return nil, fmt.Errorf("failed to get participants: %w", err)
	}

	return participants, nil
}

// UpdateParticipantStatus updates a participant's status in a room
func (s *RoomService) UpdateParticipantStatus(ctx context.Context, roomID uuid.UUID, userID string, isFocusing bool, currentTask *string) error {
	if err := s.roomRepo.UpdateParticipantStatus(ctx, roomID, userID, isFocusing, currentTask); err != nil {
		return fmt.Errorf("failed to update participant status: %w", err)
	}

	return nil
}

// DeleteRoom deletes a room (owner only)
func (s *RoomService) DeleteRoom(ctx context.Context, roomID uuid.UUID, ownerUserID string) error {
	// Get room
	room, err := s.roomRepo.GetByID(ctx, roomID)
	if err != nil {
		return fmt.Errorf("room not found: %w", err)
	}

	// Check ownership
	if room.OwnerUserID != ownerUserID {
		return fmt.Errorf("only room owner can delete room")
	}

	if err := s.roomRepo.Delete(ctx, roomID); err != nil {
		return fmt.Errorf("failed to delete room: %w", err)
	}

	return nil
}


