package image_upload

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/repository"
	"exam-bank-system/apps/backend/internal/service/system/image_processing"
	"exam-bank-system/apps/backend/internal/util"
)

// ImageUploadMgmt manages image uploads with comprehensive error handling
type ImageUploadMgmt struct {
	imageRepo       *repository.QuestionImageRepository
	uploadErrorRepo *repository.ImageUploadErrorRepository
	uploader        *image_processing.GoogleDriveUploader
	processor       *image_processing.ImageProcessingService
	retryPolicy     *entity.ImageUploadRetryPolicy
	cleanupPolicy   *entity.ImageCacheCleanupPolicy
	logger          *logrus.Logger
}

// NewImageUploadMgmt creates a new image upload management service
func NewImageUploadMgmt(
	imageRepo *repository.QuestionImageRepository,
	uploadErrorRepo *repository.ImageUploadErrorRepository,
	uploader *image_processing.GoogleDriveUploader,
	processor *image_processing.ImageProcessingService,
	logger *logrus.Logger,
) *ImageUploadMgmt {
	return &ImageUploadMgmt{
		imageRepo:       imageRepo,
		uploadErrorRepo: uploadErrorRepo,
		uploader:        uploader,
		processor:       processor,
		retryPolicy:     entity.DefaultImageUploadRetryPolicy(),
		cleanupPolicy:   entity.DefaultImageCacheCleanupPolicy(),
		logger:          logger,
	}
}

// UploadImageWithErrorHandling uploads an image with comprehensive error handling
func (m *ImageUploadMgmt) UploadImageWithErrorHandling(ctx context.Context, questionID string, tikzCode string, imageType entity.ImageType) (*entity.ImageUploadResult, error) {
	result := &entity.ImageUploadResult{
		Success:     false,
		Errors:      []entity.ImageUploadError{},
		Warnings:    []entity.ImageUploadError{},
		Suggestions: []string{},
		CanRetry:    true,
	}

	startTime := time.Now()

	// Create image entity
	image := &entity.QuestionImage{
		ID:         util.StringToPgText(uuid.New().String()),
		QuestionID: util.StringToPgText(questionID),
		Type:       util.StringToPgText(string(imageType)),
		Status:     util.StringToPgText(string(entity.ImageStatusPending)),
		TikzCode:   util.StringToPgText(tikzCode),
	}

	// Save image with pending status
	err := m.imageRepo.Create(ctx, image)
	if err != nil {
		return nil, fmt.Errorf("failed to create image record: %w", err)
	}

	imageID := image.ID.String
	result.Image = image

	// Process TikZ to WebP
	localPath, err := m.processTikZWithErrorHandling(ctx, imageID, tikzCode)
	if err != nil {
		uploadError := m.createUploadError(imageID, entity.ImageUploadErrorTypeConversion, entity.ImageUploadErrorSeverityError,
			fmt.Sprintf("TikZ processing failed: %v", err), "Kiá»ƒm tra láº¡i cÃº phÃ¡p TikZ hoáº·c thá»­ vá»›i code Ä‘Æ¡n giáº£n hÆ¡n")
		result.Errors = append(result.Errors, uploadError)

		// Save error and update image status
		m.saveUploadError(ctx, &uploadError)
		m.updateImageStatus(ctx, imageID, entity.ImageStatusFailed)

		result.UploadTime = time.Since(startTime)
		return result, nil
	}

	result.LocalPath = localPath

	// Get file size
	if fileInfo, err := os.Stat(localPath); err == nil {
		result.FileSize = fileInfo.Size()
	}

	// Update image status to uploading
	m.updateImageStatus(ctx, imageID, entity.ImageStatusUploading)

	// Upload to Google Drive with retry
	uploadResult, err := m.uploadWithRetry(ctx, imageID, localPath, questionID, string(imageType))
	if err != nil {
		uploadError := m.createUploadError(imageID, m.classifyUploadError(err), entity.ImageUploadErrorSeverityError,
			fmt.Sprintf("Upload failed: %v", err), m.getUploadErrorSuggestion(err))
		result.Errors = append(result.Errors, uploadError)

		// Save error and update image status
		m.saveUploadError(ctx, &uploadError)
		m.updateImageStatus(ctx, imageID, entity.ImageStatusFailed)

		// Schedule retry if retryable
		if m.retryPolicy.IsRetryable(uploadError.Type) {
			nextRetry := time.Now().Add(m.retryPolicy.CalculateNextRetryDelay(1))
			uploadError.NextRetryAt = util.TimestamptzToPgType(nextRetry)
			result.NextRetryAt = &nextRetry
			result.CanRetry = true
		} else {
			result.CanRetry = false
		}

		result.UploadTime = time.Since(startTime)
		return result, nil
	}

	// Upload successful - update image with remote URLs
	image.Status = util.StringToPgText(string(entity.ImageStatusUploaded))
	image.WebViewLink = util.StringToPgText(uploadResult.WebViewLink)
	image.WebContentLink = util.StringToPgText(uploadResult.WebContentLink)
	image.ThumbnailLink = util.StringToPgText(uploadResult.ThumbnailLink)
	image.DriveFileID = util.StringToPgText(uploadResult.FileID)

	err = m.imageRepo.Update(ctx, image)
	if err != nil {
		m.logger.WithError(err).Error("Failed to update image with upload results")
		// This is a warning, not a failure
		warning := m.createUploadError(imageID, entity.ImageUploadErrorTypeValidation, entity.ImageUploadErrorSeverityWarning,
			"Failed to update image record", "Image uploaded successfully but database update failed")
		result.Warnings = append(result.Warnings, warning)
		m.saveUploadError(ctx, &warning)
	}

	// Clean up local file if policy allows
	if !m.cleanupPolicy.KeepSuccessful {
		m.cleanupLocalFile(localPath)
	}

	// Save upload history
	history := &entity.ImageUploadHistory{
		ID:           util.StringToPgText(uuid.New().String()),
		ImageID:      util.StringToPgText(imageID),
		AttemptCount: util.Int32ToPgInt4(1),
		LastAttempt:  util.TimestamptzToPgType(time.Now()),
		Status:       util.StringToPgText(string(entity.ImageStatusUploaded)),
		LastError:    util.StringToPgText(""),
		CreatedAt:    util.TimestamptzToPgType(time.Now()),
		UpdatedAt:    util.TimestamptzToPgType(time.Now()),
	}
	m.uploadErrorRepo.SaveImageUploadHistory(ctx, history)

	result.Success = true
	result.RemotePath = uploadResult.WebViewLink
	result.UploadTime = time.Since(startTime)
	result.Suggestions = []string{"Upload thÃ nh cÃ´ng"}

	return result, nil
}

// processTikZWithErrorHandling processes TikZ code with error handling
func (m *ImageUploadMgmt) processTikZWithErrorHandling(ctx context.Context, imageID string, tikzCode string) (string, error) {
	// Validate TikZ code
	if strings.TrimSpace(tikzCode) == "" {
		return "", fmt.Errorf("TikZ code is empty")
	}

	// Process TikZ
	outputName := fmt.Sprintf("image_%s", imageID)
	localPath, err := m.processor.ProcessTikZ(ctx, tikzCode, outputName)
	if err != nil {
		m.logger.WithError(err).WithField("image_id", imageID).Error("TikZ processing failed")
		return "", err
	}

	// Validate output file
	if _, err := os.Stat(localPath); err != nil {
		return "", fmt.Errorf("processed image file not found: %w", err)
	}

	return localPath, nil
}

// uploadWithRetry uploads file with retry mechanism
func (m *ImageUploadMgmt) uploadWithRetry(ctx context.Context, imageID string, localPath string, questionCode string, imageType string) (*image_processing.UploadResult, error) {
	var lastError error

	for attempt := 1; attempt <= m.retryPolicy.MaxRetries; attempt++ {
		if attempt > 1 {
			backoff := m.retryPolicy.CalculateNextRetryDelay(attempt - 1)
			m.logger.WithFields(logrus.Fields{
				"image_id": imageID,
				"attempt":  attempt,
				"backoff":  backoff,
			}).Info("Retrying upload after backoff")
			time.Sleep(backoff)
		}

		result, err := m.uploader.UploadImage(ctx, localPath, questionCode, imageType)
		if err == nil {
			return result, nil
		}

		lastError = err
		errorType := m.classifyUploadError(err)

		m.logger.WithFields(logrus.Fields{
			"image_id":   imageID,
			"attempt":    attempt,
			"error":      err,
			"error_type": errorType,
		}).Warn("Upload attempt failed")

		// Save intermediate error
		uploadError := m.createUploadError(imageID, errorType, entity.ImageUploadErrorSeverityError,
			fmt.Sprintf("Upload attempt %d failed: %v", attempt, err), m.getUploadErrorSuggestion(err))
		uploadError.AttemptCount = util.IntToPgInt4(int32(attempt))
		m.saveUploadError(ctx, &uploadError)

		// Check if error is retryable
		if !m.retryPolicy.IsRetryable(errorType) {
			break
		}
	}

	return nil, fmt.Errorf("upload failed after %d attempts: %w", m.retryPolicy.MaxRetries, lastError)
}

// classifyUploadError classifies an upload error by type
func (m *ImageUploadMgmt) classifyUploadError(err error) entity.ImageUploadErrorType {
	errStr := strings.ToLower(err.Error())

	if strings.Contains(errStr, "quota") || strings.Contains(errStr, "limit") {
		return entity.ImageUploadErrorTypeQuota
	}
	if strings.Contains(errStr, "permission") || strings.Contains(errStr, "unauthorized") {
		return entity.ImageUploadErrorTypePermission
	}
	if strings.Contains(errStr, "network") || strings.Contains(errStr, "connection") {
		return entity.ImageUploadErrorTypeNetwork
	}
	if strings.Contains(errStr, "timeout") {
		return entity.ImageUploadErrorTypeTimeout
	}
	if strings.Contains(errStr, "file") || strings.Contains(errStr, "disk") {
		return entity.ImageUploadErrorTypeFileSystem
	}
	if strings.Contains(errStr, "convert") || strings.Contains(errStr, "tikz") {
		return entity.ImageUploadErrorTypeConversion
	}
	if strings.Contains(errStr, "invalid") || strings.Contains(errStr, "validation") {
		return entity.ImageUploadErrorTypeValidation
	}

	return entity.ImageUploadErrorTypeUnknown
}

// getUploadErrorSuggestion returns a suggestion based on error
func (m *ImageUploadMgmt) getUploadErrorSuggestion(err error) string {
	errorType := m.classifyUploadError(err)
	suggestions := entity.GetImageUploadSuggestions(errorType, nil)

	if len(suggestions) > 0 {
		return suggestions[0].Action
	}

	return "Thá»­ láº¡i hoáº·c liÃªn há»‡ support náº¿u váº¥n Ä‘á» tiáº¿p tá»¥c"
}

// createUploadError creates an upload error entity
func (m *ImageUploadMgmt) createUploadError(imageID string, errorType entity.ImageUploadErrorType, severity entity.ImageUploadErrorSeverity, message string, suggestion string) entity.ImageUploadError {
	return entity.ImageUploadError{
		ID:           util.StringToPgText(uuid.New().String()),
		ImageID:      util.StringToPgText(imageID),
		Type:         errorType,
		Severity:     severity,
		Message:      util.StringToPgText(message),
		Suggestion:   util.StringToPgText(suggestion),
		Context:      util.StringToPgText("image_upload"),
		AttemptCount: util.IntToPgInt4(1),
		LastAttempt:  util.TimestamptzToPgType(time.Now()),
		IsRetryable:  util.BoolToPgBool(m.retryPolicy.IsRetryable(errorType)),
		CreatedAt:    util.TimestamptzToPgType(time.Now()),
		UpdatedAt:    util.TimestamptzToPgType(time.Now()),
	}
}

// saveUploadError saves an upload error to database
func (m *ImageUploadMgmt) saveUploadError(ctx context.Context, uploadError *entity.ImageUploadError) {
	err := m.uploadErrorRepo.SaveImageUploadError(ctx, uploadError)
	if err != nil {
		m.logger.WithError(err).Error("Failed to save upload error")
	}
}

// updateImageStatus updates image status
func (m *ImageUploadMgmt) updateImageStatus(ctx context.Context, imageID string, status entity.ImageStatus) {
	image, err := m.imageRepo.GetByID(ctx, imageID)
	if err != nil {
		m.logger.WithError(err).Error("Failed to get image for status update")
		return
	}

	if image != nil {
		image.Status = util.StringToPgText(string(status))
		err = m.imageRepo.Update(ctx, image)
		if err != nil {
			m.logger.WithError(err).Error("Failed to update image status")
		}
	}
}

// cleanupLocalFile removes local file
func (m *ImageUploadMgmt) cleanupLocalFile(localPath string) {
	err := os.Remove(localPath)
	if err != nil {
		m.logger.WithError(err).WithField("path", localPath).Warn("Failed to cleanup local file")
	} else {
		m.logger.WithField("path", localPath).Debug("Cleaned up local file")
	}
}

// RetryFailedUploads retries failed image uploads
func (m *ImageUploadMgmt) RetryFailedUploads(ctx context.Context, limit int) (map[string]*entity.ImageUploadResult, error) {
	// Get retryable errors
	retryableErrors, err := m.uploadErrorRepo.GetRetryableImageErrors(ctx, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get retryable errors: %w", err)
	}

	results := make(map[string]*entity.ImageUploadResult)

	for _, uploadError := range retryableErrors {
		imageID := util.PgTextToString(uploadError.ImageID)

		// Get image details
		image, err := m.imageRepo.GetByID(ctx, imageID)
		if err != nil {
			m.logger.WithError(err).WithField("image_id", imageID).Error("Failed to get image for retry")
			continue
		}

		if image == nil {
			m.logger.WithField("image_id", imageID).Warn("Image not found for retry")
			continue
		}

		// Retry upload
		result, err := m.retryImageUpload(ctx, image, &uploadError)
		if err != nil {
			m.logger.WithError(err).WithField("image_id", imageID).Error("Failed to retry image upload")
			// Create error result
			result = &entity.ImageUploadResult{
				Success: false,
				Image:   image,
				Errors: []entity.ImageUploadError{
					m.createUploadError(imageID, entity.ImageUploadErrorTypeUnknown, entity.ImageUploadErrorSeverityError,
						fmt.Sprintf("Retry failed: %v", err), "Manual intervention required"),
				},
				CanRetry: false,
			}
		}

		results[imageID] = result
	}

	return results, nil
}

// retryImageUpload retries upload for a specific image
func (m *ImageUploadMgmt) retryImageUpload(ctx context.Context, image *entity.QuestionImage, lastError *entity.ImageUploadError) (*entity.ImageUploadResult, error) {
	imageID := util.PgTextToString(image.ID)
	tikzCode := util.PgTextToString(image.TikzCode)
	questionID := util.PgTextToString(image.QuestionID)
	imageType := entity.ImageType(util.PgTextToString(image.Type))

	// Check retry limits
	attemptCount := int(util.PgInt4ToInt32(lastError.AttemptCount))
	if attemptCount >= m.retryPolicy.MaxRetries {
		// Mark as non-retryable
		m.uploadErrorRepo.MarkErrorAsNonRetryable(ctx, util.PgTextToString(lastError.ID),
			fmt.Sprintf("Maximum retry attempts (%d) exceeded", m.retryPolicy.MaxRetries))

		return &entity.ImageUploadResult{
			Success:  false,
			Image:    image,
			CanRetry: false,
			Errors: []entity.ImageUploadError{
				m.createUploadError(imageID, entity.ImageUploadErrorTypeUnknown, entity.ImageUploadErrorSeverityError,
					"Maximum retry attempts exceeded", "Manual intervention required"),
			},
		}, nil
	}

	// Clear existing errors for this image
	m.uploadErrorRepo.ClearImageUploadErrors(ctx, imageID)

	// Retry the upload process
	return m.UploadImageWithErrorHandling(ctx, questionID, tikzCode, imageType)
}

// GetImageUploadErrors retrieves upload errors for an image
func (m *ImageUploadMgmt) GetImageUploadErrors(ctx context.Context, imageID string) ([]entity.ImageUploadError, error) {
	return m.uploadErrorRepo.GetImageUploadErrors(ctx, imageID)
}

// GetImageUploadHistory retrieves upload history for an image
func (m *ImageUploadMgmt) GetImageUploadHistory(ctx context.Context, imageID string) (*entity.ImageUploadHistory, error) {
	return m.uploadErrorRepo.GetImageUploadHistory(ctx, imageID)
}

// GetUploadStatistics retrieves comprehensive upload statistics
func (m *ImageUploadMgmt) GetUploadStatistics(ctx context.Context) (*entity.ImageUploadStatistics, error) {
	statsMap, err := m.uploadErrorRepo.GetImageUploadStatistics(ctx)
	if err != nil {
		return nil, err
	}

	// Convert map to structured statistics
	stats := &entity.ImageUploadStatistics{
		TotalUploads:      int64(statsMap["total_errors"].(int)),
		SuccessfulUploads: 0, // Would need additional query for successful uploads
		FailedUploads:     int64(statsMap["error_count"].(int)),
		RetryCount:        int64(statsMap["retryable_errors"].(int)),
		AverageUploadTime: 0, // Would need additional data
		ErrorsByType:      make(map[entity.ImageUploadErrorType]int64),
		ErrorsBySeverity:  make(map[entity.ImageUploadErrorSeverity]int64),
		LastUpdated:       time.Now(),
	}

	return stats, nil
}

// ScheduleAutoRetry schedules automatic retry for failed uploads
func (m *ImageUploadMgmt) ScheduleAutoRetry(ctx context.Context) error {
	// Get retryable uploads
	results, err := m.RetryFailedUploads(ctx, 10) // Limit to 10 at a time
	if err != nil {
		return fmt.Errorf("failed to retry failed uploads: %w", err)
	}

	if len(results) == 0 {
		m.logger.Info("No failed uploads available for auto-retry")
		return nil
	}

	m.logger.WithField("count", len(results)).Info("Starting auto-retry for failed uploads")

	// Log results
	successCount := 0
	for imageID, result := range results {
		if result.Success {
			successCount++
			m.logger.WithField("image_id", imageID).Info("Auto-retry successful")
		} else {
			m.logger.WithField("image_id", imageID).Warn("Auto-retry failed")
		}
	}

	m.logger.WithFields(logrus.Fields{
		"total":   len(results),
		"success": successCount,
		"failed":  len(results) - successCount,
	}).Info("Auto-retry batch completed")

	return nil
}

// CleanupLocalCache cleans up local cache based on policy
func (m *ImageUploadMgmt) CleanupLocalCache(ctx context.Context, cacheDir string) error {
	if cacheDir == "" {
		return fmt.Errorf("cache directory not specified")
	}

	// Walk through cache directory
	err := filepath.Walk(cacheDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Skip directories
		if info.IsDir() {
			return nil
		}

		// Check file age
		if time.Since(info.ModTime()) > m.cleanupPolicy.MaxAge {
			m.logger.WithField("path", path).Debug("Removing old cache file")
			return os.Remove(path)
		}

		return nil
	})

	if err != nil {
		return fmt.Errorf("failed to cleanup cache: %w", err)
	}

	return nil
}

