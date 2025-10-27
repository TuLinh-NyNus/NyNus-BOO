package grpc

import (
	"context"
	"io"
	"time"

	"github.com/sirupsen/logrus"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"exam-bank-system/apps/backend/internal/service/storage"
	"exam-bank-system/apps/backend/internal/validation"
)

// LibraryUploadHandler handles file upload operations for library items
type LibraryUploadHandler struct {
	driveService  *storage.GoogleDriveService
	validator     *validation.FileValidator
	logger        *logrus.Logger
	maxUploadSize int64
}

// NewLibraryUploadHandler creates a new upload handler
func NewLibraryUploadHandler(
	driveService *storage.GoogleDriveService,
	validator *validation.FileValidator,
	logger *logrus.Logger,
	maxUploadSize int64,
) *LibraryUploadHandler {
	return &LibraryUploadHandler{
		driveService:  driveService,
		validator:     validator,
		logger:        logger,
		maxUploadSize: maxUploadSize,
	}
}

// UploadFileRequest represents a file upload request
type UploadFileRequest struct {
	Filename    string
	ContentType string
	Size        int64
	Content     io.Reader
	ItemType    string // exam, book, video
	UserID      string
}

// UploadFileResponse represents a file upload response
type UploadFileResponse struct {
	FileID       string
	FileURL      string
	ThumbnailURL string
	UploadedAt   time.Time
}

// HandleUpload processes a file upload
func (h *LibraryUploadHandler) HandleUpload(ctx context.Context, req *UploadFileRequest) (*UploadFileResponse, error) {
	// Check if Google Drive service is initialized
	if !h.driveService.IsInitialized() {
		return nil, status.Error(codes.Unavailable, "Upload service not available - Google Drive credentials required")
	}

	h.logger.WithFields(logrus.Fields{
		"filename":     req.Filename,
		"content_type": req.ContentType,
		"size":         req.Size,
		"item_type":    req.ItemType,
		"user_id":      req.UserID,
	}).Info("Processing file upload")

	// Validate file size
	if req.Size > h.maxUploadSize {
		return nil, status.Errorf(codes.InvalidArgument, "File size exceeds maximum allowed (%d bytes)", h.maxUploadSize)
	}

	// Validate file type based on item type
	var err error
	switch req.ItemType {
	case "exam":
		err = h.validator.ValidatePDF(req.Filename, req.Size)
	case "book":
		err = h.validator.ValidatePDF(req.Filename, req.Size)
	case "image":
		err = h.validator.ValidateImage(req.Filename, req.Size)
	case "video":
		// Videos are typically YouTube links, not direct uploads
		// But we support video file uploads if needed
		return nil, status.Error(codes.Unimplemented, "Video file uploads not yet supported - use YouTube URL instead")
	default:
		return nil, status.Error(codes.InvalidArgument, "Invalid item type")
	}

	if err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "File validation failed: %v", err)
	}

	// Sanitize filename
	sanitizedName := h.validator.SanitizeFilename(req.Filename)
	if sanitizedName != req.Filename {
		h.logger.WithFields(logrus.Fields{
			"original":  req.Filename,
			"sanitized": sanitizedName,
		}).Warn("Filename was sanitized")
	}

	// Upload to Google Drive
	uploadResult, err := h.driveService.UploadFile(ctx, sanitizedName, req.ContentType, req.Content)
	if err != nil {
		h.logger.WithError(err).Error("Failed to upload file to Google Drive")
		return nil, status.Error(codes.Internal, "Failed to upload file")
	}

	h.logger.WithFields(logrus.Fields{
		"file_id":   uploadResult.FileID,
		"file_name": uploadResult.FileName,
	}).Info("File uploaded successfully")

	return &UploadFileResponse{
		FileID:       uploadResult.FileID,
		FileURL:      uploadResult.DownloadURL,
		ThumbnailURL: uploadResult.ThumbnailURL,
		UploadedAt:   uploadResult.CreatedAt,
	}, nil
}

// GetUploadLimits returns upload limits for different file types
func (h *LibraryUploadHandler) GetUploadLimits() map[string]int64 {
	return map[string]int64{
		"pdf":   validation.MaxPDFSize,
		"image": validation.MaxImageSize,
		"video": validation.MaxVideoSize,
	}
}

// NOTE: Actual gRPC endpoint integration will be added when proto definitions are updated
// This handler provides the core business logic for file uploads

// Example usage in library_service.go:
// func (s *LibraryService) UploadFile(ctx context.Context, req *pb.UploadFileRequest) (*pb.UploadFileResponse, error) {
//     uploadReq := &grpc.UploadFileRequest{
//         Filename:    req.Filename,
//         ContentType: req.ContentType,
//         Size:        req.Size,
//         Content:     req.Content,
//         ItemType:    req.ItemType,
//         UserID:      getUserIDFromContext(ctx),
//     }
//     return s.uploadHandler.HandleUpload(ctx, uploadReq)
// }

