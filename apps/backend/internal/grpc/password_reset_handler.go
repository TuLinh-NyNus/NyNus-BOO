package grpc

import (
	"context"
	"log"

	"golang.org/x/crypto/bcrypt"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"exam-bank-system/apps/backend/internal/repository"
	"exam-bank-system/apps/backend/internal/service/user/session"
	"exam-bank-system/apps/backend/internal/services/email"
)

// PasswordResetHandler handles password reset business logic
// Xá»­ lÃ½ logic reset password vá»›i email verification
type PasswordResetHandler struct {
	userRepo       repository.IUserRepository
	emailService   *email.EmailService
	sessionService *session.SessionService
	bcryptCost     int
}

// NewPasswordResetHandler creates a new PasswordResetHandler instance
// Táº¡o instance má»›i cá»§a PasswordResetHandler vá»›i cÃ¡c dependencies cáº§n thiáº¿t
func NewPasswordResetHandler(
	userRepo repository.IUserRepository,
	emailService *email.EmailService,
	sessionService *session.SessionService,
	bcryptCost int,
) *PasswordResetHandler {
	// Ensure bcrypt cost is secure
	if bcryptCost < MinBcryptCost {
		bcryptCost = DefaultBcryptCost
	}

	return &PasswordResetHandler{
		userRepo:       userRepo,
		emailService:   emailService,
		sessionService: sessionService,
		bcryptCost:     bcryptCost,
	}
}

// InitiatePasswordReset initiates password reset process
// Báº¯t Ä‘áº§u quÃ¡ trÃ¬nh reset password báº±ng cÃ¡ch gá»­i email vá»›i reset token
//
// Parameters:
//   - ctx: Context for cancellation and timeout
//   - email: User email address
//
// Returns:
//   - error: Error if initiation fails (always returns nil for security)
//
// Note: LuÃ´n tráº£ vá» success Ä‘á»ƒ khÃ´ng tiáº¿t lá»™ thÃ´ng tin user cÃ³ tá»“n táº¡i hay khÃ´ng
func (h *PasswordResetHandler) InitiatePasswordReset(ctx context.Context, email string) error {
	// Check if user exists
	user, err := h.userRepo.GetByEmail(ctx, email)
	if err != nil {
		// Don't reveal if email exists or not - return success anyway
		log.Printf("Password reset requested for non-existent email: %s", email)
		return nil
	}

	// Generate reset token (valid for 1 hour)
	resetToken, err := h.sessionService.GeneratePasswordResetToken(ctx, user.ID)
	if err != nil {
		log.Printf("Failed to generate reset token for user %s: %v", user.Email, err)
		// Still return nil to not reveal user existence
		return nil
	}

	// Send reset email
	if h.emailService != nil {
		userName := user.FirstName + " " + user.LastName
		if err := h.emailService.SendPasswordResetEmail(user.Email, userName, resetToken); err != nil {
			log.Printf("Failed to send reset email to %s: %v", user.Email, err)
			// Still return nil to not reveal user existence
			return nil
		}
		log.Printf("Password reset email sent successfully to %s", user.Email)
	}

	return nil
}

// VerifyResetToken verifies password reset token and returns user ID
// XÃ¡c thá»±c reset token vÃ  tráº£ vá» user ID
//
// Parameters:
//   - ctx: Context for cancellation and timeout
//   - token: Password reset token
//
// Returns:
//   - string: User ID if token is valid
//   - error: Error if token is invalid or expired
func (h *PasswordResetHandler) VerifyResetToken(ctx context.Context, token string) (string, error) {
	userID, err := h.sessionService.VerifyPasswordResetToken(ctx, token)
	if err != nil {
		return "", status.Errorf(codes.InvalidArgument, ErrInvalidResetToken)
	}

	return userID, nil
}

// ResetPassword resets user password with token
// Reset password cá»§a user báº±ng token vÃ  password má»›i
//
// Parameters:
//   - ctx: Context for cancellation and timeout
//   - token: Password reset token
//   - newPassword: New password (plain text, will be hashed)
//
// Returns:
//   - error: Error if reset fails
func (h *PasswordResetHandler) ResetPassword(ctx context.Context, token, newPassword string) error {
	// Verify reset token and get user ID
	userID, err := h.VerifyResetToken(ctx, token)
	if err != nil {
		return err
	}

	// Get user
	user, err := h.userRepo.GetByID(ctx, userID)
	if err != nil {
		return status.Errorf(codes.NotFound, ErrUserNotFound)
	}

	// Hash new password with configurable cost
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), h.bcryptCost)
	if err != nil {
		return status.Errorf(codes.Internal, ErrPasswordHashFailed, err)
	}

	// Update password
	user.PasswordHash = string(hashedPassword)
	if err := h.userRepo.Update(ctx, user); err != nil {
		return status.Errorf(codes.Internal, ErrUserUpdateFailed, err)
	}

	// Invalidate all existing sessions for security
	if err := h.sessionService.InvalidateAllUserSessions(ctx, userID); err != nil {
		log.Printf("Failed to invalidate sessions for user %s: %v", userID, err)
		// Don't fail the password reset if session invalidation fails
	}

	log.Printf("Password reset successfully for user %s", user.Email)
	return nil
}

// ChangePassword changes user password (for authenticated users)
// Äá»•i password cho user Ä‘Ã£ Ä‘Äƒng nháº­p (yÃªu cáº§u password cÅ©)
//
// Parameters:
//   - ctx: Context for cancellation and timeout
//   - userID: User ID
//   - oldPassword: Current password (for verification)
//   - newPassword: New password (plain text, will be hashed)
//
// Returns:
//   - error: Error if change fails
func (h *PasswordResetHandler) ChangePassword(ctx context.Context, userID, oldPassword, newPassword string) error {
	// Get user
	user, err := h.userRepo.GetByID(ctx, userID)
	if err != nil {
		return status.Errorf(codes.NotFound, ErrUserNotFound)
	}

	// Verify old password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(oldPassword)); err != nil {
		return status.Errorf(codes.Unauthenticated, "current password is incorrect")
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), h.bcryptCost)
	if err != nil {
		return status.Errorf(codes.Internal, ErrPasswordHashFailed, err)
	}

	// Update password
	user.PasswordHash = string(hashedPassword)
	if err := h.userRepo.Update(ctx, user); err != nil {
		return status.Errorf(codes.Internal, ErrUserUpdateFailed, err)
	}

	// Invalidate all existing sessions except current one for security
	if err := h.sessionService.InvalidateAllUserSessions(ctx, userID); err != nil {
		log.Printf("Failed to invalidate sessions for user %s: %v", userID, err)
	}

	log.Printf("Password changed successfully for user %s", user.Email)
	return nil
}
