package grpc

import (
	"context"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/middleware"
	"exam-bank-system/apps/backend/internal/repository/interfaces"
	"exam-bank-system/apps/backend/internal/service/focus"
	v1 "exam-bank-system/apps/backend/pkg/proto/v1"

	"github.com/google/uuid"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/emptypb"
	"google.golang.org/protobuf/types/known/timestamppb"
)

// FocusRoomServiceServer implements the FocusRoomService gRPC server
type FocusRoomServiceServer struct {
	v1.UnimplementedFocusRoomServiceServer
	roomService    *focus.RoomService
	sessionService *focus.SessionService
	analyticsService *focus.AnalyticsService
	streakService  *focus.StreakService
	leaderboardService *focus.LeaderboardService
	taskService    *focus.TaskService
}

// NewFocusRoomServiceServer creates a new FocusRoomServiceServer
func NewFocusRoomServiceServer(
	roomService *focus.RoomService,
	sessionService *focus.SessionService,
	analyticsService *focus.AnalyticsService,
	streakService *focus.StreakService,
	leaderboardService *focus.LeaderboardService,
	taskService *focus.TaskService,
) *FocusRoomServiceServer {
	return &FocusRoomServiceServer{
		roomService:    roomService,
		sessionService: sessionService,
		analyticsService: analyticsService,
		streakService:  streakService,
		leaderboardService: leaderboardService,
		taskService:    taskService,
	}
}

// CreateRoom creates a new focus room
func (s *FocusRoomServiceServer) CreateRoom(ctx context.Context, req *v1.CreateRoomRequest) (*v1.Room, error) {
	// Get user from context
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "failed to get user from context: %v", err)
	}

	// Validate request
	if req.GetName() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "room name is required")
	}

	// Convert proto to entity
	room := &entity.FocusRoom{
		Name:            req.GetName(),
		Description:     req.GetDescription(),
		OwnerUserID:     userID,
		RoomType:        convertProtoRoomType(req.GetRoomType()),
		MaxParticipants: int(req.GetMaxParticipants()),
	}

	if room.MaxParticipants == 0 {
		room.MaxParticipants = 50
	}

	// Create room
	if err := s.roomService.CreateRoom(ctx, room); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to create room: %v", err)
	}

	// Convert entity to proto
	return convertRoomToProto(room), nil
}

// GetRoom retrieves a room by ID
func (s *FocusRoomServiceServer) GetRoom(ctx context.Context, req *v1.GetRoomRequest) (*v1.Room, error) {
	// Validate request
	if req.GetRoomId() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "room ID is required")
	}

	roomID, err := uuid.Parse(req.GetRoomId())
	if err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "invalid room ID: %v", err)
	}

	// Get room
	room, err := s.roomService.GetRoom(ctx, roomID)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "room not found: %v", err)
	}

	return convertRoomToProto(room), nil
}

// ListRooms retrieves a list of rooms
func (s *FocusRoomServiceServer) ListRooms(ctx context.Context, req *v1.ListRoomsRequest) (*v1.ListRoomsResponse, error) {
	// Build filter
	filter := interfaces.RoomFilter{
		ActiveOnly: req.GetActiveOnly(),
		Page:       int(req.GetPage()),
		PageSize:   int(req.GetPageSize()),
	}

	if req.GetRoomType() != v1.RoomType_ROOM_TYPE_UNSPECIFIED {
		roomType := convertProtoRoomType(req.GetRoomType())
		filter.RoomType = &roomType
	}

	// List rooms
	rooms, total, err := s.roomService.ListRooms(ctx, filter)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to list rooms: %v", err)
	}

	// Convert to proto
	protoRooms := make([]*v1.Room, len(rooms))
	for i, room := range rooms {
		protoRooms[i] = convertRoomToProto(room)
	}

	return &v1.ListRoomsResponse{
		Rooms: protoRooms,
		Total: int32(total),
	}, nil
}

// JoinRoom joins a focus room
func (s *FocusRoomServiceServer) JoinRoom(ctx context.Context, req *v1.JoinRoomRequest) (*v1.JoinRoomResponse, error) {
	// Get user from context
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "failed to get user from context: %v", err)
	}

	roomID, err := uuid.Parse(req.GetRoomId())
	if err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "invalid room ID: %v", err)
	}

	// Join room
	if err := s.roomService.JoinRoom(ctx, roomID, userID); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to join room: %v", err)
	}

	// Get room info
	room, _ := s.roomService.GetRoom(ctx, roomID)

	return &v1.JoinRoomResponse{
		Room: convertRoomToProto(room),
	}, nil
}

// LeaveRoom leaves a focus room
func (s *FocusRoomServiceServer) LeaveRoom(ctx context.Context, req *v1.LeaveRoomRequest) (*emptypb.Empty, error) {
	// Get user from context
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "failed to get user from context: %v", err)
	}

	roomID, err := uuid.Parse(req.GetRoomId())
	if err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "invalid room ID: %v", err)
	}

	// Leave room
	if err := s.roomService.LeaveRoom(ctx, roomID, userID); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to leave room: %v", err)
	}

	return &emptypb.Empty{}, nil
}

// StartFocusSession starts a new focus session
func (s *FocusRoomServiceServer) StartFocusSession(ctx context.Context, req *v1.StartSessionRequest) (*v1.FocusSession, error) {
	// Get user from context
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "failed to get user from context: %v", err)
	}

	// Parse room ID if provided
	var roomID *uuid.UUID
	if req.GetRoomId() != "" {
		parsed, err := uuid.Parse(req.GetRoomId())
		if err != nil {
			return nil, status.Errorf(codes.InvalidArgument, "invalid room ID: %v", err)
		}
		roomID = &parsed
	}

	// Convert session type
	sessionType := convertProtoSessionType(req.GetSessionType())

	// Start session
	var task, subject *string
	if req.GetTaskDescription() != "" {
		t := req.GetTaskDescription()
		task = &t
	}
	if req.GetSubjectTag() != "" {
		s := req.GetSubjectTag()
		subject = &s
	}

	session, err := s.sessionService.StartSession(ctx, userID, sessionType, roomID, task, subject)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to start session: %v", err)
	}

	return convertSessionToProto(session), nil
}

// EndFocusSession ends an active focus session
func (s *FocusRoomServiceServer) EndFocusSession(ctx context.Context, req *v1.EndSessionRequest) (*v1.SessionStats, error) {
	// Get user from context
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "failed to get user from context: %v", err)
	}

	sessionID, err := uuid.Parse(req.GetSessionId())
	if err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "invalid session ID: %v", err)
	}

	// End session
	stats, err := s.sessionService.EndSession(ctx, sessionID, userID)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to end session: %v", err)
	}

	return &v1.SessionStats{
		DurationSeconds:     int32(stats.Session.DurationSeconds),
		TotalFocusTimeToday: int32(stats.TodayFocusTime),
		StreakContinued:     stats.NewStreak > 0,
		CurrentStreak:       int32(stats.NewStreak),
	}, nil
}

// GetActiveSession retrieves the active session for a user
func (s *FocusRoomServiceServer) GetActiveSession(ctx context.Context, req *v1.GetActiveSessionRequest) (*v1.FocusSession, error) {
	// Get user from context
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "failed to get user from context: %v", err)
	}

	session, err := s.sessionService.GetActiveSession(ctx, userID)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get active session: %v", err)
	}

	if session == nil {
		return nil, status.Errorf(codes.NotFound, "no active session")
	}

	return convertSessionToProto(session), nil
}

// GetStreak retrieves a user's streak information
func (s *FocusRoomServiceServer) GetStreak(ctx context.Context, req *v1.GetStreakRequest) (*v1.StreakInfo, error) {
	// Get user from context
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "failed to get user from context: %v", err)
	}

	streak, err := s.streakService.GetStreak(ctx, userID)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get streak: %v", err)
	}

	return convertStreakToProto(streak), nil
}

// Helper conversion functions
func convertProtoRoomType(protoType v1.RoomType) entity.RoomType {
	switch protoType {
	case v1.RoomType_ROOM_TYPE_PUBLIC:
		return entity.RoomTypePublic
	case v1.RoomType_ROOM_TYPE_PRIVATE:
		return entity.RoomTypePrivate
	case v1.RoomType_ROOM_TYPE_CLASS:
		return entity.RoomTypeClass
	default:
		return entity.RoomTypePublic
	}
}

func convertRoomTypeToProto(entityType entity.RoomType) v1.RoomType {
	switch entityType {
	case entity.RoomTypePublic:
		return v1.RoomType_ROOM_TYPE_PUBLIC
	case entity.RoomTypePrivate:
		return v1.RoomType_ROOM_TYPE_PRIVATE
	case entity.RoomTypeClass:
		return v1.RoomType_ROOM_TYPE_CLASS
	default:
		return v1.RoomType_ROOM_TYPE_UNSPECIFIED
	}
}

func convertProtoSessionType(protoType v1.SessionType) entity.SessionType {
	switch protoType {
	case v1.SessionType_SESSION_TYPE_FOCUS:
		return entity.SessionTypeFocus
	case v1.SessionType_SESSION_TYPE_SHORT_BREAK:
		return entity.SessionTypeShortBreak
	case v1.SessionType_SESSION_TYPE_LONG_BREAK:
		return entity.SessionTypeLongBreak
	default:
		return entity.SessionTypeFocus
	}
}

func convertSessionTypeToProto(entityType entity.SessionType) v1.SessionType {
	switch entityType {
	case entity.SessionTypeFocus:
		return v1.SessionType_SESSION_TYPE_FOCUS
	case entity.SessionTypeShortBreak:
		return v1.SessionType_SESSION_TYPE_SHORT_BREAK
	case entity.SessionTypeLongBreak:
		return v1.SessionType_SESSION_TYPE_LONG_BREAK
	default:
		return v1.SessionType_SESSION_TYPE_UNSPECIFIED
	}
}

func convertRoomToProto(room *entity.FocusRoom) *v1.Room {
	return &v1.Room{
		Id:              room.ID.String(),
		Name:            room.Name,
		Description:     room.Description,
		OwnerUserId:     room.OwnerUserID,
		RoomType:        convertRoomTypeToProto(room.RoomType),
		MaxParticipants: int32(room.MaxParticipants),
		IsActive:        room.IsActive,
		CreatedAt:       timestamppb.New(room.CreatedAt),
		UpdatedAt:       timestamppb.New(room.UpdatedAt),
	}
}

func convertSessionToProto(session *entity.FocusSession) *v1.FocusSession {
	proto := &v1.FocusSession{
		Id:              session.ID.String(),
		UserId:          session.UserID,
		DurationSeconds: int32(session.DurationSeconds),
		SessionType:     convertSessionTypeToProto(session.SessionType),
		Completed:       session.Completed,
		StartedAt:       timestamppb.New(session.StartedAt),
		CreatedAt:       timestamppb.New(session.CreatedAt),
	}

	if session.RoomID != nil {
		proto.RoomId = session.RoomID.String()
	}
	if session.SubjectTag != nil {
		proto.SubjectTag = *session.SubjectTag
	}
	if session.TaskDescription != nil {
		proto.TaskDescription = *session.TaskDescription
	}
	if session.EndedAt != nil {
		proto.EndedAt = timestamppb.New(*session.EndedAt)
	}

	return proto
}

func convertStreakToProto(streak *entity.UserStreak) *v1.StreakInfo {
	proto := &v1.StreakInfo{
		CurrentStreak:         int32(streak.CurrentStreak),
		LongestStreak:         int32(streak.LongestStreak),
		TotalStudyDays:        int32(streak.TotalStudyDays),
		TotalFocusTimeSeconds: streak.TotalFocusTimeSeconds,
		IsActiveToday:         streak.IsActiveToday(),
	}

	if streak.LastStudyDate != nil {
		proto.LastStudyDate = streak.LastStudyDate.Format("2006-01-02")
	}

	return proto
}

// UpdateRoomSettings updates room settings (stub for now)
func (s *FocusRoomServiceServer) UpdateRoomSettings(ctx context.Context, req *v1.UpdateRoomSettingsRequest) (*v1.Room, error) {
	return nil, status.Errorf(codes.Unimplemented, "method UpdateRoomSettings not implemented")
}

// GetUserStats retrieves user statistics (stub for now)
func (s *FocusRoomServiceServer) GetUserStats(ctx context.Context, req *v1.GetUserStatsRequest) (*v1.UserStats, error) {
	return nil, status.Errorf(codes.Unimplemented, "method GetUserStats not implemented")
}

// GetDailyStats retrieves daily statistics (stub for now)
func (s *FocusRoomServiceServer) GetDailyStats(ctx context.Context, req *v1.GetDailyStatsRequest) (*v1.DailyStatsResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method GetDailyStats not implemented")
}

// GetWeeklyStats retrieves weekly statistics (stub for now)
func (s *FocusRoomServiceServer) GetWeeklyStats(ctx context.Context, req *v1.GetWeeklyStatsRequest) (*v1.WeeklyStatsResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method GetWeeklyStats not implemented")
}

// GetMonthlyStats retrieves monthly statistics (stub for now)
func (s *FocusRoomServiceServer) GetMonthlyStats(ctx context.Context, req *v1.GetMonthlyStatsRequest) (*v1.MonthlyStatsResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method GetMonthlyStats not implemented")
}

// GetLeaderboard retrieves the leaderboard (stub for now)
func (s *FocusRoomServiceServer) GetLeaderboard(ctx context.Context, req *v1.GetLeaderboardRequest) (*v1.LeaderboardResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method GetLeaderboard not implemented")
}

// GetUserRank retrieves user's rank (stub for now)
func (s *FocusRoomServiceServer) GetUserRank(ctx context.Context, req *v1.GetUserRankRequest) (*v1.UserRankResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method GetUserRank not implemented")
}

// CreateTask creates a new task (stub for now)
func (s *FocusRoomServiceServer) CreateTask(ctx context.Context, req *v1.CreateTaskRequest) (*v1.Task, error) {
	return nil, status.Errorf(codes.Unimplemented, "method CreateTask not implemented")
}

// UpdateTask updates a task (stub for now)
func (s *FocusRoomServiceServer) UpdateTask(ctx context.Context, req *v1.UpdateTaskRequest) (*v1.Task, error) {
	return nil, status.Errorf(codes.Unimplemented, "method UpdateTask not implemented")
}

// DeleteTask deletes a task (stub for now)
func (s *FocusRoomServiceServer) DeleteTask(ctx context.Context, req *v1.DeleteTaskRequest) (*emptypb.Empty, error) {
	return nil, status.Errorf(codes.Unimplemented, "method DeleteTask not implemented")
}

// ListTasks lists tasks (stub for now)
func (s *FocusRoomServiceServer) ListTasks(ctx context.Context, req *v1.ListTasksRequest) (*v1.ListTasksResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method ListTasks not implemented")
}

// CompleteTask completes a task (stub for now)
func (s *FocusRoomServiceServer) CompleteTask(ctx context.Context, req *v1.CompleteTaskRequest) (*v1.Task, error) {
	return nil, status.Errorf(codes.Unimplemented, "method CompleteTask not implemented")
}

// PauseSession pauses a session (stub for now)
func (s *FocusRoomServiceServer) PauseSession(ctx context.Context, req *v1.PauseSessionRequest) (*v1.FocusSession, error) {
	return nil, status.Errorf(codes.Unimplemented, "method PauseSession not implemented")
}

