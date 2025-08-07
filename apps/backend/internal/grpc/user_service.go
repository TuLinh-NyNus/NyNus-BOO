package grpc

import (
	"context"
	"fmt"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/middleware"
	auth_mgmt "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/auth"
	user_mgmt "github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/service_mgmt/user"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/util"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/common"
	v1 "github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/v1"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type UserServiceServer struct {
	v1.UnimplementedUserServiceServer
	userMgmt *user_mgmt.UserMgmt
	authMgmt *auth_mgmt.AuthMgmt
}

func NewUserServiceServer(userMgmt *user_mgmt.UserMgmt, authMgmt *auth_mgmt.AuthMgmt) *UserServiceServer {
	return &UserServiceServer{
		userMgmt: userMgmt,
		authMgmt: authMgmt,
	}
}

func (s *UserServiceServer) Register(ctx context.Context, req *v1.RegisterRequest) (*v1.RegisterResponse, error) {
	// Use auth management service to register user
	user, err := s.authMgmt.Register(req.Email, req.Password, req.FirstName, req.LastName)
	if err != nil {
		return &v1.RegisterResponse{
			Response: &common.Response{
				Success: false,
				Message: "Registration failed",
				Errors:  []string{err.Error()},
			},
		}, nil
	}

	// Convert to proto
	protoUser := convertUserToProto(user)

	return &v1.RegisterResponse{
		Response: &common.Response{
			Success: true,
			Message: "User registered successfully",
		},
		User: protoUser,
	}, nil
}

func (s *UserServiceServer) Login(ctx context.Context, req *v1.LoginRequest) (*v1.LoginResponse, error) {
	// Use auth management service to login
	user, token, err := s.authMgmt.Login(req.Email, req.Password)
	if err != nil {
		return &v1.LoginResponse{
			Response: &common.Response{
				Success: false,
				Message: "Login failed",
				Errors:  []string{err.Error()},
			},
		}, nil
	}

	// Convert to proto
	protoUser := convertUserToProto(user)

	return &v1.LoginResponse{
		Response: &common.Response{
			Success: true,
			Message: "Login successful",
		},
		AccessToken: token,
		User:        protoUser,
	}, nil
}

func (s *UserServiceServer) GetUser(ctx context.Context, req *v1.GetUserRequest) (*v1.GetUserResponse, error) {
	if req.Id == "" {
		return &v1.GetUserResponse{
			Response: &common.Response{
				Success: false,
				Message: "User ID is required",
				Errors:  []string{"id field is required"},
			},
		}, nil
	}

	// Get requestor user ID from context
	_, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
	}

	// Call UserMgmt to get user by ID
	user, err := s.userMgmt.GetUser(ctx, req.GetId())
	if err != nil {
		return &v1.GetUserResponse{
			Response: &common.Response{
				Success: false,
				Message: "Failed to get user",
				Errors:  []string{err.Error()},
			},
		}, nil
	}

	// Convert entity to proto
	protoUser := convertUserToProto(&user)

	return &v1.GetUserResponse{
		Response: &common.Response{
			Success: true,
			Message: "User retrieved successfully",
		},
		User: protoUser,
	}, nil
}

func (s *UserServiceServer) ListUsers(ctx context.Context, req *v1.ListUsersRequest) (*v1.ListUsersResponse, error) {
	// Get requestor user ID from context
	_, err := middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
	}

	// Extract pagination parameters
	page := req.GetPagination().GetPage()
	limit := req.GetPagination().GetLimit()

	// Set default values if not provided
	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}

	// Calculate offset from page and limit
	offset := int(page-1) * int(limit)

	// Call UserMgmt to get users list with paging
	total, users, err := s.userMgmt.ListUsers(offset, int(limit))
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get users list: %v", err)
	}

	// Convert entities to proto
	var protoUsers []*v1.User
	for _, user := range users {
		protoUser := convertUserToProto(&user)
		protoUsers = append(protoUsers, protoUser)
	}

	// Calculate total pages
	totalPages := int32((total + int(limit) - 1) / int(limit))

	pagination := &common.PaginationResponse{
		Page:       page,
		Limit:      limit,
		TotalCount: int32(total),
		TotalPages: totalPages,
	}

	return &v1.ListUsersResponse{
		Response: &common.Response{
			Success: true,
			Message: fmt.Sprintf("Retrieved %d users", len(protoUsers)),
		},
		Users:      protoUsers,
		Pagination: pagination,
	}, nil
}

func convertUserToProto(user *entity.User) *v1.User {
	return &v1.User{
		Id:        util.PgTextToString(user.ID),
		Email:     util.PgTextToString(user.Email),
		FirstName: util.PgTextToString(user.FirstName),
		LastName:  util.PgTextToString(user.LastName),
		Role:      convertRoleToProto(util.PgTextToString(user.Role)),
		IsActive:  util.PgBoolToBool(user.IsActive),
	}
}

func convertRoleToProto(role string) common.UserRole {
	switch role {
	case "admin":
		return common.UserRole_USER_ROLE_ADMIN
	case "teacher":
		return common.UserRole_USER_ROLE_TEACHER
	case "student":
		return common.UserRole_USER_ROLE_STUDENT
	default:
		return common.UserRole_USER_ROLE_UNSPECIFIED
	}
}

func (s *UserServiceServer) GetStudentList(ctx context.Context, req *v1.GetStudentListRequest) (res *v1.GetStudentListResponse, err error) {
	// Get requestor user ID from context for authorization
	_, err = middleware.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get user from context: %v", err)
	}

	// Extract pagination parameters
	page := req.GetPagination().GetPage()
	limit := req.GetPagination().GetLimit()

	// Set default values if not provided
	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}

	// Calculate offset from page and limit
	offset := int(page-1) * int(limit)

	// Call UserMgmt to get student list with paging
	total, users, err := s.userMgmt.GetStudentByPaging(offset, int(limit))
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get student list: %v", err)
	}

	// Convert entities to proto
	var protoUsers []*v1.User
	for _, user := range users {
		protoUser := convertUserToProto(&user)
		protoUsers = append(protoUsers, protoUser)
	}

	// Calculate total pages
	totalPages := int32((total + int(limit) - 1) / int(limit))

	return &v1.GetStudentListResponse{
		Users: protoUsers,
		Pagination: &common.PaginationResponse{
			Page:       page,
			Limit:      limit,
			TotalCount: int32(total),
			TotalPages: totalPages,
		},
	}, nil
}
