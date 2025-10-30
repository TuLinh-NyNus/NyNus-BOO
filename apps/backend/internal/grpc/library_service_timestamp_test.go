package grpc

import (
	"database/sql"
	"testing"
	"time"

	"exam-bank-system/apps/backend/internal/entity"
	v1 "exam-bank-system/apps/backend/pkg/proto/v1"
)

// Helpers for sql.Null*
func ns(s string) sql.NullString  { return sql.NullString{String: s, Valid: true} }
func ni32(i int32) sql.NullInt32  { return sql.NullInt32{Int32: i, Valid: true} }
func ni64(i int64) sql.NullInt64  { return sql.NullInt64{Int64: i, Valid: true} }
func nt(t time.Time) sql.NullTime { return sql.NullTime{Time: t, Valid: true} }

// Book: Verify Timestamp round-trip and key field mappings
func TestToProtoLibraryItemFromBook_TimestampRoundTrip(t *testing.T) {
	now := time.Now().UTC().Truncate(time.Second)

	book := &entity.Book{
		ID:              "BOOK-1",
		Title:           "Algebra 10",
		Description:     ns("Desc"),
		Category:        ns("TEXTBOOK"),
		Author:          ns("Author A"),
		Publisher:       ns("Publisher P"),
		PublicationYear: ni32(2024),
		PublicationDate: nt(now.Add(-24 * time.Hour)),
		ISBN:            ns("ISBN-123"),
		PageCount:       ni32(300),
		CoverImage:      ns("cover.png"),
		FileURL:         ns("https://cdn/books/algebra10.pdf"),
		FileID:          ns("file-123"),
		ThumbnailURL:    ns("thumb.png"),
		FileSize:        ni64(1024),
		FileType:        ns("application/pdf"),
		UploadStatus:    "approved",
		IsActive:        true,
		DownloadCount:   10,
		AverageRating:   4.5,
		ReviewCount:     7,
		Tags:            []string{"Math", "Grade10"},
		RequiredRole:    "STUDENT",
		RequiredLevel:   ni32(2),
		TargetRoles:     []string{"STUDENT", "TEACHER"},
		UploadedBy:      ns("user-1"),
		ApprovedBy:      ns("admin-1"),
		CreatedAt:       now,
		UpdatedAt:       now,
	}

	item := toProtoLibraryItemFromBook(book)
	if item == nil {
		t.Fatalf("toProtoLibraryItemFromBook returned nil")
	}
	// Timestamp round-trip in UTC
	created := item.GetCreatedAt().AsTime().UTC()
	updated := item.GetUpdatedAt().AsTime().UTC()
	if !created.Equal(now) {
		t.Fatalf("created_at mismatch: got %s want %s", created.Format(time.RFC3339), now.Format(time.RFC3339))
	}
	if !updated.Equal(now) {
		t.Fatalf("updated_at mismatch: got %s want %s", updated.Format(time.RFC3339), now.Format(time.RFC3339))
	}
	// Type & basic fields
	if item.GetType() != v1.LibraryItemType_LIBRARY_ITEM_TYPE_BOOK {
		t.Fatalf("type mismatch: got %v want BOOK", item.GetType())
	}
	if item.GetName() != book.Title {
		t.Fatalf("name mismatch: got %s want %s", item.GetName(), book.Title)
	}
	// Required role normalization
	if item.GetRequiredRole() != "STUDENT" {
		t.Fatalf("required_role mismatch: got %s want STUDENT", item.GetRequiredRole())
	}
	// Rating & counts
	if item.GetAverageRating() != book.AverageRating {
		t.Fatalf("average_rating mismatch: got %f want %f", item.GetAverageRating(), book.AverageRating)
	}
	if item.GetReviewCount() != int32(book.ReviewCount) {
		t.Fatalf("review_count mismatch: got %d want %d", item.GetReviewCount(), book.ReviewCount)
	}
	// Metadata timestamps
	bm := item.GetBook()
	if bm == nil {
		t.Fatalf("book metadata is nil")
	}
	bmCreated := bm.GetCreatedAt().AsTime().UTC()
	bmUpdated := bm.GetUpdatedAt().AsTime().UTC()
	if !bmCreated.Equal(now) || !bmUpdated.Equal(now) {
		t.Fatalf("book metadata timestamps mismatch: created(%s) updated(%s) want %s", bmCreated, bmUpdated, now)
	}
}

// Exam: Verify Timestamp round-trip
func TestToProtoLibraryItemFromExam_TimestampRoundTrip(t *testing.T) {
	now := time.Now().UTC().Truncate(time.Second)

	exam := &entity.LibraryExam{
		ID:            "EXAM-1",
		Title:         "Exam Algebra Midterm",
		Description:   ns("Exam Desc"),
		Category:      ns("EXAM"),
		FileURL:       ns("https://cdn/exams/exam1.pdf"),
		FileID:        ns("file-exam-1"),
		ThumbnailURL:  ns("thumb-exam.png"),
		FileSize:      ni64(2048),
		UploadStatus:  "approved",
		IsActive:      true,
		DownloadCount: 25,
		AverageRating: 4.2,
		ReviewCount:   11,
		UploadedBy:    ns("user-2"),
		ApprovedBy:    ns("admin-2"),
		CreatedAt:     now,
		UpdatedAt:     now,

		Subject:       "Math",
		Grade:         "10",
		Province:      ns("HCM"),
		School:        ns("THPT A"),
		AcademicYear:  "2024-2025",
		Semester:      ns("1"),
		ExamDuration:  ni32(90),
		QuestionCount: ni32(50),
		Difficulty:    ns("MEDIUM"),
		ExamType:      "official",
		RequiredRole:  "STUDENT",
		RequiredLevel: ni32(2),
		TargetRoles:   []string{"STUDENT", "TEACHER"},
		Tags:          []string{"Math", "Exam"},
	}

	item := toProtoLibraryItemFromExam(exam)
	if item == nil {
		t.Fatalf("toProtoLibraryItemFromExam returned nil")
	}
	created := item.GetCreatedAt().AsTime().UTC()
	updated := item.GetUpdatedAt().AsTime().UTC()
	if !created.Equal(now) || !updated.Equal(now) {
		t.Fatalf("timestamps mismatch: created(%s) updated(%s) want %s", created, updated, now)
	}
	if item.GetType() != v1.LibraryItemType_LIBRARY_ITEM_TYPE_EXAM {
		t.Fatalf("type mismatch: got %v want EXAM", item.GetType())
	}
	em := item.GetExam()
	if em == nil {
		t.Fatalf("exam metadata is nil")
	}
	emCreated := em.GetCreatedAt().AsTime().UTC()
	emUpdated := em.GetUpdatedAt().AsTime().UTC()
	if !emCreated.Equal(now) || !emUpdated.Equal(now) {
		t.Fatalf("exam metadata timestamps mismatch: created(%s) updated(%s) want %s", emCreated, emUpdated, now)
	}
}

// Video: Verify Timestamp round-trip
func TestToProtoLibraryItemFromVideo_TimestampRoundTrip(t *testing.T) {
	now := time.Now().UTC().Truncate(time.Second)

	video := &entity.LibraryVideo{
		ID:            "VID-1",
		Title:         "Algebra Lecture",
		Description:   ns("Video Desc"),
		Category:      ns("VIDEO"),
		FileURL:       ns("https://cdn/videos/vid1"),
		FileID:        ns("file-vid-1"),
		ThumbnailURL:  ns("thumb-vid.png"),
		FileSize:      ni64(4096),
		UploadStatus:  "approved",
		IsActive:      true,
		DownloadCount: 100,
		AverageRating: 4.8,
		ReviewCount:   20,
		UploadedBy:    ns("user-3"),
		ApprovedBy:    ns("admin-3"),
		CreatedAt:     now,
		UpdatedAt:     now,

		YoutubeURL:     "https://youtube.com/watch?v=abc",
		YoutubeID:      "abc",
		Duration:       ni32(3600),
		Quality:        ns("1080p"),
		InstructorName: ns("Dr. B"),
		RelatedExamID:  ns("EXAM-1"),
		Subject:        "Math",
		Grade:          "10",
		RequiredRole:   "STUDENT",
		RequiredLevel:  ni32(1),
		TargetRoles:    []string{"STUDENT", "TEACHER"},
		Tags:           []string{"Algebra", "Lecture"},
	}

	item := toProtoLibraryItemFromVideo(video)
	if item == nil {
		t.Fatalf("toProtoLibraryItemFromVideo returned nil")
	}
	created := item.GetCreatedAt().AsTime().UTC()
	updated := item.GetUpdatedAt().AsTime().UTC()
	if !created.Equal(now) || !updated.Equal(now) {
		t.Fatalf("timestamps mismatch: created(%s) updated(%s) want %s", created, updated, now)
	}
	if item.GetType() != v1.LibraryItemType_LIBRARY_ITEM_TYPE_VIDEO {
		t.Fatalf("type mismatch: got %v want VIDEO", item.GetType())
	}
	vm := item.GetVideo()
	if vm == nil {
		t.Fatalf("video metadata is nil")
	}
	vmCreated := vm.GetCreatedAt().AsTime().UTC()
	vmUpdated := vm.GetUpdatedAt().AsTime().UTC()
	if !vmCreated.Equal(now) || !vmUpdated.Equal(now) {
		t.Fatalf("video metadata timestamps mismatch: created(%s) updated(%s) want %s", vmCreated, vmUpdated, now)
	}
}
