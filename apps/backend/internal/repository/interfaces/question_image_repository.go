package interfaces

import (
	"context"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
)

// QuestionImageRepository defines the interface for question image operations
type QuestionImageRepository interface {
	// CRUD operations
	Create(ctx context.Context, image *entity.QuestionImage) error
	GetByID(ctx context.Context, id string) (*entity.QuestionImage, error)
	GetByQuestionID(ctx context.Context, questionID string) ([]*entity.QuestionImage, error)
	Update(ctx context.Context, image *entity.QuestionImage) error
	Delete(ctx context.Context, id string) error

	// Batch operations
	CreateBatch(ctx context.Context, images []*entity.QuestionImage) error
	GetByQuestionIDs(ctx context.Context, questionIDs []string) (map[string][]*entity.QuestionImage, error)
	DeleteByQuestionID(ctx context.Context, questionID string) error

	// Status operations
	UpdateStatus(ctx context.Context, id string, status string) error
	GetByStatus(ctx context.Context, status string, limit int) ([]*entity.QuestionImage, error)
	GetPendingImages(ctx context.Context, limit int) ([]*entity.QuestionImage, error)
	GetFailedImages(ctx context.Context, limit int) ([]*entity.QuestionImage, error)

	// Drive operations
	UpdateDriveInfo(ctx context.Context, id string, driveURL string, driveFileID string) error
	GetImagesWithoutDrive(ctx context.Context, limit int) ([]*entity.QuestionImage, error)

	// Statistics
	CountByStatus(ctx context.Context) (map[string]int, error)
	CountByQuestionID(ctx context.Context, questionID string) (int, error)
}
