package grpc

import (
	"context"
	"fmt"
	"log"

	"golang.org/x/crypto/bcrypt"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"exam-bank-system/apps/backend/internal/repository"
	"exam-bank-system/apps/backend/internal/service/user/session"
	"exam-bank-system/apps/backend/internal/services/email"
	"exam-bank-system/apps/backend/pkg/proto/common"
	v1 "exam-bank-system/apps/backend/pkg/proto/v1"
)

// RegistrationHandler handles user registration business logic
// Xá»­ lÃ½ logic Ä‘Äƒng kÃ½ user má»›i vá»›i email verification
type RegistrationHandler struct {
	userRepo       repository.IUserRepository
	emailService   *email.EmailService
	sessionService *session.SessionService
	bcryptCost     int
}

// NewRegistrationHandler creates a new RegistrationHandler instance
// Táº¡o instance má»›i cá»§a RegistrationHandler vá»›i cÃ¡c dependencies cáº§n thiáº¿t
func NewRegistrationHandler(
	userRepo repository.IUserRepository,
	emailService *email.EmailService,
	sessionService *session.SessionService,
	bcryptCost int,
) *RegistrationHandler {
	// Ensure bcrypt cost is secure
	if bcryptCost < MinBcryptCost {
		bcryptCost = DefaultBcryptCost
	}

	return &RegistrationHandler{
		userRepo:       userRepo,
		emailService:   emailService,
		sessionService: sessionService,
		bcryptCost:     bcryptCost,
	}
}

// ValidateRegistration validates registration request
// Kiá»ƒm tra tÃ­nh há»£p lá»‡ cá»§a yÃªu cáº§u Ä‘Äƒng kÃ½ (email chÆ°a tá»“n táº¡i)
//
// Parameters:
//   - ctx: Context for cancellation and timeout
//   - email: Email address to validate
//
// Returns:
//   - error: Error if validation fails
func (h *RegistrationHandler) ValidateRegistration(ctx context.Context, email string) error {
	// Check if user already exists
	existing, _ := h.userRepo.GetByEmail(ctx, email)
	if existing != nil {
		return status.Errorf(codes.AlreadyExists, ErrEmailAlreadyExists)
	}

	return nil
}

// CreateUser creates a new user with hashed password
// Táº¡o user má»›i vá»›i password Ä‘Ã£ Ä‘Æ°á»£c hash
//
// Parameters:
//   - ctx: Context for cancellation and timeout
//   - req: Registration request with user information
//
// Returns:
//   - *repository.User: Created user entity
//   - error: Error if creation fails
func (h *RegistrationHandler) CreateUser(ctx context.Context, req *v1.RegisterRequest) (*repository.User, error) {
	// Hash password with configurable cost
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), h.bcryptCost)
	if err != nil {
		return nil, status.Errorf(codes.Internal, ErrPasswordHashFailed, err)
	}

	// Create new user entity
	newUser := &repository.User{
		Email:                 req.Email,
		PasswordHash:          string(hashedPassword),
		FirstName:             req.FirstName,
		LastName:              req.LastName,
		Role:                  common.UserRole_USER_ROLE_STUDENT, // Default role
		Status:                StatusActive,                      // Set to ACTIVE for testing
		Level:                 DefaultStudentLevel,               // Start at level 1 for STUDENT
		EmailVerified:         true,                              // Set to true for testing
		MaxConcurrentSessions: DefaultConcurrentSessions,         // Default 3 devices
		IsActive:              true,                              // Set to active
	}

	// Create user in database
	if err := h.userRepo.Create(ctx, newUser); err != nil {
		return nil, status.Errorf(codes.Internal, ErrUserCreationFailed, err)
	}

	// Get the created user to have all fields populated
	createdUser, err := h.userRepo.GetByEmail(ctx, newUser.Email)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to get created user: %v", err)
	}

	return createdUser, nil
}

// SendVerificationEmail sends email verification to newly registered user
// Gá»­i email xÃ¡c thá»±c cho user má»›i Ä‘Äƒng kÃ½
//
// Parameters:
//   - ctx: Context for cancellation and timeout
//   - user: User entity to send verification email to
//
// Returns:
//   - error: Error if sending fails (non-critical, logged only)
func (h *RegistrationHandler) SendVerificationEmail(ctx context.Context, user *repository.User) error {
	// Skip if email service or session service is not available
	if h.emailService == nil || h.sessionService == nil {
		log.Printf("Email service or session service not available, skipping verification email")
		return nil
	}

	// Generate verification token
	token, err := h.sessionService.GenerateEmailVerificationToken(ctx, user.ID)
	if err != nil {
		log.Printf("Failed to generate verification token for user %s: %v", user.Email, err)
		return fmt.Errorf("failed to generate verification token: %w", err)
	}

	// Send verification email
	userName := user.FirstName + " " + user.LastName
	if err := h.emailService.SendVerificationEmail(user.Email, userName, token); err != nil {
		log.Printf("Failed to send verification email to %s: %v", user.Email, err)
		return fmt.Errorf("failed to send verification email: %w", err)
	}

	log.Printf("Verification email sent successfully to %s", user.Email)
	return nil
}

// ResendVerificationEmail resends verification email to user
// Gá»­i láº¡i email xÃ¡c thá»±c cho user
//
// Parameters:
//   - ctx: Context for cancellation and timeout
//   - userID: User ID to resend verification email to
//
// Returns:
//   - error: Error if resending fails
func (h *RegistrationHandler) ResendVerificationEmail(ctx context.Context, userID string) error {
	// Get user by ID
	user, err := h.userRepo.GetByID(ctx, userID)
	if err != nil {
		return status.Errorf(codes.NotFound, ErrUserNotFound)
	}

	// Check if already verified
	if user.EmailVerified {
		return status.Errorf(codes.FailedPrecondition, "email already verified")
	}

	// Send verification email
	return h.SendVerificationEmail(ctx, user)
}

// VerifyEmail verifies user email with token
// XÃ¡c thá»±c email cá»§a user báº±ng token
//
// Parameters:
//   - ctx: Context for cancellation and timeout
//   - token: Email verification token
//
// Returns:
//   - error: Error if verification fails
func (h *RegistrationHandler) VerifyEmail(ctx context.Context, token string) error {
	// Verify token and get user ID
	userID, err := h.sessionService.VerifyEmailToken(ctx, token)
	if err != nil {
		return status.Errorf(codes.InvalidArgument, ErrInvalidToken)
	}

	// Get user
	user, err := h.userRepo.GetByID(ctx, userID)
	if err != nil {
		return status.Errorf(codes.NotFound, ErrUserNotFound)
	}

	// Update email_verified status
	user.EmailVerified = true
	if user.Status == StatusInactive {
		user.Status = StatusActive
	}

	// Save changes
	if err := h.userRepo.Update(ctx, user); err != nil {
		return status.Errorf(codes.Internal, ErrUserUpdateFailed, err)
	}

	log.Printf("Email verified successfully for user %s", user.Email)
	return nil
}

