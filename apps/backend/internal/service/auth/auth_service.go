package auth

import (
	"context"
	"fmt"
	"time"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/constant"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/database"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/repository"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/service/notification"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/util"

	"github.com/jackc/pgtype"
	"golang.org/x/crypto/bcrypt"
)

// DEPRECATED: AuthService is being phased out in favor of EnhancedUserServiceServer
// All authentication functionality has been consolidated into the gRPC service layer
// This service is kept temporarily for backward compatibility during migration
//
// Migration Status:
// - Account locking logic: ✅ MIGRATED to EnhancedUserServiceServer.Login()
// - Login attempts tracking: ✅ MIGRATED to EnhancedUserServiceServer.Login()
// - Bcrypt cost configuration: ✅ MIGRATED to EnhancedUserServiceServer
// - JWT token generation: ✅ MIGRATED to UnifiedJWTService
//
// TODO: Remove this service completely after all references are updated
type AuthService struct {
	userRepo interface {
		Create(ctx context.Context, db database.QueryExecer, user *entity.User) error
		GetByEmail(email string, db database.QueryExecer) (*entity.User, error)
		GetByID(ctx context.Context, db database.QueryExecer, id string) (user entity.User, err error)
	}
	// Enhanced user repo interface for login tracking
	enhancedUserRepo interface {
		GetByEmail(ctx context.Context, email string) (*repository.User, error)
		IncrementLoginAttempts(ctx context.Context, userID string) error
		ResetLoginAttempts(ctx context.Context, userID string) error
		LockAccount(ctx context.Context, userID string, until time.Time) error
		UpdateLastLogin(ctx context.Context, userID, ipAddress string) error
	}
	preferenceRepo      repository.UserPreferenceRepository
	notificationService *notification.NotificationService
	jwtService          IJWTService // REFACTORED: Use IJWTService interface instead of concrete type
	bcryptCost          int         // Configurable bcrypt cost for password hashing
}

// Claims represents JWT token claims (DEPRECATED: Use UnifiedClaims instead)
// Kept for backward compatibility
type Claims = UnifiedClaims

// NewAuthService creates a new auth service with dependency injection (DEPRECATED)
// Use NewAuthServiceWithJWT instead
func NewAuthService(jwtSecret string) *AuthService {
	// Create a basic UnifiedJWTService for backward compatibility
	unifiedJWT, err := NewUnifiedJWTService(jwtSecret, nil, nil)
	if err != nil {
		panic(fmt.Sprintf("Failed to create JWT service: %v", err))
	}
	return &AuthService{
		userRepo:       &repository.UserRepository{},
		preferenceRepo: repository.NewUserPreferenceRepository(nil), // Will be properly injected from container
		jwtService:     unifiedJWT,
		bcryptCost:     12, // Default to secure cost
	}
}

// NewAuthServiceWithJWT creates a new auth service with IJWTService
func NewAuthServiceWithJWT(jwtService IJWTService) *AuthService {
	return &AuthService{
		userRepo:       &repository.UserRepository{},
		preferenceRepo: repository.NewUserPreferenceRepository(nil), // Will be properly injected from container
		jwtService:     jwtService,
		bcryptCost:     12, // Default to secure cost
	}
}

// NewEnhancedAuthService creates auth service with enhanced user repository
func NewEnhancedAuthService(
	enhancedUserRepo repository.IUserRepository,
	preferenceRepo repository.UserPreferenceRepository,
	notificationService *notification.NotificationService,
	jwtService IJWTService,
	bcryptCost int,
) *AuthService {
	if bcryptCost < 10 {
		bcryptCost = 12 // Minimum secure cost
	}
	return &AuthService{
		userRepo:            &repository.UserRepository{},
		enhancedUserRepo:    enhancedUserRepo,
		preferenceRepo:      preferenceRepo,
		notificationService: notificationService,
		jwtService:          jwtService,
		bcryptCost:          bcryptCost,
	}
}

// Login authenticates a user and returns a JWT token with enhanced security
func (s *AuthService) Login(db database.QueryExecer, email, password string) (*entity.User, string, error) {
	// Get user by email
	user, err := s.userRepo.GetByEmail(email, db)
	if err != nil {
		return nil, "", fmt.Errorf("invalid credentials")
	}

	userID := util.PgTextToString(user.ID)
	ctx := context.Background()

	// Check if account is locked (if enhanced repo is available)
	if s.enhancedUserRepo != nil {
		enhancedUser, err := s.enhancedUserRepo.GetByEmail(ctx, email)
		if err == nil && enhancedUser.LockedUntil != nil && enhancedUser.LockedUntil.After(time.Now()) {
			return nil, "", fmt.Errorf("account is locked until %v", enhancedUser.LockedUntil.Format("2006-01-02 15:04:05"))
		}
	}

	// Check password
	passwordHash := util.PgTextToString(user.PasswordHash)
	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(password)); err != nil {
		// Password is wrong - increment login attempts
		if s.enhancedUserRepo != nil {
			if incrementErr := s.enhancedUserRepo.IncrementLoginAttempts(ctx, userID); incrementErr != nil {
				fmt.Printf("Failed to increment login attempts: %v\n", incrementErr)
			}

			// Check if we need to lock account (after 5 failed attempts)
			enhancedUser, getErr := s.enhancedUserRepo.GetByEmail(ctx, email)
			if getErr == nil && enhancedUser.LoginAttempts >= 5 {
				// Lock account for 30 minutes
				lockUntil := time.Now().Add(30 * time.Minute)
				if lockErr := s.enhancedUserRepo.LockAccount(ctx, userID, lockUntil); lockErr != nil {
					fmt.Printf("Failed to lock account: %v\n", lockErr)
				}

				// Send account locked notification
				if s.notificationService != nil {
					title := "Tài khoản bị khóa do đăng nhập sai quá nhiều lần"
					message := "Tài khoản của bạn đã bị khóa trong 30 phút do đăng nhập sai 5 lần liên tiếp. Nếu không phải bạn, vui lòng đổi mật khẩu ngay khi tài khoản được mở khóa."
					if err := s.notificationService.CreateSecurityAlert(ctx, userID, title, message, "", ""); err != nil {
						fmt.Printf("Failed to send account lock notification: %v\n", err)
					}
				}

				return nil, "", fmt.Errorf("account has been locked due to too many failed login attempts. Try again after 30 minutes")
			}
		}
		return nil, "", fmt.Errorf("invalid credentials")
	}

	// Check if user is active
	if !util.PgBoolToBool(user.IsActive) {
		return nil, "", fmt.Errorf("account is disabled")
	}

	// Password is correct - reset login attempts and update last login
	if s.enhancedUserRepo != nil {
		if resetErr := s.enhancedUserRepo.ResetLoginAttempts(ctx, userID); resetErr != nil {
			fmt.Printf("Failed to reset login attempts: %v\n", resetErr)
		}
		// Note: IP address will be updated in OAuth service or calling service
	}

	// Generate JWT token using IJWTService
	token, err := s.jwtService.GenerateToken(user)
	if err != nil {
		return nil, "", fmt.Errorf("failed to generate token: %w", err)
	}

	return user, token, nil
}

// getBcryptCost returns the configured bcrypt cost with fallback to secure default
func (s *AuthService) getBcryptCost() int {
	if s.bcryptCost < 10 {
		return 12 // Secure default if not configured properly
	}
	return s.bcryptCost
}

// Register creates a new user account
func (s *AuthService) Register(db database.QueryExecer, email, password, firstName, lastName string) (*entity.User, error) {
	// Check if user already exists
	existingUser, _ := s.userRepo.GetByEmail(email, db)
	if existingUser != nil {
		return nil, fmt.Errorf("user already exists")
	}

	// Hash password with configurable cost (default 12 for better security)
	bcryptCost := s.getBcryptCost()
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcryptCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Create user entity với enhanced fields (default role là STUDENT theo thiết kế)
	user := &entity.User{
		// Core required fields
		Email:        util.StringToPgText(email),
		PasswordHash: util.StringToPgText(string(hashedPassword)),
		FirstName:    util.StringToPgText(firstName),
		LastName:     util.StringToPgText(lastName),
		Role:         util.StringToPgText(constant.RoleStudent), // Sử dụng constant
		IsActive:     util.BoolToPgBool(true),
		// Enhanced fields với defaults theo thiết kế
		Status:                util.StringToPgText("ACTIVE"),
		EmailVerified:         util.BoolToPgBool(false),                                       // Mới đăng ký chưa verify
		MaxConcurrentSessions: func() pgtype.Int4 { var i pgtype.Int4; i.Set(3); return i }(), // Default 3 sessions
		LoginAttempts:         func() pgtype.Int4 { var i pgtype.Int4; i.Set(0); return i }(), // Reset login attempts
		// Optional fields - để trống, sẽ cập nhật sau
		// GoogleID, Username, Avatar, Bio, Phone, Address, School, DateOfBirth, Gender, Level
		// LastLoginAt, LastLoginIP, LockedUntil
	}

	// Save to database
	ctx := context.Background()
	if err := s.userRepo.Create(ctx, db, user); err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// Create default user preferences
	userID := util.PgTextToString(user.ID)
	if s.preferenceRepo != nil {
		defaultPreferences := &repository.UserPreference{
			ID:                  repository.GenerateID(),
			UserID:              userID,
			EmailNotifications:  true,  // Enable by default
			PushNotifications:   true,  // Enable by default
			SmsNotifications:    false, // Disable SMS by default
			AutoPlayVideos:      true,
			DefaultVideoQuality: "720p",
			PlaybackSpeed:       1.0,
			ProfileVisibility:   "PUBLIC",
			ShowOnlineStatus:    true,
			AllowDirectMessages: true,
			Timezone:            "Asia/Ho_Chi_Minh",
			Language:            "vi",
			DateFormat:          "DD/MM/YYYY",
			TimeFormat:          "24h",
			Theme:               "light",
			FontSize:            "medium",
			HighContrast:        false,
			ReducedMotion:       false,
			ScreenReaderMode:    false,
			KeyboardShortcuts:   true,
			TwoFactorEnabled:    false,
			LoginAlerts:         true,  // Important security feature
			MarketingEmails:     false, // Respect privacy by default
			ProductUpdates:      true,
			SecurityAlerts:      true, // Critical security notifications
			WeeklyDigest:        false,
		}

		if err := s.preferenceRepo.Create(ctx, defaultPreferences); err != nil {
			// Log error but don't fail registration
			fmt.Printf("Warning: Failed to create user preferences: %v\n", err)
		}
	}

	// Send welcome notification if service available
	if s.notificationService != nil && s.preferenceRepo != nil {
		// Check if user wants email notifications before sending
		if pref, err := s.preferenceRepo.GetByUserID(ctx, userID); err == nil && pref.EmailNotifications {
			title := "Chào mừng bạn đến với Exam Bank System!"
			message := fmt.Sprintf("Xin chào %s %s! Cảm ơn bạn đã đăng ký tài khoản. Hãy bắt đầu khám phá kho đề thi của chúng tôi.", firstName, lastName)
			if err := s.notificationService.CreateNotification(ctx, userID, "WELCOME", title, message, nil, nil); err != nil {
				fmt.Printf("Failed to send welcome notification: %v\n", err)
			}
		}
	}

	return user, nil
}

// ValidateToken validates a JWT token and returns claims
func (s *AuthService) ValidateToken(tokenString string) (*UnifiedClaims, error) {
	return s.jwtService.ValidateToken(tokenString)
}

// IsAdmin checks if a user is an admin
func (s *AuthService) IsAdmin(db database.QueryExecer, userID string) (bool, error) {
	ctx := context.Background()
	user, err := s.userRepo.GetByID(ctx, db, userID)
	if err != nil {
		return false, err
	}
	role := util.PgTextToString(user.Role)
	return role == constant.RoleAdmin, nil
}

// IsTeacherOrAdmin checks if a user is a teacher or admin
func (s *AuthService) IsTeacherOrAdmin(db database.QueryExecer, userID string) (bool, error) {
	ctx := context.Background()
	user, err := s.userRepo.GetByID(ctx, db, userID)
	if err != nil {
		return false, err
	}
	role := util.PgTextToString(user.Role)
	return role == constant.RoleAdmin || role == constant.RoleTeacher, nil
}

// IsStudent checks if a user is a student
func (s *AuthService) IsStudent(db database.QueryExecer, userID string) (bool, error) {
	ctx := context.Background()
	user, err := s.userRepo.GetByID(ctx, db, userID)
	if err != nil {
		return false, err
	}
	role := util.PgTextToString(user.Role)
	return role == constant.RoleStudent, nil
}

// Enhanced role checking methods với 5 roles hierarchy
// IsTutorOrHigher kiểm tra nếu user là TUTOR hoặc cao hơn
func (s *AuthService) IsTutorOrHigher(db database.QueryExecer, userID string) (bool, error) {
	ctx := context.Background()
	user, err := s.userRepo.GetByID(ctx, db, userID)
	if err != nil {
		return false, err
	}
	role := util.PgTextToString(user.Role)
	return constant.GetRoleHierarchy(role) >= constant.GetRoleHierarchy(constant.RoleTutor), nil
}

// IsGuest kiểm tra nếu user là GUEST
func (s *AuthService) IsGuest(db database.QueryExecer, userID string) (bool, error) {
	ctx := context.Background()
	user, err := s.userRepo.GetByID(ctx, db, userID)
	if err != nil {
		return false, err
	}
	role := util.PgTextToString(user.Role)
	return role == constant.RoleGuest, nil
}

// HasRoleOrHigher kiểm tra nếu user có role bằng hoặc cao hơn required role
func (s *AuthService) HasRoleOrHigher(db database.QueryExecer, userID string, requiredRole string) (bool, error) {
	ctx := context.Background()
	user, err := s.userRepo.GetByID(ctx, db, userID)
	if err != nil {
		return false, err
	}
	userRole := util.PgTextToString(user.Role)
	return constant.GetRoleHierarchy(userRole) >= constant.GetRoleHierarchy(requiredRole), nil
}

// GetUserRole returns the role of a user
func (s *AuthService) GetUserRole(db database.QueryExecer, userID string) (string, error) {
	ctx := context.Background()
	user, err := s.userRepo.GetByID(ctx, db, userID)
	if err != nil {
		return "", err
	}
	return util.PgTextToString(user.Role), nil
}

// generateToken generates a JWT token for a user (DEPRECATED: Use IJWTService.GenerateToken instead)
// Kept for backward compatibility
func (s *AuthService) generateToken(user *entity.User) (string, error) {
	return s.jwtService.GenerateToken(user)
}
