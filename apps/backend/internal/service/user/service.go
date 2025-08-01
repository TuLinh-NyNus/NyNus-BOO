package user

import (
	"context"
	"fmt"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/auth"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/util"
)

// Service handles user business logic
type Service struct {
	repo        RepositoryInterface
	authService auth.ServiceInterface
}

// NewService creates a new user service
func NewService(repo RepositoryInterface, authService auth.ServiceInterface) *Service {
	return &Service{
		repo:        repo,
		authService: authService,
	}
}

// GetAll returns all users (admin/teacher only)
func (s *Service) GetAll(requestorUserID string) ([]entity.User, error) {
	// Check if requestor has permission
	isAuthorized, err := s.authService.IsTeacherOrAdmin(requestorUserID)
	if err != nil {
		return nil, fmt.Errorf("failed to check authorization: %w", err)
	}
	if !isAuthorized {
		return nil, fmt.Errorf("insufficient permissions: only teachers and admins can list users")
	}

	return s.repo.GetAll()
}

// GetByID returns a user by ID with authorization checks
func (s *Service) GetByID(userID string, requestorUserID string) (*entity.User, error) {
	ctx := context.Background()

	// Users can access their own profile
	if userID == requestorUserID {
		return s.repo.GetByID(ctx, userID)
	}

	// Check if requestor is admin or teacher
	isAuthorized, err := s.authService.IsTeacherOrAdmin(requestorUserID)
	if err != nil {
		return nil, fmt.Errorf("failed to check authorization: %w", err)
	}
	if !isAuthorized {
		return nil, fmt.Errorf("insufficient permissions: can only access your own profile")
	}

	return s.repo.GetByID(ctx, userID)
}

// Create creates a new user with role validation
func (s *Service) Create(req CreateRequest, requestorUserID string) (*entity.User, error) {
	// Validate input
	if req.Email == "" || req.Password == "" || req.FirstName == "" || req.LastName == "" {
		return nil, fmt.Errorf("email, password, first_name, and last_name are required")
	}

	// Check if requestor is admin (only admins can create users with roles)
	if req.Role != "" && req.Role != "student" {
		isAdmin, err := s.authService.IsAdmin(requestorUserID)
		if err != nil {
			return nil, fmt.Errorf("failed to check authorization: %w", err)
		}
		if !isAdmin {
			return nil, fmt.Errorf("insufficient permissions: only admins can assign non-student roles")
		}
	}

	// Set default role if not specified
	if req.Role == "" {
		req.Role = "student"
	}

	// Validate role
	if !isValidRole(req.Role) {
		return nil, fmt.Errorf("invalid role: must be one of 'student', 'teacher', 'admin'")
	}

	// Use auth service to register user
	user, err := s.authService.Register(req.Email, req.Password, req.FirstName, req.LastName)
	if err != nil {
		return nil, err
	}

	// Update role if different from default
	if req.Role != "student" {
		ctx := context.Background()
		user.Role = util.StringToPgText(req.Role)
		if err := s.repo.Update(ctx, user); err != nil {
			return nil, fmt.Errorf("failed to update user role: %w", err)
		}
	}

	return user, nil
}

// Update updates a user with authorization checks
func (s *Service) Update(userID string, req UpdateRequest, requestorUserID string) (*entity.User, error) {
	ctx := context.Background()

	// Get the user to update
	user, err := s.repo.GetByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	// Check permissions
	canUpdate := false
	isAdmin := false

	if userID == requestorUserID {
		canUpdate = true // Users can update their own profile
	} else {
		// Check if requestor is admin
		isAdmin, err = s.authService.IsAdmin(requestorUserID)
		if err != nil {
			return nil, fmt.Errorf("failed to check authorization: %w", err)
		}
		canUpdate = isAdmin
	}

	if !canUpdate {
		return nil, fmt.Errorf("insufficient permissions: can only update your own profile")
	}

	// Update fields
	if req.FirstName != nil {
		user.FirstName = util.StringToPgText(*req.FirstName)
	}
	if req.LastName != nil {
		user.LastName = util.StringToPgText(*req.LastName)
	}

	// Only admins can update role and active status
	if req.Role != nil {
		if !isAdmin {
			return nil, fmt.Errorf("insufficient permissions: only admins can change user roles")
		}
		if !isValidRole(*req.Role) {
			return nil, fmt.Errorf("invalid role: must be one of 'student', 'teacher', 'admin'")
		}
		user.Role = util.StringToPgText(*req.Role)
	}

	if req.IsActive != nil {
		if !isAdmin {
			return nil, fmt.Errorf("insufficient permissions: only admins can change user active status")
		}
		user.IsActive = util.BoolToPgBool(*req.IsActive)
	}

	// Save changes
	if err := s.repo.Update(ctx, user); err != nil {
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	return user, nil
}

// Delete deletes a user (admin only)
func (s *Service) Delete(userID string, requestorUserID string) error {
	ctx := context.Background()

	// Check if requestor is admin
	isAdmin, err := s.authService.IsAdmin(requestorUserID)
	if err != nil {
		return fmt.Errorf("failed to check authorization: %w", err)
	}
	if !isAdmin {
		return fmt.Errorf("insufficient permissions: only admins can delete users")
	}

	// Prevent self-deletion
	if userID == requestorUserID {
		return fmt.Errorf("cannot delete your own account")
	}

	return s.repo.Delete(ctx, userID)
}

// GetProfile returns the current user's profile
func (s *Service) GetProfile(userID string) (*entity.User, error) {
	ctx := context.Background()
	return s.repo.GetByID(ctx, userID)
}

// GetUsersByRole returns users by role (admin/teacher only)
func (s *Service) GetUsersByRole(role string, requestorUserID string) ([]entity.User, error) {
	// Check if requestor has permission
	isAuthorized, err := s.authService.IsTeacherOrAdmin(requestorUserID)
	if err != nil {
		return nil, fmt.Errorf("failed to check authorization: %w", err)
	}
	if !isAuthorized {
		return nil, fmt.Errorf("insufficient permissions: only teachers and admins can list users by role")
	}

	if !isValidRole(role) {
		return nil, fmt.Errorf("invalid role: must be one of 'student', 'teacher', 'admin'")
	}

	return s.repo.GetByRole(role)
}

// ValidateUserExists checks if a user exists (for internal service use)
func (s *Service) ValidateUserExists(userID string) (bool, error) {
	ctx := context.Background()
	_, err := s.repo.GetByID(ctx, userID)
	if err != nil {
		return false, nil // User doesn't exist
	}
	return true, nil
}

// GetUserBasicInfo returns basic user info without authorization checks
// This is for internal service-to-service communication
func (s *Service) GetUserBasicInfo(userID string) (*entity.User, error) {
	ctx := context.Background()
	return s.repo.GetByID(ctx, userID)
}

func isValidRole(role string) bool {
	validRoles := map[string]bool{
		"student": true,
		"teacher": true,
		"admin":   true,
	}
	return validRoles[role]
}
