package grpc

import (
	"context"
	"time"

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
	roomService        *focus.RoomService
	sessionService     *focus.SessionService
	analyticsService   *focus.AnalyticsService
	streakService      *focus.StreakService
	leaderboardService *focus.LeaderboardService
	taskService        *focus.TaskService
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
		roomService:        roomService,
		sessionService:     sessionService,
		analyticsService:   analyticsService,
		streakService:      streakService,
		leaderboardService: leaderboardService,
		taskService:        taskService,
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

// Helper functions for Task conversion
func convertProtoTaskPriority(protoPriority v1.TaskPriority) entity.TaskPriority {
	switch protoPriority {
	case v1.TaskPriority_TASK_PRIORITY_LOW:
		return entity.TaskPriorityLow
	case v1.TaskPriority_TASK_PRIORITY_MEDIUM:
		return entity.TaskPriorityMedium
	case v1.TaskPriority_TASK_PRIORITY_HIGH:
		return entity.TaskPriorityHigh
	default:
		return entity.TaskPriorityMedium
	}
}

func convertTaskPriorityToProto(entityPriority entity.TaskPriority) v1.TaskPriority {
	switch entityPriority {
	case entity.TaskPriorityLow:
		return v1.TaskPriority_TASK_PRIORITY_LOW
	case entity.TaskPriorityMedium:
		return v1.TaskPriority_TASK_PRIORITY_MEDIUM
	case entity.TaskPriorityHigh:
		return v1.TaskPriority_TASK_PRIORITY_HIGH
	default:
		return v1.TaskPriority_TASK_PRIORITY_MEDIUM
	}
}

func convertTaskToProto(task *entity.FocusTask) *v1.Task {
	proto := &v1.Task{
		Id:              task.ID.String(),
		UserId:          task.UserID,
		Title:           task.Title,
		Priority:        convertTaskPriorityToProto(task.Priority),
		IsCompleted:     task.IsCompleted,
		ActualPomodoros: int32(task.ActualPomodoros),
		CreatedAt:       timestamppb.New(task.CreatedAt),
		UpdatedAt:       timestamppb.New(task.UpdatedAt),
	}

	if task.Description != nil {
		proto.Description = *task.Description
	}

	if task.SubjectTag != nil {
		proto.SubjectTag = *task.SubjectTag
	}

	if task.DueDate != nil {
		proto.DueDate = task.DueDate.Format("2006-01-02")
	}

	if task.EstimatedPomodoros != nil {
		proto.EstimatedPomodoros = int32(*task.EstimatedPomodoros)
	}

	if task.CompletedAt != nil {
		proto.CompletedAt = timestamppb.New(*task.CompletedAt)
	}

	return proto
}

// Helper functions for Analytics conversion
func convertDailyStatsToProto(stats *entity.DailyAnalytics) *v1.DailyStats {
	proto := &v1.DailyStats{
		Date:                  stats.Date.Format("2006-01-02"),
		TotalFocusTimeSeconds: int32(stats.TotalFocusTimeSeconds),
		TotalBreakTimeSeconds: int32(stats.TotalBreakTimeSeconds),
		SessionsCompleted:     int32(stats.SessionsCompleted),
		TasksCompleted:        int32(stats.TasksCompleted),
		SubjectsStudied:       make(map[string]int32),
	}

	if stats.MostProductiveHour != nil {
		proto.MostProductiveHour = int32(*stats.MostProductiveHour)
	}

	for subject, seconds := range stats.SubjectsStudied {
		proto.SubjectsStudied[subject] = int32(seconds)
	}

	return proto
}

func convertWeeklyStatsToProto(stats *entity.WeeklyAnalytics) *v1.WeeklyStats {
	proto := &v1.WeeklyStats{
		WeekStart:             stats.WeekStart.Format("2006-01-02"),
		WeekEnd:               stats.WeekEnd.Format("2006-01-02"),
		TotalFocusTimeSeconds: int32(stats.TotalFocusTimeSeconds),
		AverageDailyTime:      int32(stats.AverageDailyTime),
		Streak:                int32(stats.Streak),
		Improvement:           stats.Improvement,
		DailyBreakdown:        make([]*v1.DailyStats, len(stats.DailyBreakdown)),
	}

	if stats.MostProductiveDay != nil {
		proto.MostProductiveDay = stats.MostProductiveDay.Format("2006-01-02")
	}

	for i, daily := range stats.DailyBreakdown {
		proto.DailyBreakdown[i] = convertDailyStatsToProto(&daily)
	}

	return proto
}

func convertMonthlyStatsToProto(stats *entity.MonthlyAnalytics) *v1.MonthlyStats {
	proto := &v1.MonthlyStats{
		Month:                 int32(stats.Month),
		Year:                  int32(stats.Year),
		TotalFocusTimeSeconds: int32(stats.TotalFocusTimeSeconds),
		TotalDaysActive:       int32(stats.TotalDaysActive),
		AverageDailyTime:      int32(stats.AverageDailyTime),
		LongestStreak:         int32(stats.LongestStreak),
		TopSubjects:           make([]*v1.SubjectTime, len(stats.TopSubjects)),
		WeeklyBreakdown:       make([]*v1.WeeklyStats, len(stats.WeeklyBreakdown)),
	}

	for i, subject := range stats.TopSubjects {
		proto.TopSubjects[i] = &v1.SubjectTime{
			Subject:     subject.Subject,
			TimeSeconds: int32(subject.TimeSeconds),
			Percentage:  subject.Percentage,
		}
	}

	for i, weekly := range stats.WeeklyBreakdown {
		proto.WeeklyBreakdown[i] = convertWeeklyStatsToProto(&weekly)
	}

	return proto
}

func convertContributionDayToProto(day *entity.ContributionDay) *v1.ContributionDay {
	return &v1.ContributionDay{
		Date:             day.Date.Format("2006-01-02"),
		FocusTimeSeconds: int32(day.FocusTimeSeconds),
		Level:            int32(day.Level),
		SessionsCount:    int32(day.SessionsCount),
	}
}

// UpdateRoomSettings updates room settings
func (s *FocusRoomServiceServer) UpdateRoomSettings(ctx context.Context, req *v1.UpdateRoomSettingsRequest) (*v1.Room, error) {
	// Get user from context
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "failed to get user from context: %v", err)
	}

	// Validate request
	if req.GetRoomId() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "room ID is required")
	}

	roomID, err := uuid.Parse(req.GetRoomId())
	if err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "invalid room ID: %v", err)
	}

	// Get existing room to check ownership
	room, err := s.roomService.GetRoom(ctx, roomID)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "room not found: %v", err)
	}

	// Check if user is owner
	if room.OwnerUserID != userID {
		return nil, status.Errorf(codes.PermissionDenied, "only room owner can update settings")
	}

	// Note: UpdateRoom service method not yet implemented
	// TODO: Implement room.Update() in RoomService
	return nil, status.Errorf(codes.Unimplemented, "UpdateRoomSettings requires UpdateRoom service method - coming in Phase 2")
}

// GetUserStats retrieves user statistics (stub - service method not ready)
func (s *FocusRoomServiceServer) GetUserStats(ctx context.Context, req *v1.GetUserStatsRequest) (*v1.UserStats, error) {
	// TODO: Implement GetUserStats in AnalyticsService
	return nil, status.Errorf(codes.Unimplemented, "GetUserStats not fully implemented - coming in Phase 3")
}

// GetDailyStats retrieves daily statistics
func (s *FocusRoomServiceServer) GetDailyStats(ctx context.Context, req *v1.GetDailyStatsRequest) (*v1.DailyStatsResponse, error) {
	// Get user from context
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "failed to get user from context: %v", err)
	}

	// Parse date
	var date time.Time
	if req.GetDate() != "" {
		date, err = time.Parse("2006-01-02", req.GetDate())
		if err != nil {
			return nil, status.Errorf(codes.InvalidArgument, "invalid date format: %v", err)
		}
	} else {
		date = time.Now()
	}

	// Get stats
	stats, err := s.analyticsService.GetDailyStats(ctx, userID, date)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get daily stats: %v", err)
	}

	// Convert to proto
	return &v1.DailyStatsResponse{
		Stats: convertDailyStatsToProto(stats),
	}, nil
}

// GetWeeklyStats retrieves weekly statistics
func (s *FocusRoomServiceServer) GetWeeklyStats(ctx context.Context, req *v1.GetWeeklyStatsRequest) (*v1.WeeklyStatsResponse, error) {
	// Get user from context
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "failed to get user from context: %v", err)
	}

	// Parse week start
	var weekStart time.Time
	if req.GetWeekStart() != "" {
		weekStart, err = time.Parse("2006-01-02", req.GetWeekStart())
		if err != nil {
			return nil, status.Errorf(codes.InvalidArgument, "invalid week start format: %v", err)
		}
	} else {
		// Start of current week (Monday)
		now := time.Now()
		weekStart = now.AddDate(0, 0, -int(now.Weekday())+1)
	}

	// Get stats
	stats, err := s.analyticsService.GetWeeklyStats(ctx, userID, weekStart)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get weekly stats: %v", err)
	}

	// Convert to proto
	return &v1.WeeklyStatsResponse{
		Stats: convertWeeklyStatsToProto(stats),
	}, nil
}

// GetMonthlyStats retrieves monthly statistics
func (s *FocusRoomServiceServer) GetMonthlyStats(ctx context.Context, req *v1.GetMonthlyStatsRequest) (*v1.MonthlyStatsResponse, error) {
	// Get user from context
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "failed to get user from context: %v", err)
	}

	// Get year/month
	year := int(req.GetYear())
	month := int(req.GetMonth())

	if year == 0 {
		year = time.Now().Year()
	}
	if month == 0 {
		month = int(time.Now().Month())
	}

	// Validate
	if month < 1 || month > 12 {
		return nil, status.Errorf(codes.InvalidArgument, "invalid month: must be 1-12")
	}

	// Get stats
	stats, err := s.analyticsService.GetMonthlyStats(ctx, userID, year, month)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get monthly stats: %v", err)
	}

	// Convert to proto
	return &v1.MonthlyStatsResponse{
		Stats: convertMonthlyStatsToProto(stats),
	}, nil
}

// GetContributionGraph retrieves contribution graph data
func (s *FocusRoomServiceServer) GetContributionGraph(ctx context.Context, req *v1.GetContributionGraphRequest) (*v1.GetContributionGraphResponse, error) {
	// Get user from context
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "failed to get user from context: %v", err)
	}

	// Get days parameter (default 365)
	days := int(req.GetDays())
	if days <= 0 {
		days = 365
	}

	// Get contribution data
	contributions, err := s.analyticsService.GetContributionGraph(ctx, userID, days)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get contribution graph: %v", err)
	}

	// Convert to proto
	protoContributions := make([]*v1.ContributionDay, len(contributions))
	for i, day := range contributions {
		protoContributions[i] = convertContributionDayToProto(day)
	}

	return &v1.GetContributionGraphResponse{
		Contributions: protoContributions,
	}, nil
}

// GetLeaderboard retrieves the leaderboard
func (s *FocusRoomServiceServer) GetLeaderboard(ctx context.Context, req *v1.GetLeaderboardRequest) (*v1.LeaderboardResponse, error) {
	// Get period from request
	period := convertProtoToLeaderboardPeriod(req.GetPeriod())
	limit := int(req.GetLimit())
	if limit <= 0 {
		limit = 100 // Default top 100
	}

	// Get leaderboard entries
	entries, err := s.leaderboardService.GetLeaderboard(ctx, "global", period, limit)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get leaderboard: %v", err)
	}

	// Convert to proto
	protoEntries := make([]*v1.LeaderboardEntry, len(entries))
	for i, entry := range entries {
		protoEntries[i] = convertLeaderboardEntryToProto(entry)
	}

	// Calculate period range for response
	periodStart, periodEnd := calculatePeriodRangeForProto(period)

	return &v1.LeaderboardResponse{
		Entries:     protoEntries,
		Period:      req.GetPeriod(),
		PeriodStart: periodStart,
		PeriodEnd:   periodEnd,
	}, nil
}

// GetUserRank retrieves user's rank
func (s *FocusRoomServiceServer) GetUserRank(ctx context.Context, req *v1.GetUserRankRequest) (*v1.UserRankResponse, error) {
	// Get user from context
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "failed to get user from context: %v", err)
	}

	// Get period
	period := convertProtoToLeaderboardPeriod(req.GetPeriod())

	// Get user rank
	rank, err := s.leaderboardService.GetUserRank(ctx, userID, period)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user rank: %v", err)
	}

	return &v1.UserRankResponse{
		Rank: &v1.UserRank{
			Rank: int32(rank),
		},
	}, nil
}

// Helper functions for Leaderboard conversion
func convertProtoToLeaderboardPeriod(protoPeriod v1.LeaderboardPeriod) entity.LeaderboardPeriod {
	switch protoPeriod {
	case v1.LeaderboardPeriod_LEADERBOARD_PERIOD_DAILY:
		return entity.LeaderboardPeriodDaily
	case v1.LeaderboardPeriod_LEADERBOARD_PERIOD_WEEKLY:
		return entity.LeaderboardPeriodWeekly
	case v1.LeaderboardPeriod_LEADERBOARD_PERIOD_MONTHLY:
		return entity.LeaderboardPeriodMonthly
	case v1.LeaderboardPeriod_LEADERBOARD_PERIOD_ALL_TIME:
		return entity.LeaderboardPeriodAllTime
	default:
		return entity.LeaderboardPeriodWeekly
	}
}

func convertLeaderboardEntryToProto(entry *entity.LeaderboardEntry) *v1.LeaderboardEntry {
	proto := &v1.LeaderboardEntry{
		UserId:                entry.UserID,
		Username:              entry.Username,
		Avatar:                entry.Avatar,
		TotalFocusTimeSeconds: entry.TotalFocusTimeSeconds,
		SessionsCompleted:     int32(entry.SessionsCompleted),
		CurrentStreak:         int32(entry.CurrentStreak),
		Score:                 entry.Score,
	}

	if entry.Rank != nil {
		proto.Rank = int32(*entry.Rank)
	}

	return proto
}

func calculatePeriodRangeForProto(period entity.LeaderboardPeriod) (string, string) {
	now := time.Now()
	var start, end time.Time

	switch period {
	case entity.LeaderboardPeriodDaily:
		start = time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
		end = start.AddDate(0, 0, 1)
	case entity.LeaderboardPeriodWeekly:
		// Start of week (Monday)
		weekday := int(now.Weekday())
		if weekday == 0 {
			weekday = 7
		}
		start = now.AddDate(0, 0, -weekday+1)
		start = time.Date(start.Year(), start.Month(), start.Day(), 0, 0, 0, 0, start.Location())
		end = start.AddDate(0, 0, 7)
	case entity.LeaderboardPeriodMonthly:
		start = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
		end = start.AddDate(0, 1, 0)
	case entity.LeaderboardPeriodAllTime:
		start = time.Date(2020, 1, 1, 0, 0, 0, 0, now.Location())
		end = now.AddDate(10, 0, 0) // Far future
	default:
		start = now
		end = now
	}

	return start.Format("2006-01-02"), end.Format("2006-01-02")
}

// CreateTask creates a new task
func (s *FocusRoomServiceServer) CreateTask(ctx context.Context, req *v1.CreateTaskRequest) (*v1.Task, error) {
	// Get user from context
	userIDInt, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "failed to get user from context: %v", err)
	}

	// Validate request
	if req.GetTitle() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "task title is required")
	}

	// Convert proto to entity
	task := &entity.FocusTask{
		UserID:      userIDInt,
		Title:       req.GetTitle(),
		Priority:    convertProtoTaskPriority(req.GetPriority()),
		IsCompleted: false,
	}

	if req.GetDescription() != "" {
		desc := req.GetDescription()
		task.Description = &desc
	}

	if req.GetSubjectTag() != "" {
		subject := req.GetSubjectTag()
		task.SubjectTag = &subject
	}

	if req.GetDueDate() != "" {
		// Parse ISO date string
		// Note: You may want to add proper date parsing here
		// For now, we'll skip parsing to avoid errors
	}

	if req.GetEstimatedPomodoros() > 0 {
		est := int(req.GetEstimatedPomodoros())
		task.EstimatedPomodoros = &est
	}

	// Create task
	if err := s.taskService.CreateTask(ctx, task); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to create task: %v", err)
	}

	// Convert entity to proto
	return convertTaskToProto(task), nil
}

// UpdateTask updates a task
func (s *FocusRoomServiceServer) UpdateTask(ctx context.Context, req *v1.UpdateTaskRequest) (*v1.Task, error) {
	// Get user from context
	userIDInt, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "failed to get user from context: %v", err)
	}

	// Validate request
	if req.GetTaskId() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "task ID is required")
	}

	taskID, err := uuid.Parse(req.GetTaskId())
	if err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "invalid task ID: %v", err)
	}

	// Convert proto to entity updates
	updates := &entity.FocusTask{
		ID:       taskID,
		UserID:   userIDInt,
		Title:    req.GetTitle(),
		Priority: convertProtoTaskPriority(req.GetPriority()),
	}

	if req.GetDescription() != "" {
		desc := req.GetDescription()
		updates.Description = &desc
	}

	if req.GetSubjectTag() != "" {
		subject := req.GetSubjectTag()
		updates.SubjectTag = &subject
	}

	if req.GetEstimatedPomodoros() > 0 {
		est := int(req.GetEstimatedPomodoros())
		updates.EstimatedPomodoros = &est
	}

	// Update task
	if err := s.taskService.UpdateTask(ctx, taskID, userIDInt, updates); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to update task: %v", err)
	}

	// Get updated task
	task, err := s.taskService.GetTask(ctx, taskID, userIDInt)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "task not found: %v", err)
	}

	// Convert entity to proto
	return convertTaskToProto(task), nil
}

// DeleteTask deletes a task
func (s *FocusRoomServiceServer) DeleteTask(ctx context.Context, req *v1.DeleteTaskRequest) (*emptypb.Empty, error) {
	// Get user from context
	userIDInt, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "failed to get user from context: %v", err)
	}

	// Validate request
	if req.GetTaskId() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "task ID is required")
	}

	taskID, err := uuid.Parse(req.GetTaskId())
	if err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "invalid task ID: %v", err)
	}

	// Delete task
	if err := s.taskService.DeleteTask(ctx, taskID, userIDInt); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to delete task: %v", err)
	}

	return &emptypb.Empty{}, nil
}

// ListTasks lists tasks
func (s *FocusRoomServiceServer) ListTasks(ctx context.Context, req *v1.ListTasksRequest) (*v1.ListTasksResponse, error) {
	// Get user from context
	userIDInt, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "failed to get user from context: %v", err)
	}

	// Build filter
	filter := interfaces.TaskFilter{
		CompletedOnly: req.GetCompletedOnly(),
		ActiveOnly:    req.GetActiveOnly(),
		Page:          int(req.GetPage()),
		PageSize:      int(req.GetPageSize()),
	}

	if req.GetSubjectTag() != "" {
		subject := req.GetSubjectTag()
		filter.SubjectTag = &subject
	}

	// List tasks
	tasks, total, err := s.taskService.ListTasks(ctx, userIDInt, filter)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to list tasks: %v", err)
	}

	// Convert entities to proto
	protoTasks := make([]*v1.Task, len(tasks))
	for i, task := range tasks {
		protoTasks[i] = convertTaskToProto(task)
	}

	return &v1.ListTasksResponse{
		Tasks: protoTasks,
		Total: int32(total),
	}, nil
}

// CompleteTask completes a task
func (s *FocusRoomServiceServer) CompleteTask(ctx context.Context, req *v1.CompleteTaskRequest) (*v1.Task, error) {
	// Get user from context
	userIDInt, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "failed to get user from context: %v", err)
	}

	// Validate request
	if req.GetTaskId() == "" {
		return nil, status.Errorf(codes.InvalidArgument, "task ID is required")
	}

	taskID, err := uuid.Parse(req.GetTaskId())
	if err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "invalid task ID: %v", err)
	}

	// Complete task
	if err := s.taskService.CompleteTask(ctx, taskID, userIDInt); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to complete task: %v", err)
	}

	// Get updated task
	task, err := s.taskService.GetTask(ctx, taskID, userIDInt)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "task not found: %v", err)
	}

	// Convert entity to proto
	return convertTaskToProto(task), nil
}

// PauseSession pauses a session (stub for now)
func (s *FocusRoomServiceServer) PauseSession(ctx context.Context, req *v1.PauseSessionRequest) (*v1.FocusSession, error) {
	return nil, status.Errorf(codes.Unimplemented, "method PauseSession not implemented")
}
