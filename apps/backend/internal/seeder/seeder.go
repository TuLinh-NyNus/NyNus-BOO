package seeder

import (
	"database/sql"
	"fmt"
	"log"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

// Seeder handles database seeding
type Seeder struct {
	db *sql.DB
}

// NewSeeder creates a new seeder instance
func NewSeeder(db *sql.DB) *Seeder {
	return &Seeder{db: db}
}

// SeedDefaultData seeds the database with default users and data
func (s *Seeder) SeedDefaultData() error {
	log.Println("🌱 Seeding default data...")

	// Seed default users
	if err := s.seedDefaultUsers(); err != nil {
		return fmt.Errorf("failed to seed default users: %w", err)
	}

	log.Println("✅ Default data seeding completed")
	return nil
}

// seedDefaultUsers creates default admin, teacher, and student users
func (s *Seeder) seedDefaultUsers() error {
	log.Println("👥 Seeding default users...")

	// Default users data
	defaultUsers := []struct {
		Email     string
		Password  string
		FirstName string
		LastName  string
		Role      string
	}{
		{
			Email:     "admin@exambank.com",
			Password:  "admin123",
			FirstName: "System",
			LastName:  "Administrator",
			Role:      "admin",
		},
		{
			Email:     "teacher@exambank.com",
			Password:  "teacher123",
			FirstName: "John",
			LastName:  "Teacher",
			Role:      "teacher",
		},
		{
			Email:     "student@exambank.com",
			Password:  "student123",
			FirstName: "Jane",
			LastName:  "Student",
			Role:      "student",
		},
		{
			Email:     "demo.teacher@exambank.com",
			Password:  "demo123",
			FirstName: "Demo",
			LastName:  "Teacher",
			Role:      "teacher",
		},
		{
			Email:     "demo.student@exambank.com",
			Password:  "demo123",
			FirstName: "Demo",
			LastName:  "Student",
			Role:      "student",
		},
	}

	for _, user := range defaultUsers {
		// Check if user already exists
		var exists bool
		err := s.db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)", user.Email).Scan(&exists)
		if err != nil {
			return fmt.Errorf("failed to check if user exists: %w", err)
		}

		if exists {
			log.Printf("   ⏭️  User %s already exists, skipping", user.Email)
			continue
		}

		// Hash password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
		if err != nil {
			return fmt.Errorf("failed to hash password for %s: %w", user.Email, err)
		}

		// Insert user
		query := `
			INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
			VALUES ($1, $2, $3, $4, $5, true)
		`
		_, err = s.db.Exec(query, user.Email, string(hashedPassword), user.FirstName, user.LastName, user.Role)
		if err != nil {
			return fmt.Errorf("failed to insert user %s: %w", user.Email, err)
		}

		log.Printf("   ✅ Created user: %s (%s)", user.Email, user.Role)
	}

	return nil
}

// SeedSampleData seeds the database with sample questions for the advanced question bank system
func (s *Seeder) SeedSampleData() error {
	log.Println("📚 Seeding sample data...")

	// Check if sample data already exists
	var questionCount int
	err := s.db.QueryRow("SELECT COUNT(*) FROM Question").Scan(&questionCount)
	if err != nil {
		return fmt.Errorf("failed to check existing questions: %w", err)
	}

	if questionCount > 0 {
		log.Println("   ⏭️  Sample questions already exist, skipping sample data seeding")
		return nil
	}

	// Sample questions for the advanced question bank system
	sampleQuestions := []struct {
		RawContent     string
		Content        string
		Type           string
		Difficulty     string
		Source         string
		Tags           []string
		QuestionCodeID string
		Answers        string // JSON string
		CorrectAnswer  string // JSON string
		Solution       string
	}{
		{
			RawContent:     "What is the capital of France?",
			Content:        "What is the capital of France?",
			Type:           "MC",
			Difficulty:     "EASY",
			Source:         "Geography Textbook",
			Tags:           []string{"geography", "europe", "capitals"},
			QuestionCodeID: "6E2B1E1",
			Answers:        `[{"id": "A", "text": "Paris"}, {"id": "B", "text": "London"}, {"id": "C", "text": "Berlin"}, {"id": "D", "text": "Madrid"}]`,
			CorrectAnswer:  `{"id": "A", "text": "Paris"}`,
			Solution:       "Paris is the capital and largest city of France.",
		},
		{
			RawContent:     "The Earth is flat.",
			Content:        "The Earth is flat.",
			Type:           "TF",
			Difficulty:     "EASY",
			Source:         "Science Textbook",
			Tags:           []string{"science", "geography", "earth"},
			QuestionCodeID: "8S4D1M1",
			Answers:        `[{"id": "T", "text": "True"}, {"id": "F", "text": "False"}]`,
			CorrectAnswer:  `{"id": "F", "text": "False"}`,
			Solution:       "The Earth is an oblate spheroid, not flat.",
		},
		{
			RawContent:     "What is 2 + 2?",
			Content:        "What is 2 + 2?",
			Type:           "MC",
			Difficulty:     "EASY",
			Source:         "Mathematics Textbook",
			Tags:           []string{"mathematics", "arithmetic", "basic"},
			QuestionCodeID: "6M1A1E1",
			Answers:        `[{"id": "A", "text": "3"}, {"id": "B", "text": "4"}, {"id": "C", "text": "5"}, {"id": "D", "text": "6"}]`,
			CorrectAnswer:  `{"id": "B", "text": "4"}`,
			Solution:       "Basic arithmetic: 2 + 2 = 4",
		},
	}

	for i, q := range sampleQuestions {
		// Generate a unique ID for the question
		questionID := fmt.Sprintf("q_%d_%d", time.Now().Unix(), i+1)

		// Insert question into the new Question table
		query := `
			INSERT INTO Question (id, rawContent, content, type, difficulty, source, tag, answers, correctAnswer, solution, questionCodeId, creator, status)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		`
		// Convert tags slice to PostgreSQL array format
		tagsArray := "{" + strings.Join(q.Tags, ",") + "}"
		_, err = s.db.Exec(query,
			questionID,
			q.RawContent,
			q.Content,
			q.Type,
			q.Difficulty,
			q.Source,
			tagsArray,
			q.Answers,
			q.CorrectAnswer,
			q.Solution,
			q.QuestionCodeID,
			"ADMIN",
			"ACTIVE",
		)
		if err != nil {
			return fmt.Errorf("failed to insert question %d: %w", i+1, err)
		}

		log.Printf("   ✅ Created sample question: %s", q.Content)
	}

	log.Println("✅ Sample data seeding completed")
	return nil
}
