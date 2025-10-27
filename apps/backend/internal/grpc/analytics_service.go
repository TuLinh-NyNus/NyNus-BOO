package grpc

import (
	"context"

	"exam-bank-system/apps/backend/internal/middleware"
	"exam-bank-system/apps/backend/internal/service/system/analytics"
	"exam-bank-system/apps/backend/pkg/proto/common"
	v1 "exam-bank-system/apps/backend/pkg/proto/v1"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// AnalyticsServiceServer implements the AnalyticsService
type AnalyticsServiceServer struct {
	v1.UnimplementedAnalyticsServiceServer
	teacherAnalytics *analytics.TeacherAnalyticsService
}

// NewAnalyticsServiceServer creates a new analytics service
func NewAnalyticsServiceServer(teacherAnalytics *analytics.TeacherAnalyticsService) *AnalyticsServiceServer {
	return &AnalyticsServiceServer{
		teacherAnalytics: teacherAnalytics,
	}
}

// GetTeacherDashboard returns dashboard overview for a specific teacher
func (s *AnalyticsServiceServer) GetTeacherDashboard(ctx context.Context, req *v1.GetTeacherDashboardRequest) (*v1.GetTeacherDashboardResponse, error) {
	// Get user from context for authorization
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "failed to get user from context: %v", err)
	}

	// Verify teacher owns the data (or is admin)
	if req.GetTeacherId() != userID {
		// Check if user is admin
		userRole, err := middleware.GetUserRoleFromContext(ctx)
		if err != nil || userRole != "ADMIN" {
			return nil, status.Errorf(codes.PermissionDenied, "access denied: you can only view your own dashboard")
		}
	}

	// Get dashboard data
	data, err := s.teacherAnalytics.GetTeacherDashboard(ctx, req.GetTeacherId(), req.GetTimeRange())
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get teacher dashboard: %v", err)
	}

	// Convert to proto response
	protoData := &v1.TeacherDashboardData{
		TotalExams:       data.TotalExams,
		TotalStudents:    data.TotalStudents,
		AverageScore:     data.AverageScore,
		PassRate:         data.PassRate,
		ActiveStudents:   data.ActiveStudents,
		CompletionRate:   data.CompletionRate,
		Trends:           convertTrendsToProto(data.Trends),
		TopExams:         convertExamPerformanceToProto(data.TopExams),
	}

	return &v1.GetTeacherDashboardResponse{
		Response: &common.Response{
			Success: true,
			Message: "Dashboard data retrieved successfully",
		},
		Data: protoData,
	}, nil
}

// GetTeacherStudents returns list of students for a teacher
func (s *AnalyticsServiceServer) GetTeacherStudents(ctx context.Context, req *v1.GetTeacherStudentsRequest) (*v1.GetTeacherStudentsResponse, error) {
	// Get user from context for authorization
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "failed to get user from context: %v", err)
	}

	// Verify teacher owns the data (or is admin)
	if req.GetTeacherId() != userID {
		userRole, err := middleware.GetUserRoleFromContext(ctx)
		if err != nil || userRole != "ADMIN" {
			return nil, status.Errorf(codes.PermissionDenied, "access denied: you can only view your own students")
		}
	}

	// Validate pagination
	page := req.GetPage()
	if page < 1 {
		page = 1
	}
	pageSize := req.GetPageSize()
	if pageSize < 1 {
		pageSize = 20
	}
	if pageSize > 100 {
		pageSize = 100 // Limit max page size
	}

	// Get students data
	students, total, err := s.teacherAnalytics.GetTeacherStudents(ctx, req.GetTeacherId(), page, pageSize)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get teacher students: %v", err)
	}

	// Convert to proto response
	protoStudents := make([]*v1.StudentData, 0, len(students))
	for _, student := range students {
		protoStudents = append(protoStudents, &v1.StudentData{
			UserId:           student.UserID,
			Email:            student.Email,
			FirstName:        student.FirstName,
			LastName:         student.LastName,
			TotalCourses:     student.TotalCourses,
			TotalExamResults: student.TotalExamResults,
			AverageScore:     student.AverageScore,
			CompletionRate:   student.CompletionRate,
			Status:           student.Status,
			LastActivity:     student.LastActivity,
		})
	}

	return &v1.GetTeacherStudentsResponse{
		Response: &common.Response{
			Success: true,
			Message: "Students data retrieved successfully",
		},
		Students: protoStudents,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	}, nil
}

// GetTeacherExams returns list of exams created by teacher
func (s *AnalyticsServiceServer) GetTeacherExams(ctx context.Context, req *v1.GetTeacherExamsRequest) (*v1.GetTeacherExamsResponse, error) {
	// Get user from context for authorization
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Unauthenticated, "failed to get user from context: %v", err)
	}

	// Verify teacher owns the data (or is admin)
	if req.GetTeacherId() != userID {
		userRole, err := middleware.GetUserRoleFromContext(ctx)
		if err != nil || userRole != "ADMIN" {
			return nil, status.Errorf(codes.PermissionDenied, "access denied: you can only view your own exams")
		}
	}

	// Validate pagination
	page := req.GetPage()
	if page < 1 {
		page = 1
	}
	pageSize := req.GetPageSize()
	if pageSize < 1 {
		pageSize = 20
	}
	if pageSize > 100 {
		pageSize = 100
	}

	// Get exams data
	exams, total, err := s.teacherAnalytics.GetTeacherExams(ctx, req.GetTeacherId(), req.GetStatus(), page, pageSize)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get teacher exams: %v", err)
	}

	// Convert to proto response
	protoExams := make([]*v1.ExamData, 0, len(exams))
	for _, exam := range exams {
		protoExams = append(protoExams, &v1.ExamData{
			Id:              exam.ID,
			Title:           exam.Title,
			Description:     exam.Description,
			Subject:         exam.Subject,
			Grade:           exam.Grade,
			Difficulty:      exam.Difficulty,
			ExamType:        exam.ExamType,
			Status:          exam.Status,
			DurationMinutes: exam.DurationMinutes,
			TotalPoints:     exam.TotalPoints,
			PassPercentage:  exam.PassPercentage,
			QuestionCount:   exam.QuestionCount,
			AttemptCount:    exam.AttemptCount,
			AverageScore:    exam.AverageScore,
			CreatedAt:       exam.CreatedAt,
			PublishedAt:     exam.PublishedAt,
		})
	}

	return &v1.GetTeacherExamsResponse{
		Response: &common.Response{
			Success: true,
			Message: "Exams data retrieved successfully",
		},
		Exams:    protoExams,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	}, nil
}

// Helper functions

func convertTrendsToProto(trends []*analytics.PerformanceTrend) []*v1.PerformanceTrend {
	protoTrends := make([]*v1.PerformanceTrend, 0, len(trends))
	for _, trend := range trends {
		protoTrends = append(protoTrends, &v1.PerformanceTrend{
			Date:         trend.Date,
			AverageScore: trend.AverageScore,
			PassRate:     trend.PassRate,
			AttemptCount: int32(trend.AttemptCount),
		})
	}
	return protoTrends
}

func convertExamPerformanceToProto(exams []*analytics.ExamPerformance) []*v1.ExamPerformance {
	protoExams := make([]*v1.ExamPerformance, 0, len(exams))
	for _, exam := range exams {
		protoExams = append(protoExams, &v1.ExamPerformance{
			ExamId:       exam.ExamID,
			ExamTitle:    exam.ExamTitle,
			AttemptCount: int32(exam.AttemptCount),
			AverageScore: exam.AverageScore,
			PassRate:     exam.PassRate,
		})
	}
	return protoExams
}


