package auth

import (
	"context"
	"fmt"
	"time"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/util"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// Service handles authentication business logic
type Service struct {
	repo      RepositoryInterface
	jwtSecret string
}

// Claims represents JWT token claims
type Claims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// NewService creates a new auth service
func NewService(repo RepositoryInterface, jwtSecret string) *Service {
	return &Service{
		repo:      repo,
		jwtSecret: jwtSecret,
	}
}

// Login authenticates a user and returns a JWT token
func (s *Service) Login(email, password string) (*entity.User, string, error) {
	// Get user by email
	user, err := s.repo.GetByEmail(email)
	if err != nil {
		return nil, "", fmt.Errorf("invalid credentials")
	}

	// Check password
	passwordHash := util.PgTextToString(user.PasswordHash)
	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(password)); err != nil {
		return nil, "", fmt.Errorf("invalid credentials")
	}

	// Check if user is active
	if !util.PgBoolToBool(user.IsActive) {
		return nil, "", fmt.Errorf("account is disabled")
	}

	// Generate JWT token
	token, err := s.generateToken(user)
	if err != nil {
		return nil, "", fmt.Errorf("failed to generate token: %w", err)
	}

	return user, token, nil
}

// Register creates a new user account
func (s *Service) Register(email, password, firstName, lastName string) (*entity.User, error) {
	// Check if user already exists
	existingUser, _ := s.repo.GetByEmail(email)
	if existingUser != nil {
		return nil, fmt.Errorf("user already exists")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Create user entity (default role is student)
	user := &entity.User{
		Email:        util.StringToPgText(email),
		PasswordHash: util.StringToPgText(string(hashedPassword)),
		FirstName:    util.StringToPgText(firstName),
		LastName:     util.StringToPgText(lastName),
		Role:         util.StringToPgText("student"), // Default role
		IsActive:     util.BoolToPgBool(true),
	}

	// Save to database
	ctx := context.Background()
	if err := s.repo.Create(ctx, user); err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return user, nil
}

// ValidateToken validates a JWT token and returns claims
func (s *Service) ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(s.jwtSecret), nil
	})

	if err != nil {
		return nil, fmt.Errorf("invalid token: %w", err)
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, fmt.Errorf("invalid token claims")
}

// IsAdmin checks if a user is an admin
func (s *Service) IsAdmin(userID string) (bool, error) {
	ctx := context.Background()
	user, err := s.repo.GetByID(ctx, userID)
	if err != nil {
		return false, err
	}
	role := util.PgTextToString(user.Role)
	return role == "admin", nil
}

// IsTeacherOrAdmin checks if a user is a teacher or admin
func (s *Service) IsTeacherOrAdmin(userID string) (bool, error) {
	ctx := context.Background()
	user, err := s.repo.GetByID(ctx, userID)
	if err != nil {
		return false, err
	}
	role := util.PgTextToString(user.Role)
	return role == "admin" || role == "teacher", nil
}

// IsStudent checks if a user is a student
func (s *Service) IsStudent(userID string) (bool, error) {
	ctx := context.Background()
	user, err := s.repo.GetByID(ctx, userID)
	if err != nil {
		return false, err
	}
	role := util.PgTextToString(user.Role)
	return role == "student", nil
}

// GetUserRole returns the role of a user
func (s *Service) GetUserRole(userID string) (string, error) {
	ctx := context.Background()
	user, err := s.repo.GetByID(ctx, userID)
	if err != nil {
		return "", err
	}
	return util.PgTextToString(user.Role), nil
}

// generateToken generates a JWT token for a user
func (s *Service) generateToken(user *entity.User) (string, error) {
	userID := util.PgTextToString(user.ID)
	email := util.PgTextToString(user.Email)
	role := util.PgTextToString(user.Role)

	claims := &Claims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "exam-bank-system",
			Subject:   userID,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}
