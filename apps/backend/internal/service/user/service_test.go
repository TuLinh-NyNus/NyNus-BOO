package user

import (
	"testing"

	"exam-bank-system/backend/internal/entity"
	"exam-bank-system/backend/internal/service/auth"
)

// MockRepository implements RepositoryInterface for testing
type MockRepository struct {
	users map[string]*entity.User
}

func NewMockRepository() *MockRepository {
	return &MockRepository{
		users: make(map[string]*entity.User),
	}
}

func (m *MockRepository) GetAll() ([]entity.User, error) {
	var users []entity.User
	for _, user := range m.users {
		users = append(users, *user)
	}
	return users, nil
}

func (m *MockRepository) GetByID(id string) (*entity.User, error) {
	if user, exists := m.users[id]; exists {
		return user, nil
	}
	return nil, &entity.ErrNotFound{Resource: "user", ID: id}
}

func (m *MockRepository) GetByEmail(email string) (*entity.User, error) {
	for _, user := range m.users {
		if user.Email == email {
			return user, nil
		}
	}
	return nil, &entity.ErrNotFound{Resource: "user"}
}

func (m *MockRepository) Create(user *entity.User) error {
	if user.ID == "" {
		user.ID = "test-id-" + user.Email
	}
	m.users[user.ID] = user
	return nil
}

func (m *MockRepository) Update(user *entity.User) error {
	if _, exists := m.users[user.ID]; !exists {
		return &entity.ErrNotFound{Resource: "user", ID: user.ID}
	}
	m.users[user.ID] = user
	return nil
}

func (m *MockRepository) Delete(id string) error {
	if _, exists := m.users[id]; !exists {
		return &entity.ErrNotFound{Resource: "user", ID: id}
	}
	delete(m.users, id)
	return nil
}

// MockAuthService implements auth.ServiceInterface for testing
type MockAuthService struct{}

func (m *MockAuthService) Login(email, password string) (*entity.User, string, error) {
	return &entity.User{ID: "test-user", Email: email}, "mock-token", nil
}

func (m *MockAuthService) Register(email, password, firstName, lastName string) (*entity.User, error) {
	return &entity.User{
		ID:        "test-user-" + email,
		Email:     email,
		FirstName: firstName,
		LastName:  lastName,
		Role:      "student",
		IsActive:  true,
	}, nil
}

func (m *MockAuthService) ValidateToken(tokenString string) (*auth.Claims, error) {
	return &auth.Claims{UserID: "test-user", Email: "test@example.com", Role: "student"}, nil
}

func (m *MockAuthService) IsAdmin(userID string) (bool, error) {
	return userID == "admin-user", nil
}

func (m *MockAuthService) IsTeacherOrAdmin(userID string) (bool, error) {
	return userID == "admin-user" || userID == "teacher-user", nil
}

// Test the modular user service
func TestUserService_GetAll_AdminAccess(t *testing.T) {
	// Arrange
	repo := NewMockRepository()
	authService := &MockAuthService{}
	service := NewService(repo, authService)

	// Add test users
	repo.Create(&entity.User{ID: "1", Email: "user1@test.com", Role: "student"})
	repo.Create(&entity.User{ID: "2", Email: "user2@test.com", Role: "teacher"})

	// Act - Admin should be able to list users
	users, err := service.GetAll("admin-user")

	// Assert
	if err != nil {
		t.Errorf("Expected no error for admin, got: %v", err)
	}
	if len(users) != 2 {
		t.Errorf("Expected 2 users, got: %d", len(users))
	}
}

func TestUserService_GetAll_StudentDenied(t *testing.T) {
	// Arrange
	repo := NewMockRepository()
	authService := &MockAuthService{}
	service := NewService(repo, authService)

	// Act - Student should not be able to list users
	_, err := service.GetAll("student-user")

	// Assert
	if err == nil {
		t.Error("Expected error for student trying to list users, got nil")
	}
	expectedError := "insufficient permissions: only teachers and admins can list users"
	if err.Error() != expectedError {
		t.Errorf("Expected error '%s', got '%s'", expectedError, err.Error())
	}
}

func TestUserService_GetByID_OwnProfile(t *testing.T) {
	// Arrange
	repo := NewMockRepository()
	authService := &MockAuthService{}
	service := NewService(repo, authService)

	testUser := &entity.User{
		ID:    "user-123",
		Email: "test@example.com",
		Role:  "student",
	}
	repo.Create(testUser)

	// Act - User accessing their own profile
	user, err := service.GetByID("user-123", "user-123")

	// Assert
	if err != nil {
		t.Errorf("Expected no error when user accesses own profile, got: %v", err)
	}
	if user.ID != "user-123" {
		t.Errorf("Expected user ID 'user-123', got: %s", user.ID)
	}
}

func TestUserService_GetByID_UnauthorizedAccess(t *testing.T) {
	// Arrange
	repo := NewMockRepository()
	authService := &MockAuthService{}
	service := NewService(repo, authService)

	testUser := &entity.User{
		ID:    "other-user-123",
		Email: "other@example.com",
		Role:  "student",
	}
	repo.Create(testUser)

	// Act - Student trying to access another user's profile
	_, err := service.GetByID("other-user-123", "current-user-456")

	// Assert
	if err == nil {
		t.Error("Expected error when student tries to access another user's profile, got nil")
	}
	expectedError := "insufficient permissions: can only access your own profile"
	if err.Error() != expectedError {
		t.Errorf("Expected error '%s', got '%s'", expectedError, err.Error())
	}
}

func TestUserService_Create_DefaultRole(t *testing.T) {
	// Arrange
	repo := NewMockRepository()
	authService := &MockAuthService{}
	service := NewService(repo, authService)

	req := CreateRequest{
		Email:     "newuser@test.com",
		Password:  "password123",
		FirstName: "New",
		LastName:  "User",
		// Role not specified - should default to student
	}

	// Act
	user, err := service.Create(req, "admin-user")

	// Assert
	if err != nil {
		t.Errorf("Expected no error, got: %v", err)
	}
	if user.Role != "student" {
		t.Errorf("Expected default role 'student', got: %s", user.Role)
	}
}
