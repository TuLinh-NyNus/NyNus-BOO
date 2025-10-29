package storage

import (
	"context"
	"fmt"
	"io"
	"time"

	"github.com/sirupsen/logrus"
	"google.golang.org/api/drive/v3"
	"google.golang.org/api/option"
)

// GoogleDriveService handles Google Drive operations
type GoogleDriveService struct {
	service    *drive.Service
	logger     *logrus.Logger
	folderID   string // Root folder ID for library items
	maxRetries int
}

// GoogleDriveConfig holds configuration for Google Drive service
type GoogleDriveConfig struct {
	CredentialsJSON string
	FolderID        string
	MaxRetries      int
}

// UploadResult contains information about an uploaded file
type UploadResult struct {
	FileID       string
	FileName     string
	MimeType     string
	Size         int64
	ViewURL      string
	DownloadURL  string
	ThumbnailURL string
	CreatedAt    time.Time
}

// DownloadOptions contains options for downloading files
type DownloadOptions struct {
	FileID      string
	ContentType string
}

// NewGoogleDriveService creates a new Google Drive service
// Note: Requires valid Google Cloud credentials JSON
func NewGoogleDriveService(config GoogleDriveConfig, logger *logrus.Logger) (*GoogleDriveService, error) {
	// Initialize Google Drive service
	// TODO: This requires actual credentials from environment or config
	ctx := context.Background()

	if config.CredentialsJSON == "" {
		logger.Warn("Google Drive credentials not provided - service will be in stub mode")
		return &GoogleDriveService{
			service:    nil, // Stub mode
			logger:     logger,
			folderID:   config.FolderID,
			maxRetries: config.MaxRetries,
		}, nil
	}

	service, err := drive.NewService(ctx, option.WithCredentialsJSON([]byte(config.CredentialsJSON)))
	if err != nil {
		return nil, fmt.Errorf("failed to create Drive service: %w", err)
	}

	logger.Info("Google Drive service initialized successfully")

	return &GoogleDriveService{
		service:    service,
		logger:     logger,
		folderID:   config.FolderID,
		maxRetries: maxRetries(config.MaxRetries),
	}, nil
}

// UploadFile uploads a file to Google Drive
func (s *GoogleDriveService) UploadFile(ctx context.Context, filename string, mimeType string, content io.Reader) (*UploadResult, error) {
	if s.service == nil {
		return nil, fmt.Errorf("Google Drive service not initialized - please provide valid credentials")
	}

	s.logger.WithFields(logrus.Fields{
		"filename":  filename,
		"mime_type": mimeType,
		"folder_id": s.folderID,
	}).Info("Uploading file to Google Drive")

	// Create file metadata
	file := &drive.File{
		Name:     filename,
		Parents:  []string{s.folderID},
		MimeType: mimeType,
	}

	// Upload with retry logic
	var uploadedFile *drive.File
	var err error

	for attempt := 0; attempt <= s.maxRetries; attempt++ {
		if attempt > 0 {
			s.logger.WithField("attempt", attempt).Warn("Retrying upload")
			time.Sleep(time.Duration(attempt) * time.Second)
		}

		uploadedFile, err = s.service.Files.Create(file).
			Context(ctx).
			Media(content).
			Fields("id, name, mimeType, size, webViewLink, webContentLink, thumbnailLink, createdTime").
			Do()

		if err == nil {
			break
		}

		s.logger.WithError(err).WithField("attempt", attempt).Warn("Upload attempt failed")
	}

	if err != nil {
		return nil, fmt.Errorf("failed to upload file after %d attempts: %w", s.maxRetries, err)
	}

	s.logger.WithFields(logrus.Fields{
		"file_id":   uploadedFile.Id,
		"file_name": uploadedFile.Name,
	}).Info("File uploaded successfully")

	// Parse created time
	createdAt, _ := time.Parse(time.RFC3339, uploadedFile.CreatedTime)

	return &UploadResult{
		FileID:       uploadedFile.Id,
		FileName:     uploadedFile.Name,
		MimeType:     uploadedFile.MimeType,
		Size:         uploadedFile.Size,
		ViewURL:      uploadedFile.WebViewLink,
		DownloadURL:  uploadedFile.WebContentLink,
		ThumbnailURL: uploadedFile.ThumbnailLink,
		CreatedAt:    createdAt,
	}, nil
}

// GetDownloadURL generates a download URL for a file
func (s *GoogleDriveService) GetDownloadURL(ctx context.Context, fileID string) (string, error) {
	if s.service == nil {
		return "", fmt.Errorf("Google Drive service not initialized")
	}

	file, err := s.service.Files.Get(fileID).
		Context(ctx).
		Fields("webContentLink").
		Do()

	if err != nil {
		return "", fmt.Errorf("failed to get file info: %w", err)
	}

	return file.WebContentLink, nil
}

// GetFileInfo retrieves metadata for a file
func (s *GoogleDriveService) GetFileInfo(ctx context.Context, fileID string) (*UploadResult, error) {
	if s.service == nil {
		return nil, fmt.Errorf("Google Drive service not initialized")
	}

	file, err := s.service.Files.Get(fileID).
		Context(ctx).
		Fields("id, name, mimeType, size, webViewLink, webContentLink, thumbnailLink, createdTime").
		Do()

	if err != nil {
		return nil, fmt.Errorf("failed to get file info: %w", err)
	}

	createdAt, _ := time.Parse(time.RFC3339, file.CreatedTime)

	return &UploadResult{
		FileID:       file.Id,
		FileName:     file.Name,
		MimeType:     file.MimeType,
		Size:         file.Size,
		ViewURL:      file.WebViewLink,
		DownloadURL:  file.WebContentLink,
		ThumbnailURL: file.ThumbnailLink,
		CreatedAt:    createdAt,
	}, nil
}

// DeleteFile deletes a file from Google Drive
func (s *GoogleDriveService) DeleteFile(ctx context.Context, fileID string) error {
	if s.service == nil {
		return fmt.Errorf("Google Drive service not initialized")
	}

	err := s.service.Files.Delete(fileID).Context(ctx).Do()
	if err != nil {
		return fmt.Errorf("failed to delete file: %w", err)
	}

	s.logger.WithField("file_id", fileID).Info("File deleted successfully")
	return nil
}

// GenerateThumbnail generates a thumbnail for a file
// Note: Google Drive automatically generates thumbnails for supported file types
func (s *GoogleDriveService) GenerateThumbnail(ctx context.Context, fileID string) (string, error) {
	if s.service == nil {
		return "", fmt.Errorf("Google Drive service not initialized")
	}

	file, err := s.service.Files.Get(fileID).
		Context(ctx).
		Fields("thumbnailLink").
		Do()

	if err != nil {
		return "", fmt.Errorf("failed to get thumbnail: %w", err)
	}

	if file.ThumbnailLink == "" {
		return "", fmt.Errorf("no thumbnail available for this file")
	}

	return file.ThumbnailLink, nil
}

// CreateFolder creates a new folder in Google Drive
func (s *GoogleDriveService) CreateFolder(ctx context.Context, folderName string, parentID string) (string, error) {
	if s.service == nil {
		return "", fmt.Errorf("Google Drive service not initialized")
	}

	if parentID == "" {
		parentID = s.folderID
	}

	folder := &drive.File{
		Name:     folderName,
		MimeType: "application/vnd.google-apps.folder",
		Parents:  []string{parentID},
	}

	createdFolder, err := s.service.Files.Create(folder).
		Context(ctx).
		Fields("id").
		Do()

	if err != nil {
		return "", fmt.Errorf("failed to create folder: %w", err)
	}

	s.logger.WithFields(logrus.Fields{
		"folder_id":   createdFolder.Id,
		"folder_name": folderName,
	}).Info("Folder created successfully")

	return createdFolder.Id, nil
}

// IsInitialized checks if the service is properly initialized
func (s *GoogleDriveService) IsInitialized() bool {
	return s.service != nil
}

// Helper functions

func maxRetries(configured int) int {
	if configured <= 0 {
		return 3 // Default
	}
	return configured
}
