package image_processing

import (
	"context"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/sirupsen/logrus"
)

// UploadResult represents the result of an image upload to Cloudinary
type UploadResult struct {
	FileID         string    // Cloudinary public ID
	WebViewLink    string    // Secure URL (direct image access)
	WebContentLink string    // Same as WebViewLink for Cloudinary
	ThumbnailLink  string    // Thumbnail URL with transformations
	UploadedAt     time.Time // Upload timestamp
}

// CloudinaryUploader handles image uploads to Cloudinary
type CloudinaryUploader struct {
	cloudName  string
	apiKey     string
	apiSecret  string
	folder     string
	useRealSDK bool
	cld        *cloudinary.Cloudinary
	logger     *logrus.Logger
}

// CloudinaryConfig holds Cloudinary configuration
type CloudinaryConfig struct {
	CloudName  string
	APIKey     string
	APISecret  string
	Folder     string
	UseRealSDK bool
}

// NewCloudinaryUploader creates a new Cloudinary uploader
func NewCloudinaryUploader(config *CloudinaryConfig, logger *logrus.Logger) (*CloudinaryUploader, error) {
	// Validate configuration
	if config.CloudName == "" || config.APIKey == "" || config.APISecret == "" {
		return nil, fmt.Errorf("Cloudinary credentials not configured")
	}

	uploader := &CloudinaryUploader{
		cloudName:  config.CloudName,
		apiKey:     config.APIKey,
		apiSecret:  config.APISecret,
		folder:     config.Folder,
		useRealSDK: config.UseRealSDK,
		logger:     logger,
	}

	// Initialize real Cloudinary client if enabled
	if config.UseRealSDK {
		cld, err := cloudinary.NewFromParams(config.CloudName, config.APIKey, config.APISecret)
		if err != nil {
			return nil, fmt.Errorf("failed to initialize Cloudinary client: %w", err)
		}
		uploader.cld = cld
		logger.WithFields(logrus.Fields{
			"cloud_name": config.CloudName,
			"folder":     config.Folder,
			"mode":       "REAL_SDK",
		}).Info("Initializing Cloudinary uploader with real SDK")
	} else {
		logger.WithFields(logrus.Fields{
			"cloud_name": config.CloudName,
			"folder":     config.Folder,
			"mode":       "SIMULATION",
		}).Info("Initializing Cloudinary uploader with simulation")
	}

	return uploader, nil
}

// UploadImage uploads an image to Cloudinary
func (u *CloudinaryUploader) UploadImage(ctx context.Context, localPath string, questionCode string, imageType string) (*UploadResult, error) {
	// Validate inputs
	if localPath == "" {
		return nil, fmt.Errorf("local path is required")
	}
	if questionCode == "" {
		return nil, fmt.Errorf("question code is required")
	}
	if imageType == "" {
		return nil, fmt.Errorf("image type is required")
	}

	// Check if file exists
	if _, err := os.Stat(localPath); err != nil {
		return nil, fmt.Errorf("file not found: %w", err)
	}

	// Generate public ID based on question code and image type
	publicID := fmt.Sprintf("%s/%s/%s_%d",
		u.folder,
		questionCode,
		imageType,
		time.Now().UnixNano())

	u.logger.WithFields(logrus.Fields{
		"local_path":    localPath,
		"question_code": questionCode,
		"image_type":    imageType,
		"public_id":     publicID,
	}).Info("Starting Cloudinary upload")

	// Choose upload method based on configuration
	var result *UploadResult
	var err error
	
	if u.useRealSDK && u.cld != nil {
		result, err = u.uploadWithRealSDK(ctx, localPath, publicID)
	} else {
		result, err = u.simulateCloudinaryUpload(ctx, localPath, publicID)
	}
	
	if err != nil {
		// Classify error for retry logic
		if u.isRetryableError(err) {
			u.logger.WithError(err).Warn("Retryable Cloudinary upload error")
			return nil, fmt.Errorf("retryable upload error: %w", err)
		}
		
		u.logger.WithError(err).Error("Non-retryable Cloudinary upload error")
		return nil, fmt.Errorf("upload failed: %w", err)
	}

	u.logger.WithFields(logrus.Fields{
		"public_id":   result.FileID,
		"secure_url":  result.WebViewLink,
		"upload_time": time.Since(result.UploadedAt),
	}).Info("Image uploaded successfully to Cloudinary")

	return result, nil
}

// uploadWithRealSDK uploads using the real Cloudinary SDK
func (u *CloudinaryUploader) uploadWithRealSDK(ctx context.Context, localPath string, publicID string) (*UploadResult, error) {
	u.logger.WithFields(logrus.Fields{
		"local_path": localPath,
		"public_id":  publicID,
	}).Info("Uploading to Cloudinary using real SDK")

	// Prepare upload parameters
	overwrite := true
	uploadParams := uploader.UploadParams{
		PublicID:     publicID,
		Folder:       u.folder,
		ResourceType: "image",
		Format:       "webp",
		Overwrite:    &overwrite,
		Tags:         []string{"exam-bank", "question-image"},
	}

	// Perform upload
	uploadResult, err := u.cld.Upload.Upload(ctx, localPath, uploadParams)
	if err != nil {
		return nil, fmt.Errorf("Cloudinary SDK upload failed: %w", err)
	}

	// Convert Cloudinary result to our UploadResult format
	result := &UploadResult{
		FileID:         uploadResult.PublicID,
		WebViewLink:    uploadResult.SecureURL,
		WebContentLink: uploadResult.SecureURL,
		ThumbnailLink:  generateThumbnailURL(uploadResult.SecureURL),
		UploadedAt:     time.Now(),
	}

	u.logger.WithFields(logrus.Fields{
		"public_id":   result.FileID,
		"secure_url":  result.WebViewLink,
		"file_size":   uploadResult.Bytes,
		"format":      uploadResult.Format,
		"version":     uploadResult.Version,
	}).Info("Successfully uploaded to Cloudinary using real SDK")

	return result, nil
}

// simulateCloudinaryUpload simulates upload with proper error handling
func (u *CloudinaryUploader) simulateCloudinaryUpload(ctx context.Context, localPath string, publicID string) (*UploadResult, error) {
	// Simulate upload delay
	time.Sleep(time.Duration(500+time.Now().UnixNano()%1500) * time.Millisecond)

	// Simulate random failures for testing retry logic
	if time.Now().UnixNano()%10 == 0 { // 10% chance
		return nil, fmt.Errorf("network timeout: connection failed")
	}
	if time.Now().UnixNano()%20 == 0 { // 5% chance
		return nil, fmt.Errorf("quota exceeded: daily upload limit reached")
	}

	// Generate mock Cloudinary URLs
	secureURL := fmt.Sprintf("https://res.cloudinary.com/%s/image/upload/v%d/%s.webp",
		u.cloudName,
		time.Now().Unix(),
		publicID)

	result := &UploadResult{
		FileID:         publicID,
		WebViewLink:    secureURL,
		WebContentLink: secureURL,
		ThumbnailLink:  generateThumbnailURL(secureURL),
		UploadedAt:     time.Now(),
	}

	return result, nil
}

// isRetryableError checks if an error is retryable
func (u *CloudinaryUploader) isRetryableError(err error) bool {
	if err == nil {
		return false
	}

	errStr := strings.ToLower(err.Error())
	retryableErrors := []string{
		"network timeout",
		"connection failed",
		"quota exceeded",
		"rate limit",
		"server error",
		"internal error",
		"service unavailable",
		"timeout",
	}

	for _, retryable := range retryableErrors {
		if strings.Contains(errStr, retryable) {
			return true
		}
	}

	return false
}

// generateThumbnailURL generates a thumbnail URL from Cloudinary
func generateThumbnailURL(secureURL string) string {
	// Cloudinary thumbnail URL format:
	// Original: https://res.cloudinary.com/cloud_name/image/upload/v123/path/file.webp
	// Thumbnail: https://res.cloudinary.com/cloud_name/image/upload/c_fill,h_200,w_200/v123/path/file.webp
	if secureURL == "" {
		return ""
	}
	
	// Replace upload/ with upload/c_fill,h_200,w_200/ to add thumbnail transformation
	if strings.Contains(secureURL, "/image/upload/") {
		return strings.Replace(secureURL, "/image/upload/", "/image/upload/c_fill,h_200,w_200/", 1)
	}
	
	// Fallback: add query parameters
	return fmt.Sprintf("%s?w=200&h=200&c=fill", secureURL)
}

// DeleteImage deletes an image from Cloudinary
func (u *CloudinaryUploader) DeleteImage(ctx context.Context, publicID string) error {
	u.logger.WithField("public_id", publicID).Info("Deleting image from Cloudinary")
	
	if u.useRealSDK && u.cld != nil {
		// Use real Cloudinary SDK to delete
		destroyParams := uploader.DestroyParams{
			PublicID:     publicID,
			ResourceType: "image",
		}
		
		destroyResult, err := u.cld.Upload.Destroy(ctx, destroyParams)
		if err != nil {
			return fmt.Errorf("failed to delete image from Cloudinary: %w", err)
		}
		
		u.logger.WithFields(logrus.Fields{
			"public_id": publicID,
			"result":    destroyResult.Result,
		}).Info("Image deleted successfully from Cloudinary using real SDK")
	} else {
		// Simulate delete operation
		time.Sleep(200 * time.Millisecond)
		u.logger.WithField("public_id", publicID).Info("Image deleted successfully from Cloudinary (simulated)")
	}
	
	return nil
}
