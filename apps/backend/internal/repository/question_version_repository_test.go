package repository_test

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/jmoiron/sqlx"
	
	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/repository"
)

func TestQuestionVersionRepository_CreateVersion(t *testing.T) {
	// Setup test database
	db := setupTestDB(t)
	defer teardownTestDB(t, db)
	
	repo := repository.NewQuestionVersionRepository(db)
	
	// Create test data
	questionID := uuid.New()
	userID := uuid.New()
	
	version := &entity.QuestionVersion{
		ID:            uuid.New(),
		QuestionID:    questionID,
		VersionNumber: 1,
		Content:       "Test question content",
		ChangedBy:     userID,
		ChangedAt:     time.Now(),
		FullSnapshot:  []byte(`{"id":"test"}`),
	}
	
	// Test
	err := repo.CreateVersion(context.Background(), version)
	
	// Assert
	require.NoError(t, err)
	
	// Verify version was created
	retrieved, err := repo.GetVersion(context.Background(), questionID, 1)
	require.NoError(t, err)
	assert.Equal(t, version.Content, retrieved.Content)
}

func TestQuestionVersionRepository_GetVersionHistory(t *testing.T) {
	// Setup
	db := setupTestDB(t)
	defer teardownTestDB(t, db)
	
	repo := repository.NewQuestionVersionRepository(db)
	questionID := uuid.New()
	
	// Create multiple versions
	for i := 1; i <= 5; i++ {
		version := &entity.QuestionVersion{
			ID:            uuid.New(),
			QuestionID:    questionID,
			VersionNumber: int32(i),
			Content:       "Content version " + string(rune(i)),
			ChangedBy:     uuid.New(),
			ChangedAt:     time.Now(),
			FullSnapshot:  []byte(`{}`),
		}
		err := repo.CreateVersion(context.Background(), version)
		require.NoError(t, err)
	}
	
	// Test: Get version history
	items, total, err := repo.GetVersionHistory(context.Background(), questionID, 10, 0)
	
	// Assert
	require.NoError(t, err)
	assert.Equal(t, 5, total)
	assert.Len(t, items, 5)
	
	// Versions should be in descending order
	assert.Equal(t, int32(5), items[0].VersionNumber)
	assert.Equal(t, int32(1), items[4].VersionNumber)
}

func TestQuestionVersionRepository_GetVersion(t *testing.T) {
	// Setup
	db := setupTestDB(t)
	defer teardownTestDB(t, db)
	
	repo := repository.NewQuestionVersionRepository(db)
	questionID := uuid.New()
	
	// Create a version
	expectedContent := "Test content for version 1"
	version := &entity.QuestionVersion{
		ID:            uuid.New(),
		QuestionID:    questionID,
		VersionNumber: 1,
		Content:       expectedContent,
		ChangedBy:     uuid.New(),
		ChangedAt:     time.Now(),
		FullSnapshot:  []byte(`{}`),
	}
	err := repo.CreateVersion(context.Background(), version)
	require.NoError(t, err)
	
	// Test: Get specific version
	retrieved, err := repo.GetVersion(context.Background(), questionID, 1)
	
	// Assert
	require.NoError(t, err)
	assert.Equal(t, expectedContent, retrieved.Content)
	assert.Equal(t, questionID, retrieved.QuestionID)
	assert.Equal(t, int32(1), retrieved.VersionNumber)
}

func TestQuestionVersionRepository_CompareVersions(t *testing.T) {
	// Setup
	db := setupTestDB(t)
	defer teardownTestDB(t, db)
	
	repo := repository.NewQuestionVersionRepository(db)
	questionID := uuid.New()
	
	// Create version 1
	difficulty1 := "EASY"
	version1 := &entity.QuestionVersion{
		ID:            uuid.New(),
		QuestionID:    questionID,
		VersionNumber: 1,
		Content:       "Original content",
		Difficulty:    &difficulty1,
		ChangedBy:     uuid.New(),
		ChangedAt:     time.Now(),
		FullSnapshot:  []byte(`{}`),
	}
	err := repo.CreateVersion(context.Background(), version1)
	require.NoError(t, err)
	
	// Create version 2 with changes
	difficulty2 := "HARD"
	version2 := &entity.QuestionVersion{
		ID:            uuid.New(),
		QuestionID:    questionID,
		VersionNumber: 2,
		Content:       "Updated content",
		Difficulty:    &difficulty2,
		ChangedBy:     uuid.New(),
		ChangedAt:     time.Now(),
		FullSnapshot:  []byte(`{}`),
	}
	err = repo.CreateVersion(context.Background(), version2)
	require.NoError(t, err)
	
	// Test: Compare versions
	diffs, err := repo.CompareVersions(context.Background(), questionID, 1, 2)
	
	// Assert
	require.NoError(t, err)
	assert.NotEmpty(t, diffs)
	
	// Should have diffs for content and difficulty
	hasContentDiff := false
	hasDifficultyDiff := false
	
	for _, diff := range diffs {
		if diff.FieldName == "content" {
			hasContentDiff = true
			assert.Equal(t, "Original content", diff.OldValue)
			assert.Equal(t, "Updated content", diff.NewValue)
		}
		if diff.FieldName == "difficulty" {
			hasDifficultyDiff = true
			assert.Equal(t, "EASY", diff.OldValue)
			assert.Equal(t, "HARD", diff.NewValue)
		}
	}
	
	assert.True(t, hasContentDiff, "Should have content diff")
	assert.True(t, hasDifficultyDiff, "Should have difficulty diff")
}

func TestQuestionVersionRepository_GetLatestVersionNumber(t *testing.T) {
	// Setup
	db := setupTestDB(t)
	defer teardownTestDB(t, db)
	
	repo := repository.NewQuestionVersionRepository(db)
	questionID := uuid.New()
	
	// Test: No versions yet
	latest, err := repo.GetLatestVersionNumber(context.Background(), questionID)
	require.NoError(t, err)
	assert.Equal(t, int32(0), latest)
	
	// Create versions
	for i := 1; i <= 3; i++ {
		version := &entity.QuestionVersion{
			ID:            uuid.New(),
			QuestionID:    questionID,
			VersionNumber: int32(i),
			Content:       "Content",
			ChangedBy:     uuid.New(),
			ChangedAt:     time.Now(),
			FullSnapshot:  []byte(`{}`),
		}
		err := repo.CreateVersion(context.Background(), version)
		require.NoError(t, err)
	}
	
	// Test: Get latest version number
	latest, err = repo.GetLatestVersionNumber(context.Background(), questionID)
	require.NoError(t, err)
	assert.Equal(t, int32(3), latest)
}

// Helper functions for test setup
func setupTestDB(t *testing.T) *sqlx.DB {
	// TODO: Implement test database setup
	// This should create a test database connection
	// and run migrations
	t.Skip("Test database setup not implemented")
	return nil
}

func teardownTestDB(t *testing.T, db *sqlx.DB) {
	// TODO: Implement test database teardown
	// This should clean up test data and close connection
}

