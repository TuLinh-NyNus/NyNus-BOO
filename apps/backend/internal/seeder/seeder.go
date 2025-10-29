package seeder

import (
	"database/sql"
	"fmt"
	"log"
	"strings"
	"time"

	"exam-bank-system/apps/backend/internal/util"
	"github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

// Seeder handles database seeding.
type Seeder struct {
	db *sql.DB
}

// NewSeeder creates a new seeder instance.
func NewSeeder(db *sql.DB) *Seeder {
	return &Seeder{db: db}
}

// SeedDefaultData seeds the database with default users and core data.
func (s *Seeder) SeedDefaultData() error {
	log.Println("[Seeder] Seeding default data...")

	if err := s.seedDefaultUsers(); err != nil {
		return fmt.Errorf("failed to seed default users: %w", err)
	}

	log.Println("[Seeder] Default data seeding completed")
	return nil
}

// seedDefaultUsers creates default admin, teacher, and student accounts.
func (s *Seeder) seedDefaultUsers() error {
	log.Println("[Seeder] Seeding default users...")

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
			Role:      "ADMIN",
		},
		{
			Email:     "teacher@exambank.com",
			Password:  "teacher123",
			FirstName: "John",
			LastName:  "Teacher",
			Role:      "TEACHER",
		},
		{
			Email:     "student@exambank.com",
			Password:  "student123",
			FirstName: "Jane",
			LastName:  "Student",
			Role:      "STUDENT",
		},
		{
			Email:     "demo.teacher@exambank.com",
			Password:  "demo123",
			FirstName: "Demo",
			LastName:  "Teacher",
			Role:      "TEACHER",
		},
		{
			Email:     "demo.student@exambank.com",
			Password:  "demo123",
			FirstName: "Demo",
			LastName:  "Student",
			Role:      "STUDENT",
		},
	}

	for _, user := range defaultUsers {
		var exists bool
		if err := s.db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)", user.Email).Scan(&exists); err != nil {
			return fmt.Errorf("failed to check if user exists: %w", err)
		}

		if exists {
			log.Printf("   [Seeder] User %s already exists, skipping", user.Email)
			continue
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
		if err != nil {
			return fmt.Errorf("failed to hash password for %s: %w", user.Email, err)
		}

		userID := util.ULIDNow()
		role := strings.ToUpper(user.Role)
		status := "ACTIVE"
		maxConcurrentSessions := 3

		query := `
			INSERT INTO users (
				id, email, password_hash, first_name, last_name,
				role, status, is_active, email_verified, max_concurrent_sessions
			)
			VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, TRUE, $8)
		`
		if _, err := s.db.Exec(query, userID, user.Email, string(hashedPassword), user.FirstName, user.LastName, role, status, maxConcurrentSessions); err != nil {
			return fmt.Errorf("failed to insert user %s: %w", user.Email, err)
		}

		log.Printf("   [Seeder] Created user: %s (%s)", user.Email, role)
	}

	return nil
}

// SeedSampleData seeds questions and library books for demo purposes.
func (s *Seeder) SeedSampleData() error {
	log.Println("[Seeder] Seeding sample data...")

	if err := s.seedSampleQuestions(); err != nil {
		return err
	}

	if err := s.seedSampleBooks(); err != nil {
		return err
	}

	if err := s.seedSampleExams(); err != nil {
		return err
	}

	if err := s.seedSampleVideos(); err != nil {
		return err
	}

	if err := s.seedSampleLibraryEngagements(); err != nil {
		return err
	}

	log.Println("[Seeder] Sample data seeding completed")
	return nil
}

func (s *Seeder) seedSampleQuestions() error {
	var questionCount int
	if err := s.db.QueryRow("SELECT COUNT(*) FROM Question").Scan(&questionCount); err != nil {
		return fmt.Errorf("failed to check existing questions: %w", err)
	}

	if questionCount > 0 {
		log.Println("   [Seeder] Questions already exist, skipping question seeding")
		return nil
	}

	sampleQuestions := []struct {
		RawContent     string
		Content        string
		Type           string
		Difficulty     string
		Source         string
		Tags           []string
		QuestionCodeID string
		Answers        string
		CorrectAnswer  string
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

	for _, q := range sampleQuestions {
		questionID := util.ULIDNow()
		query := `
			INSERT INTO Question (id, rawContent, content, type, difficulty, source, tag, answers, correctAnswer, solution, questionCodeId, creator, status)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		`

		tagsArray := "{" + strings.Join(q.Tags, ",") + "}"
		if _, err := s.db.Exec(query,
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
		); err != nil {
			return fmt.Errorf("failed to insert question %s: %w", q.Content, err)
		}

		log.Printf("   [Seeder] Created sample question: %s", q.Content)
	}

	return nil
}

func (s *Seeder) seedSampleBooks() error {
	var bookCount int
	if err := s.db.QueryRow("SELECT COUNT(*) FROM library_items WHERE type = 'book'").Scan(&bookCount); err != nil {
		return fmt.Errorf("failed to check existing books: %w", err)
	}

	if bookCount > 0 {
		log.Println("   [Seeder] Books already exist, skipping book seeding")
		return nil
	}

	type sampleBook struct {
		Title           string
		Description     string
		Category        string
		Subject         string
		Grade           string
		BookType        string
		Author          string
		Publisher       string
		PublicationYear int
		ISBN            string
		PageCount       int
		FileURL         string
		FileType        string
		FileSize        int64
		CoverImage      string
		ThumbnailURL    string
		Tags            []string
	}

	sampleBooks := []sampleBook{
		{
			Title:           "Math 12 Advanced Problem Solving",
			Description:     "Summary of advanced formulas and exercises for grade 12 students preparing for graduation exams.",
			Category:        "Mathematics",
			Subject:         "Math",
			Grade:           "12",
			BookType:        "reference",
			Author:          "Nguyen Van A",
			Publisher:       "Vietnam Education Publishing House",
			PublicationYear: 2024,
			ISBN:            "9786040000012",
			PageCount:       320,
			FileURL:         "https://storage.exam-bank.vn/books/math-12-advanced.pdf",
			FileType:        "pdf",
			FileSize:        7_340_032,
			CoverImage:      "https://storage.exam-bank.vn/books/covers/math-12-advanced.jpg",
			ThumbnailURL:    "https://storage.exam-bank.vn/books/covers/thumbnails/math-12-advanced.jpg",
			Tags:            []string{"math", "grade12", "advanced", "exam"},
		},
		{
			Title:           "English 10 Student Book",
			Description:     "Core English textbook for grade 10 with listening, speaking, reading, and writing practice.",
			Category:        "Languages",
			Subject:         "English",
			Grade:           "10",
			BookType:        "textbook",
			Author:          "Hoang Thi B",
			Publisher:       "Vietnam Education Publishing House",
			PublicationYear: 2023,
			ISBN:            "9786040000010",
			PageCount:       240,
			FileURL:         "https://storage.exam-bank.vn/books/english-10-student-book.pdf",
			FileType:        "pdf",
			FileSize:        5_242_880,
			CoverImage:      "https://storage.exam-bank.vn/books/covers/english-10.jpg",
			ThumbnailURL:    "https://storage.exam-bank.vn/books/covers/thumbnails/english-10.jpg",
			Tags:            []string{"english", "grade10", "textbook"},
		},
		{
			Title:           "Physics 11 Advanced Workbook",
			Description:     "Advanced physics exercises for grade 11, suitable for competitions and specialized classes.",
			Category:        "Physics",
			Subject:         "Physics",
			Grade:           "11",
			BookType:        "workbook",
			Author:          "Le Van C",
			Publisher:       "Tre Publishing House",
			PublicationYear: 2022,
			ISBN:            "9786040000011",
			PageCount:       280,
			FileURL:         "https://storage.exam-bank.vn/books/physics-11-advanced.pdf",
			FileType:        "pdf",
			FileSize:        6_553_600,
			CoverImage:      "https://storage.exam-bank.vn/books/covers/physics-11.jpg",
			ThumbnailURL:    "https://storage.exam-bank.vn/books/covers/thumbnails/physics-11.jpg",
			Tags:            []string{"physics", "grade11", "advanced"},
		},
	}

	now := time.Now()

	for _, book := range sampleBooks {
		tx, err := s.db.Begin()
		if err != nil {
			return fmt.Errorf("failed to start transaction: %w", err)
		}

		itemID := util.ULIDNow()
		metaID := util.ULIDNow()

		if _, err := tx.Exec(`
			INSERT INTO library_items (
				id, name, description, type, category, file_url, file_type, file_size,
				thumbnail_url, upload_status, is_active, download_count, average_rating,
				review_count, created_at, updated_at
			) VALUES (
				$1, $2, $3, 'book', $4, $5, $6, $7,
				$8, 'approved', TRUE, 0, 0, 0, $9, $9
			)
		`,
			itemID,
			book.Title,
			nullString(book.Description),
			nullString(book.Category),
			nullString(book.FileURL),
			nullString(book.FileType),
			nullInt64(book.FileSize),
			nullString(book.ThumbnailURL),
			now,
		); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to insert library item %s: %w", book.Title, err)
		}

		if _, err := tx.Exec(`
			INSERT INTO book_metadata (
				id, library_item_id, subject, grade, book_type, author, publisher,
				publication_year, isbn, page_count, required_role, required_level,
				target_roles, cover_image, created_at, updated_at
			) VALUES (
				$1, $2, $3, $4, $5, $6, $7,
				$8, $9, $10, 'STUDENT', NULL,
				$11, $12, $13, $13
			)
		`,
			metaID,
			itemID,
			nullString(book.Subject),
			nullString(book.Grade),
			nullString(book.BookType),
			nullString(book.Author),
			nullString(book.Publisher),
			nullInt32(book.PublicationYear),
			nullString(book.ISBN),
			nullInt32(book.PageCount),
			pq.Array([]string{"STUDENT", "TUTOR"}),
			nullString(book.CoverImage),
			now,
		); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to insert book metadata for %s: %w", book.Title, err)
		}

		if err := upsertItemTagsTx(tx, itemID, book.Tags); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to upsert tags for book %s: %w", book.Title, err)
		}

		if err := tx.Commit(); err != nil {
			return fmt.Errorf("failed to commit sample book %s: %w", book.Title, err)
		}

		log.Printf("   [Seeder] Created sample book: %s", book.Title)
	}

	return nil
}

func (s *Seeder) seedSampleExams() error {
	var examCount int
	if err := s.db.QueryRow("SELECT COUNT(*) FROM library_items WHERE type = 'exam'").Scan(&examCount); err != nil {
		return fmt.Errorf("failed to check existing exams: %w", err)
	}

	if examCount > 0 {
		log.Println("   [Seeder] Exams already exist, skipping exam seeding")
		return nil
	}

	type sampleExam struct {
		Title         string
		Description   string
		Category      string
		Subject       string
		Grade         string
		Province      string
		School        string
		AcademicYear  string
		Semester      string
		ExamDuration  int
		QuestionCount int
		Difficulty    string
		ExamType      string
		FileURL       string
		FileType      string
		FileSize      int64
		ThumbnailURL  string
		RequiredRole  string
		RequiredLevel int
		TargetRoles   []string
		Tags          []string
	}

	sampleExams := []sampleExam{
		{
			Title:         "Äá» thi thá»­ THPT Quá»‘c Gia 2024 - ToÃ¡n",
			Description:   "Äá» thi thá»­ chuáº©n cáº¥u trÃºc Bá»™ GD&ÄT cho ká»³ thi THPT Quá»‘c Gia mÃ´n ToÃ¡n nÄƒm 2024.",
			Category:      "Exam",
			Subject:       "Math",
			Grade:         "12",
			Province:      "HÃ  Ná»™i",
			School:        "THPT Chu VÄƒn An",
			AcademicYear:  "2023-2024",
			Semester:      "2",
			ExamDuration:  90,
			QuestionCount: 50,
			Difficulty:    "hard",
			ExamType:      "official",
			FileURL:       "https://storage.exam-bank.vn/exams/thpt-2024-math.pdf",
			FileType:      "pdf",
			FileSize:      4_456_448,
			ThumbnailURL:  "https://storage.exam-bank.vn/exams/thumbnails/thpt-2024-math.jpg",
			RequiredRole:  "STUDENT",
			RequiredLevel: 5,
			TargetRoles:   []string{"STUDENT", "TUTOR"},
			Tags:          []string{"de-thi-thu", "toan-hoc", "thpt"},
		},
		{
			Title:         "Äá» thi giá»¯a ká»³ 1 2024 - Váº­t LÃ½ 11",
			Description:   "Äá» thi giá»¯a ká»³ 1 mÃ´n Váº­t LÃ½ lá»›p 11, cÃ³ Ä‘Ã¡p Ã¡n chi tiáº¿t.",
			Category:      "Exam",
			Subject:       "Physics",
			Grade:         "11",
			Province:      "TP. Há»“ ChÃ­ Minh",
			School:        "THPT LÃª Há»“ng Phong",
			AcademicYear:  "2023-2024",
			Semester:      "1",
			ExamDuration:  60,
			QuestionCount: 40,
			Difficulty:    "medium",
			ExamType:      "practice",
			FileURL:       "https://storage.exam-bank.vn/exams/gk1-2024-physics.pdf",
			FileType:      "pdf",
			FileSize:      3_211_264,
			ThumbnailURL:  "https://storage.exam-bank.vn/exams/thumbnails/gk1-2024-physics.jpg",
			RequiredRole:  "STUDENT",
			RequiredLevel: 4,
			TargetRoles:   []string{"STUDENT", "TUTOR"},
			Tags:          []string{"giua-ky", "vat-li", "lop11"},
		},
	}

	now := time.Now()

	for _, exam := range sampleExams {
		tx, err := s.db.Begin()
		if err != nil {
			return fmt.Errorf("failed to start transaction: %w", err)
		}

		itemID := util.ULIDNow()
		metaID := util.ULIDNow()

		if _, err := tx.Exec(`
			INSERT INTO library_items (
				id, name, description, type, category, file_url, file_type, file_size,
				thumbnail_url, upload_status, is_active, download_count, average_rating,
				review_count, created_at, updated_at
			) VALUES (
				$1, $2, $3, 'exam', $4, $5, $6, $7,
				$8, 'approved', TRUE, 0, 0, 0, $9, $9
			)
		`,
			itemID,
			exam.Title,
			nullString(exam.Description),
			nullString(exam.Category),
			nullString(exam.FileURL),
			nullString(exam.FileType),
			nullInt64(exam.FileSize),
			nullString(exam.ThumbnailURL),
			now,
		); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to insert exam item %s: %w", exam.Title, err)
		}

		if _, err := tx.Exec(`
			INSERT INTO exam_metadata (
				id, library_item_id, subject, grade, province, school, academic_year,
				semester, exam_duration, question_count, difficulty_level, exam_type,
				required_role, required_level, target_roles, created_at, updated_at
			) VALUES (
				$1, $2, $3, $4, $5, $6, $7,
				$8, $9, $10, $11, $12,
				$13, $14, $15, $16, $16
			)
		`,
			metaID,
			itemID,
			exam.Subject,
			exam.Grade,
			nullString(exam.Province),
			nullString(exam.School),
			exam.AcademicYear,
			nullString(exam.Semester),
			nullInt32(exam.ExamDuration),
			nullInt32(exam.QuestionCount),
			nullString(exam.Difficulty),
			exam.ExamType,
			exam.RequiredRole,
			nullInt32(exam.RequiredLevel),
			pq.Array(exam.TargetRoles),
			now,
		); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to insert exam metadata for %s: %w", exam.Title, err)
		}

		if err := upsertItemTagsTx(tx, itemID, exam.Tags); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to upsert tags for exam %s: %w", exam.Title, err)
		}

		if err := tx.Commit(); err != nil {
			return fmt.Errorf("failed to commit sample exam %s: %w", exam.Title, err)
		}

		log.Printf("   [Seeder] Created sample exam: %s", exam.Title)
	}

	return nil
}

func (s *Seeder) seedSampleVideos() error {
	var videoCount int
	if err := s.db.QueryRow("SELECT COUNT(*) FROM library_items WHERE type = 'video'").Scan(&videoCount); err != nil {
		return fmt.Errorf("failed to check existing videos: %w", err)
	}

	if videoCount > 0 {
		log.Println("   [Seeder] Videos already exist, skipping video seeding")
		return nil
	}

	type sampleVideo struct {
		Title          string
		Description    string
		Category       string
		Subject        string
		Grade          string
		FileURL        string
		FileType       string
		FileSize       int64
		ThumbnailURL   string
		YoutubeURL     string
		YoutubeID      string
		Duration       int
		Quality        string
		InstructorName string
		RequiredRole   string
		RequiredLevel  int
		TargetRoles    []string
		Tags           []string
	}

	sampleVideos := []sampleVideo{
		{
			Title:          "Ã”n táº­p ToÃ¡n 12 - Chá»§ Ä‘á» HÃ m Sá»‘",
			Description:    "BÃ i giáº£ng tÃ³m táº¯t kiáº¿n thá»©c trá»ng tÃ¢m vÃ  dáº¡ng bÃ i thÆ°á»ng gáº·p vá» hÃ m sá»‘ lá»›p 12.",
			Category:       "Video",
			Subject:        "Math",
			Grade:          "12",
			FileURL:        "",
			FileType:       "",
			FileSize:       0,
			ThumbnailURL:   "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
			YoutubeURL:     "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
			YoutubeID:      "dQw4w9WgXcQ",
			Duration:       1_800,
			Quality:        "1080p",
			InstructorName: "Tháº§y Nguyá»…n Minh",
			RequiredRole:   "STUDENT",
			RequiredLevel:  5,
			TargetRoles:    []string{"STUDENT", "TUTOR", "TEACHER"},
			Tags:           []string{"video-bai-giang", "toan-hoc", "lop12"},
		},
		{
			Title:          "LÃ½ thuyáº¿t Váº­t LÃ½ 11 - Äiá»‡n tá»« trÆ°á»ng",
			Description:    "Video bÃ i giáº£ng chi tiáº¿t vá» chÆ°Æ¡ng Äiá»‡n tá»« trÆ°á»ng dÃ nh cho há»c sinh lá»›p 11.",
			Category:       "Video",
			Subject:        "Physics",
			Grade:          "11",
			FileURL:        "",
			FileType:       "",
			FileSize:       0,
			ThumbnailURL:   "https://img.youtube.com/vi/abcdefghijk/hqdefault.jpg",
			YoutubeURL:     "https://www.youtube.com/watch?v=abcdefghijk",
			YoutubeID:      "abcdefghijk",
			Duration:       2_100,
			Quality:        "720p",
			InstructorName: "CÃ´ Tráº§n Tháº£o",
			RequiredRole:   "STUDENT",
			RequiredLevel:  4,
			TargetRoles:    []string{"STUDENT", "TUTOR", "TEACHER"},
			Tags:           []string{"video-on-tap", "vat-li", "lop11"},
		},
	}

	now := time.Now()

	for _, video := range sampleVideos {
		tx, err := s.db.Begin()
		if err != nil {
			return fmt.Errorf("failed to start transaction: %w", err)
		}

		itemID := util.ULIDNow()
		metaID := util.ULIDNow()

		if _, err := tx.Exec(`
			INSERT INTO library_items (
				id, name, description, type, category, file_url, file_type, file_size,
				thumbnail_url, upload_status, is_active, download_count, average_rating,
				review_count, created_at, updated_at
			) VALUES (
				$1, $2, $3, 'video', $4, $5, $6, $7,
				$8, 'approved', TRUE, 0, 0, 0, $9, $9
			)
		`,
			itemID,
			video.Title,
			nullString(video.Description),
			nullString(video.Category),
			nullString(video.FileURL),
			nullString(video.FileType),
			nullInt64(video.FileSize),
			nullString(video.ThumbnailURL),
			now,
		); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to insert video item %s: %w", video.Title, err)
		}

		if _, err := tx.Exec(`
			INSERT INTO video_metadata (
				id, library_item_id, youtube_url, youtube_id, duration, quality,
				instructor_name, related_exam_id, subject, grade, required_role,
				required_level, target_roles, created_at, updated_at
			) VALUES (
				$1, $2, $3, $4, $5, $6,
				$7, NULL, $8, $9, $10,
				$11, $12, $13, $13
			)
		`,
			metaID,
			itemID,
			video.YoutubeURL,
			video.YoutubeID,
			nullInt32(video.Duration),
			nullString(video.Quality),
			nullString(video.InstructorName),
			video.Subject,
			video.Grade,
			video.RequiredRole,
			nullInt32(video.RequiredLevel),
			pq.Array(video.TargetRoles),
			now,
		); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to insert video metadata for %s: %w", video.Title, err)
		}

		if err := upsertItemTagsTx(tx, itemID, video.Tags); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to upsert tags for video %s: %w", video.Title, err)
		}

		if err := tx.Commit(); err != nil {
			return fmt.Errorf("failed to commit sample video %s: %w", video.Title, err)
		}

		log.Printf("   [Seeder] Created sample video: %s", video.Title)
	}

	return nil
}

func (s *Seeder) seedSampleLibraryEngagements() error {
	var ratingCount int
	if err := s.db.QueryRow("SELECT COUNT(*) FROM item_ratings").Scan(&ratingCount); err != nil {
		return fmt.Errorf("failed to count item_ratings: %w", err)
	}

	var bookmarkCount int
	if err := s.db.QueryRow("SELECT COUNT(*) FROM user_bookmarks").Scan(&bookmarkCount); err != nil {
		return fmt.Errorf("failed to count user_bookmarks: %w", err)
	}

	if ratingCount > 0 || bookmarkCount > 0 {
		log.Println("   [Seeder] Library engagement data already exists, skipping ratings/bookmarks seeding")
		return nil
	}

	userEmails := []string{
		"student@exambank.com",
		"teacher@exambank.com",
		"demo.student@exambank.com",
	}

	userIDs := make(map[string]string)
	for _, email := range userEmails {
		id, err := s.fetchUserIDByEmail(email)
		if err != nil {
			return fmt.Errorf("failed to lookup user %s: %w", email, err)
		}
		if id != "" {
			userIDs[email] = id
		}
	}

	if len(userIDs) == 0 {
		log.Println("   [Seeder] No demo users available for ratings/bookmarks, skipping")
		return nil
	}

	books, err := s.fetchLibraryItemIDsByType("book", 2)
	if err != nil {
		return fmt.Errorf("failed to lookup sample books for engagement seeding: %w", err)
	}

	exams, err := s.fetchLibraryItemIDsByType("exam", 2)
	if err != nil {
		return fmt.Errorf("failed to lookup sample exams for engagement seeding: %w", err)
	}

	videos, err := s.fetchLibraryItemIDsByType("video", 2)
	if err != nil {
		return fmt.Errorf("failed to lookup sample videos for engagement seeding: %w", err)
	}

	if len(books) == 0 && len(exams) == 0 && len(videos) == 0 {
		log.Println("   [Seeder] No library items found, skipping ratings/bookmarks seeding")
		return nil
	}

	type ratingSeed struct {
		ItemID    string
		UserEmail string
		Rating    int
		Review    string
	}

	var ratings []ratingSeed
	if len(books) > 0 && userIDs["student@exambank.com"] != "" {
		ratings = append(ratings, ratingSeed{
			ItemID:    books[0],
			UserEmail: "student@exambank.com",
			Rating:    5,
			Review:    "TÃ i liá»‡u ráº¥t há»¯u Ã­ch cho viá»‡c luyá»‡n thi.",
		})
	}
	if len(exams) > 0 && userIDs["teacher@exambank.com"] != "" {
		ratings = append(ratings, ratingSeed{
			ItemID:    exams[0],
			UserEmail: "teacher@exambank.com",
			Rating:    4,
			Review:    "Äá» thi bÃ¡m sÃ¡t cáº¥u trÃºc chÃ­nh thá»©c, cÃ³ thá»ƒ dÃ¹ng Ä‘á»ƒ luyá»‡n táº­p.",
		})
	}
	if len(videos) > 0 && userIDs["demo.student@exambank.com"] != "" {
		ratings = append(ratings, ratingSeed{
			ItemID:    videos[0],
			UserEmail: "demo.student@exambank.com",
			Rating:    5,
			Review:    "Giáº£ng viÃªn truyá»n Ä‘áº¡t dá»… hiá»ƒu, pháº§n recap cuá»‘i bÃ i ráº¥t há»¯u Ã­ch.",
		})
	}

	type bookmarkSeed struct {
		ItemID    string
		UserEmail string
	}

	var bookmarks []bookmarkSeed
	if len(books) > 0 && userIDs["student@exambank.com"] != "" {
		bookmarks = append(bookmarks, bookmarkSeed{
			ItemID:    books[0],
			UserEmail: "student@exambank.com",
		})
	}
	if len(exams) > 0 && userIDs["student@exambank.com"] != "" {
		bookmarks = append(bookmarks, bookmarkSeed{
			ItemID:    exams[0],
			UserEmail: "student@exambank.com",
		})
	}
	if len(videos) > 0 && userIDs["teacher@exambank.com"] != "" {
		bookmarks = append(bookmarks, bookmarkSeed{
			ItemID:    videos[0],
			UserEmail: "teacher@exambank.com",
		})
	}

	if len(ratings) == 0 && len(bookmarks) == 0 {
		log.Println("   [Seeder] No eligible ratings/bookmarks to seed, skipping")
		return nil
	}

	now := time.Now()

	for _, rating := range ratings {
		userID := userIDs[rating.UserEmail]
		if userID == "" {
			continue
		}

		if _, err := s.db.Exec(`
			INSERT INTO item_ratings (id, library_item_id, user_id, rating, review, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $6)
			ON CONFLICT (library_item_id, user_id) DO UPDATE
				SET rating = EXCLUDED.rating,
				    review = EXCLUDED.review,
				    updated_at = EXCLUDED.updated_at
		`,
			util.ULIDNow(),
			rating.ItemID,
			userID,
			rating.Rating,
			rating.Review,
			now,
		); err != nil {
			return fmt.Errorf("failed to seed rating for item %s: %w", rating.ItemID, err)
		}
	}

	for _, bookmark := range bookmarks {
		userID := userIDs[bookmark.UserEmail]
		if userID == "" {
			continue
		}

		if _, err := s.db.Exec(`
			INSERT INTO user_bookmarks (id, library_item_id, user_id, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $4)
			ON CONFLICT (library_item_id, user_id) DO UPDATE
				SET updated_at = EXCLUDED.updated_at
		`,
			util.ULIDNow(),
			bookmark.ItemID,
			userID,
			now,
		); err != nil {
			return fmt.Errorf("failed to seed bookmark for item %s: %w", bookmark.ItemID, err)
		}
	}

	if _, err := s.db.Exec(`
		UPDATE library_items li
		SET average_rating = agg.avg_rating,
		    review_count = agg.review_count
		FROM (
			SELECT library_item_id,
			       ROUND(AVG(rating)::numeric, 2) AS avg_rating,
			       COUNT(*) AS review_count
			FROM item_ratings
			GROUP BY library_item_id
		) agg
		WHERE li.id = agg.library_item_id
	`); err != nil {
		return fmt.Errorf("failed to update library item aggregates: %w", err)
	}

	log.Printf("   [Seeder] Seeded %d library ratings and %d bookmarks", len(ratings), len(bookmarks))
	return nil
}

func (s *Seeder) fetchUserIDByEmail(email string) (string, error) {
	var id string
	err := s.db.QueryRow("SELECT id FROM users WHERE email = $1", email).Scan(&id)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", nil
		}
		return "", err
	}
	return id, nil
}

func (s *Seeder) fetchLibraryItemIDsByType(itemType string, limit int) ([]string, error) {
	rows, err := s.db.Query(`
		SELECT id
		FROM library_items
		WHERE type = $1
		ORDER BY created_at
		LIMIT $2
	`, itemType, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var ids []string
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		ids = append(ids, id)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return ids, nil
}

func upsertItemTagsTx(tx *sql.Tx, itemID string, tags []string) error {
	cleaned := make([]string, 0, len(tags))
	for _, rawTag := range tags {
		tag := strings.TrimSpace(rawTag)
		if tag != "" {
			cleaned = append(cleaned, tag)
		}
	}

	for _, tag := range cleaned {
		var tagID string
		if err := tx.QueryRow(`
			INSERT INTO tags (id, name)
			VALUES ($1, $2)
			ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
			RETURNING id
		`, util.ULIDNow(), tag).Scan(&tagID); err != nil {
			return fmt.Errorf("failed to upsert tag %s: %w", tag, err)
		}

		if _, err := tx.Exec(`
			INSERT INTO item_tags (library_item_id, tag_id)
			VALUES ($1, $2)
			ON CONFLICT DO NOTHING
		`, itemID, tagID); err != nil {
			return fmt.Errorf("failed to link tag %s to item %s: %w", tag, itemID, err)
		}
	}

	return nil
}

func nullString(value string) sql.NullString {
	v := strings.TrimSpace(value)
	if v == "" {
		return sql.NullString{Valid: false}
	}
	return sql.NullString{String: v, Valid: true}
}

func nullInt32(value int) sql.NullInt32 {
	if value == 0 {
		return sql.NullInt32{Valid: false}
	}
	return sql.NullInt32{Int32: int32(value), Valid: true}
}

func nullInt64(value int64) sql.NullInt64 {
	if value == 0 {
		return sql.NullInt64{Valid: false}
	}
	return sql.NullInt64{Int64: value, Valid: true}
}
