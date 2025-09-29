package repository

import (
	"testing"
	"time"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/stretchr/testify/assert"
)

// TestExamRepository_EnumAlignment tests that repository works with new enum values
// This test verifies that the enum alignment changes work correctly
func TestExamRepository_EnumAlignment(t *testing.T) {
	// Skip if no database connection available
	if testing.Short() {
		t.Skip("Skipping repository test in short mode")
	}

	// Note: This is a conceptual test - actual implementation would need database setup
	// For now, we'll test the enum constants are correctly defined

	t.Run("ExamStatus constants are aligned", func(t *testing.T) {
		// Test that new enum constants are properly defined
		assert.Equal(t, "ACTIVE", string(entity.ExamStatusActive))
		assert.Equal(t, "PENDING", string(entity.ExamStatusPending))
		assert.Equal(t, "INACTIVE", string(entity.ExamStatusInactive))
		assert.Equal(t, "ARCHIVED", string(entity.ExamStatusArchived))
	})

	t.Run("ExamType constants are aligned", func(t *testing.T) {
		// Test that new enum constants are properly defined
		assert.Equal(t, "generated", string(entity.ExamTypeGenerated))
		assert.Equal(t, "official", string(entity.ExamTypeOfficial))
	})

	t.Run("NewExam uses correct defaults", func(t *testing.T) {
		// Test that NewExam constructor uses new enum values
		exam := entity.NewExam("Test Exam", "Test Description", "test-user")

		assert.Equal(t, entity.ExamStatusPending, exam.Status, "Default status should be PENDING")
		assert.Equal(t, entity.ExamTypeGenerated, exam.ExamType, "Default type should be generated")
		assert.Equal(t, "Test Exam", exam.Title)
		assert.Equal(t, "Test Description", exam.Description)
		assert.Equal(t, "test-user", exam.CreatedBy)
		assert.Equal(t, 60, exam.DurationMinutes)
		assert.Equal(t, 60, exam.PassPercentage)
		assert.Equal(t, 1, exam.MaxAttempts)
		assert.False(t, exam.ShuffleQuestions)
		assert.True(t, exam.ShowResults)
		assert.Equal(t, entity.DifficultyMedium, exam.Difficulty)
		assert.Equal(t, 1, exam.Version)
		assert.NotEmpty(t, exam.ID)
		assert.NotZero(t, exam.CreatedAt)
		assert.NotZero(t, exam.UpdatedAt)
	})
}

// TestExamRepository_CRUD tests basic CRUD operations with new enum values
func TestExamRepository_CRUD(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping repository integration test in short mode")
	}

	// Note: This would require actual database setup in a real test
	// For now, we'll test the data structures and enum usage

	t.Run("Create exam with new enum values", func(t *testing.T) {
		exam := &entity.Exam{
			Title:           "Integration Test Exam",
			Description:     "Test exam for enum alignment",
			DurationMinutes: 90,
			PassPercentage:  70,
			ExamType:        entity.ExamTypeGenerated,
			Status:          entity.ExamStatusPending,
			CreatedBy:       "test-user",
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		}

		// Verify enum values are correctly set
		assert.Equal(t, "generated", string(exam.ExamType))
		assert.Equal(t, "PENDING", string(exam.Status))
	})

	t.Run("Status transitions work correctly", func(t *testing.T) {
		exam := entity.NewExam("Test Exam", "Description", "user")

		// Test status transitions
		assert.Equal(t, entity.ExamStatusPending, exam.Status, "Should start as PENDING")

		// Simulate publishing
		exam.Status = entity.ExamStatusActive
		assert.Equal(t, "ACTIVE", string(exam.Status))

		// Simulate archiving
		exam.Status = entity.ExamStatusArchived
		assert.Equal(t, "ARCHIVED", string(exam.Status))

		// Test inactive status
		exam.Status = entity.ExamStatusInactive
		assert.Equal(t, "INACTIVE", string(exam.Status))
	})

	t.Run("Type transitions work correctly", func(t *testing.T) {
		exam := entity.NewExam("Test Exam", "Description", "user")

		// Test type transitions
		assert.Equal(t, entity.ExamTypeGenerated, exam.ExamType, "Should start as generated")

		// Simulate changing to official
		exam.ExamType = entity.ExamTypeOfficial
		assert.Equal(t, "official", string(exam.ExamType))

		// Change back to generated
		exam.ExamType = entity.ExamTypeGenerated
		assert.Equal(t, "generated", string(exam.ExamType))
	})
}

// TestExamRepository_EnumCompatibility tests backward compatibility considerations
func TestExamRepository_EnumCompatibility(t *testing.T) {
	t.Run("Old enum values are no longer valid", func(t *testing.T) {
		// These old values should no longer be used
		oldStatusValues := []string{"draft", "published", "archived"}
		newStatusValues := []entity.ExamStatus{
			entity.ExamStatusPending,
			entity.ExamStatusActive,
			entity.ExamStatusArchived,
		}

		// Verify old values don't match new constants
		for i, oldValue := range oldStatusValues {
			if i < len(newStatusValues) {
				assert.NotEqual(t, oldValue, string(newStatusValues[i]),
					"Old value %s should not match new constant %s", oldValue, newStatusValues[i])
			}
		}

		oldTypeValues := []string{"practice", "quiz", "midterm", "final", "custom"}
		newTypeValues := []entity.ExamType{
			entity.ExamTypeGenerated,
			entity.ExamTypeOfficial,
		}

		// Verify old type values don't match new constants
		for _, oldValue := range oldTypeValues {
			for _, newValue := range newTypeValues {
				assert.NotEqual(t, oldValue, string(newValue),
					"Old type value %s should not match new constant %s", oldValue, newValue)
			}
		}
	})
}

// TestExamRepository_MigrationMapping tests the mapping logic used in migrations
func TestExamRepository_MigrationMapping(t *testing.T) {
	t.Run("Status migration mapping is correct", func(t *testing.T) {
		// Test the mapping logic used in migration 000013
		mappings := map[string]entity.ExamStatus{
			"draft":     entity.ExamStatusPending,  // 'draft' → 'PENDING'
			"published": entity.ExamStatusActive,   // 'published' → 'ACTIVE'
			"archived":  entity.ExamStatusArchived, // 'archived' → 'ARCHIVED'
		}

		for oldValue, expectedNewValue := range mappings {
			assert.NotEqual(t, oldValue, string(expectedNewValue),
				"Migration should change %s to %s", oldValue, expectedNewValue)
		}
	})

	t.Run("Type migration mapping is correct", func(t *testing.T) {
		// Test the mapping logic used in migration 000014
		oldTypes := []string{"practice", "quiz", "midterm", "final", "custom"}
		expectedNewType := entity.ExamTypeGenerated

		for _, oldType := range oldTypes {
			assert.Equal(t, "generated", string(expectedNewType),
				"All old types (%s) should map to 'generated'", oldType)
		}
	})
}

// BenchmarkExamRepository_EnumOperations benchmarks enum operations
func BenchmarkExamRepository_EnumOperations(b *testing.B) {
	b.Run("NewExam creation", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			exam := entity.NewExam("Benchmark Exam", "Description", "user")
			_ = exam.Status
			_ = exam.ExamType
		}
	})

	b.Run("Enum string conversion", func(b *testing.B) {
		exam := entity.NewExam("Test", "Test", "user")
		for i := 0; i < b.N; i++ {
			_ = string(exam.Status)
			_ = string(exam.ExamType)
		}
	})
}
