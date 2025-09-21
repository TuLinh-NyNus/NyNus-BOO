package image_processing

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/sirupsen/logrus"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/drive/v3"
	"google.golang.org/api/option"
)

// GoogleDriveUploader handles image uploads to Google Drive
type GoogleDriveUploader struct {
	service     *drive.Service
	config      *DriveConfig
	logger      *logrus.Logger
	folderCache map[string]string // Cache folder IDs
	retryPolicy *RetryPolicy
}

// DriveConfig holds Google Drive configuration
type DriveConfig struct {
	ClientID        string
	ClientSecret    string
	RefreshToken    string
	RootFolderID    string // Root folder for all images
	FolderStructure string // MapCode-based structure: "grade/subject/chapter/lesson/form/level"
}

// NewGoogleDriveUploader creates a new Google Drive uploader
func NewGoogleDriveUploader(config *DriveConfig, logger *logrus.Logger) (*GoogleDriveUploader, error) {
	// Validate configuration
	if config.ClientID == "" || config.ClientSecret == "" || config.RefreshToken == "" {
		return nil, fmt.Errorf("Google Drive credentials not configured")
	}
	if config.RootFolderID == "" {
		return nil, fmt.Errorf("Root folder ID not configured")
	}

	// Create OAuth2 config
	oauthConfig := &oauth2.Config{
		ClientID:     config.ClientID,
		ClientSecret: config.ClientSecret,
		Endpoint:     google.Endpoint,
		Scopes:       []string{drive.DriveFileScope},
	}

	// Create token from refresh token
	token := &oauth2.Token{
		RefreshToken: config.RefreshToken,
	}

	// Create HTTP client with token
	httpClient := oauthConfig.Client(context.Background(), token)

	// Create Drive service
	service, err := drive.NewService(context.Background(), option.WithHTTPClient(httpClient))
	if err != nil {
		return nil, fmt.Errorf("failed to create Drive service: %w", err)
	}

	return &GoogleDriveUploader{
		service:     service,
		config:      config,
		logger:      logger,
		folderCache: make(map[string]string),
		retryPolicy: &RetryPolicy{
			MaxRetries:     3,
			InitialBackoff: 2 * time.Second,
			MaxBackoff:     30 * time.Second,
			BackoffFactor:  2.0,
		},
	}, nil
}

// UploadImage uploads an image to Google Drive
func (u *GoogleDriveUploader) UploadImage(ctx context.Context, localPath string, questionCode string, imageType string) (*UploadResult, error) {
	// Validate input
	if _, err := os.Stat(localPath); err != nil {
		return nil, fmt.Errorf("file not found: %w", err)
	}

	// Parse question code to get folder structure
	folderPath, err := u.parseFolderPath(questionCode)
	if err != nil {
		return nil, fmt.Errorf("failed to parse folder path: %w", err)
	}

	// Create or get folder structure
	folderID, err := u.ensureFolderStructure(ctx, folderPath)
	if err != nil {
		return nil, fmt.Errorf("failed to create folder structure: %w", err)
	}

	// Upload with retry
	var lastError error
	for attempt := 0; attempt <= u.retryPolicy.MaxRetries; attempt++ {
		if attempt > 0 {
			backoff := u.calculateBackoff(attempt)
			u.logger.WithFields(logrus.Fields{
				"attempt": attempt,
				"backoff": backoff,
			}).Debug("Retrying upload after backoff")
			time.Sleep(backoff)
		}

		result, err := u.uploadFile(ctx, localPath, folderID, imageType)
		if err == nil {
			return result, nil
		}

		lastError = err
		u.logger.WithFields(logrus.Fields{
			"attempt": attempt,
			"error":   err,
		}).Warn("Upload attempt failed")

		// Check if error is retryable
		if !u.isRetryableError(err) {
			break
		}
	}

	return nil, fmt.Errorf("upload failed after %d retries: %w", u.retryPolicy.MaxRetries, lastError)
}

// UploadResult contains upload result information
type UploadResult struct {
	FileID         string // Google Drive file ID
	WebViewLink    string // Link to view in browser
	WebContentLink string // Direct download link
	ThumbnailLink  string // Thumbnail link if available
	UploadedAt     time.Time
}

// uploadFile performs the actual file upload
func (u *GoogleDriveUploader) uploadFile(ctx context.Context, localPath string, parentFolderID string, imageType string) (*UploadResult, error) {
	// Open local file
	file, err := os.Open(localPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open file: %w", err)
	}
	defer file.Close()

	// Get file info
	fileInfo, err := file.Stat()
	if err != nil {
		return nil, fmt.Errorf("failed to get file info: %w", err)
	}

	// Create file metadata
	fileName := fmt.Sprintf("%s_%s_%s",
		filepath.Base(localPath),
		imageType,
		time.Now().Format("20060102_150405"))

	driveFile := &drive.File{
		Name:     fileName,
		Parents:  []string{parentFolderID},
		MimeType: "image/webp",
		Properties: map[string]string{
			"questionType": imageType,
			"uploadedAt":   time.Now().Format(time.RFC3339),
		},
	}

	// Create upload call
	call := u.service.Files.Create(driveFile).
		Media(file).
		SupportsAllDrives(true).
		Fields("id, webViewLink, webContentLink, thumbnailLink")

	// Set context
	call = call.Context(ctx)

	// Perform upload with progress tracking
	u.logger.WithFields(logrus.Fields{
		"file_name": fileName,
		"file_size": fileInfo.Size(),
		"parent":    parentFolderID,
	}).Info("Starting file upload")

	uploadedFile, err := call.Do()
	if err != nil {
		return nil, fmt.Errorf("upload failed: %w", err)
	}

	// Make file publicly accessible
	permission := &drive.Permission{
		Type: "anyone",
		Role: "reader",
	}

	_, err = u.service.Permissions.Create(uploadedFile.Id, permission).
		SupportsAllDrives(true).
		Context(ctx).
		Do()
	if err != nil {
		u.logger.WithError(err).Warn("Failed to set public permission")
		// Not a critical error, continue
	}

	result := &UploadResult{
		FileID:         uploadedFile.Id,
		WebViewLink:    uploadedFile.WebViewLink,
		WebContentLink: uploadedFile.WebContentLink,
		ThumbnailLink:  uploadedFile.ThumbnailLink,
		UploadedAt:     time.Now(),
	}

	u.logger.WithFields(logrus.Fields{
		"file_id":     result.FileID,
		"web_link":    result.WebViewLink,
		"upload_time": time.Since(result.UploadedAt),
	}).Info("File uploaded successfully")

	return result, nil
}

// parseFolderPath parses question code to folder path
func (u *GoogleDriveUploader) parseFolderPath(questionCode string) (string, error) {
	// Remove brackets if present
	questionCode = strings.Trim(questionCode, "[]")

	// Check format (ID5 or ID6)
	parts := strings.Split(questionCode, "-")
	baseCode := parts[0]

	if len(baseCode) < 5 {
		return "", fmt.Errorf("invalid question code: %s", questionCode)
	}

	// Parse components
	grade := string(baseCode[0])
	subject := string(baseCode[1])
	chapter := string(baseCode[2])
	level := string(baseCode[3])
	lesson := string(baseCode[4])

	// Build path: grade/subject/chapter/lesson/level
	path := fmt.Sprintf("%s/%s/%s/%s/%s", grade, subject, chapter, lesson, level)

	// Add form if ID6 format
	if len(parts) > 1 && len(parts[1]) > 0 {
		form := parts[1]
		path = fmt.Sprintf("%s/%s", path, form)
	}

	return path, nil
}

// ensureFolderStructure creates or gets the folder structure
func (u *GoogleDriveUploader) ensureFolderStructure(ctx context.Context, folderPath string) (string, error) {
	// Check cache first
	if cachedID, exists := u.folderCache[folderPath]; exists {
		return cachedID, nil
	}

	// Split path into components
	components := strings.Split(folderPath, "/")
	currentParentID := u.config.RootFolderID

	// Create each folder level if needed
	currentPath := ""
	for _, component := range components {
		if component == "" {
			continue
		}

		if currentPath != "" {
			currentPath += "/"
		}
		currentPath += component

		// Check cache for this level
		if cachedID, exists := u.folderCache[currentPath]; exists {
			currentParentID = cachedID
			continue
		}

		// Check if folder exists
		folderID, err := u.findFolder(ctx, component, currentParentID)
		if err != nil {
			return "", fmt.Errorf("failed to find folder %s: %w", component, err)
		}

		if folderID == "" {
			// Create folder
			folderID, err = u.createFolder(ctx, component, currentParentID)
			if err != nil {
				return "", fmt.Errorf("failed to create folder %s: %w", component, err)
			}
			u.logger.WithFields(logrus.Fields{
				"folder_name": component,
				"folder_id":   folderID,
				"parent_id":   currentParentID,
			}).Debug("Created folder")
		}

		// Cache the folder ID
		u.folderCache[currentPath] = folderID
		currentParentID = folderID
	}

	return currentParentID, nil
}

// findFolder finds a folder by name in parent
func (u *GoogleDriveUploader) findFolder(ctx context.Context, name string, parentID string) (string, error) {
	query := fmt.Sprintf("name='%s' and '%s' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false",
		name, parentID)

	fileList, err := u.service.Files.List().
		Q(query).
		Fields("files(id, name)").
		SupportsAllDrives(true).
		Context(ctx).
		Do()

	if err != nil {
		return "", err
	}

	if len(fileList.Files) > 0 {
		return fileList.Files[0].Id, nil
	}

	return "", nil
}

// createFolder creates a new folder
func (u *GoogleDriveUploader) createFolder(ctx context.Context, name string, parentID string) (string, error) {
	folder := &drive.File{
		Name:     name,
		MimeType: "application/vnd.google-apps.folder",
		Parents:  []string{parentID},
	}

	createdFolder, err := u.service.Files.Create(folder).
		SupportsAllDrives(true).
		Fields("id").
		Context(ctx).
		Do()

	if err != nil {
		return "", err
	}

	return createdFolder.Id, nil
}

// DeleteImage deletes an image from Google Drive
func (u *GoogleDriveUploader) DeleteImage(ctx context.Context, fileID string) error {
	err := u.service.Files.Delete(fileID).
		SupportsAllDrives(true).
		Context(ctx).
		Do()

	if err != nil {
		return fmt.Errorf("failed to delete file: %w", err)
	}

	u.logger.WithField("file_id", fileID).Info("File deleted from Google Drive")
	return nil
}

// GetImageInfo gets information about an uploaded image
func (u *GoogleDriveUploader) GetImageInfo(ctx context.Context, fileID string) (*drive.File, error) {
	file, err := u.service.Files.Get(fileID).
		Fields("*").
		SupportsAllDrives(true).
		Context(ctx).
		Do()

	if err != nil {
		return nil, fmt.Errorf("failed to get file info: %w", err)
	}

	return file, nil
}

// calculateBackoff calculates backoff duration
func (u *GoogleDriveUploader) calculateBackoff(attempt int) time.Duration {
	backoff := float64(u.retryPolicy.InitialBackoff) *
		pow(u.retryPolicy.BackoffFactor, float64(attempt-1))

	if backoff > float64(u.retryPolicy.MaxBackoff) {
		backoff = float64(u.retryPolicy.MaxBackoff)
	}

	return time.Duration(backoff)
}

// isRetryableError checks if an error is retryable
func (u *GoogleDriveUploader) isRetryableError(err error) bool {
	// Check for rate limit or quota errors
	errStr := err.Error()
	retryableErrors := []string{
		"quotaExceeded",
		"rateLimitExceeded",
		"userRateLimitExceeded",
		"backendError",
		"internalError",
		"unavailable",
	}

	for _, retryable := range retryableErrors {
		if strings.Contains(strings.ToLower(errStr), strings.ToLower(retryable)) {
			return true
		}
	}

	return false
}
