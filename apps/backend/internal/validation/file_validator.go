package validation

import (
	"fmt"
	"path/filepath"
	"regexp"
	"strings"
)

// FileType represents supported file types
type FileType string

const (
	FileTypePDF   FileType = "pdf"
	FileTypeImage FileType = "image"
	FileTypeVideo FileType = "video"
	FileTypeOther FileType = "other"
)

// File size limits in bytes
const (
	MaxPDFSize   = 50 * 1024 * 1024  // 50 MB
	MaxImageSize = 10 * 1024 * 1024  // 10 MB
	MaxVideoSize = 500 * 1024 * 1024 // 500 MB
)

// Whitelist of allowed file extensions
var (
	AllowedPDFExtensions = []string{".pdf"}
	AllowedImageExtensions = []string{".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"}
	AllowedVideoExtensions = []string{".mp4", ".avi", ".mov", ".mkv", ".webm"}
)

// FileValidationError represents a file validation error
type FileValidationError struct {
	Field   string
	Message string
}

func (e FileValidationError) Error() string {
	return fmt.Sprintf("%s: %s", e.Field, e.Message)
}

// FileInfo contains file metadata for validation
type FileInfo struct {
	Filename string
	Size     int64
	MimeType string
}

// FileValidator validates file uploads
type FileValidator struct{}

// NewFileValidator creates a new file validator instance
func NewFileValidator() *FileValidator {
	return &FileValidator{}
}

// ValidateFile performs comprehensive file validation
func (v *FileValidator) ValidateFile(file FileInfo, expectedType FileType) error {
	// Validate filename
	if err := v.ValidateFilename(file.Filename); err != nil {
		return err
	}

	// Get file extension
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if ext == "" {
		return FileValidationError{
			Field:   "filename",
			Message: "file must have an extension",
		}
	}

	// Validate extension whitelist
	if err := v.ValidateExtension(ext, expectedType); err != nil {
		return err
	}

	// Validate file size
	if err := v.ValidateSize(file.Size, expectedType); err != nil {
		return err
	}

	// Validate MIME type
	if err := v.ValidateMimeType(file.MimeType, expectedType); err != nil {
		return err
	}

	return nil
}

// ValidateFilename checks if filename is safe and properly formatted
func (v *FileValidator) ValidateFilename(filename string) error {
	if filename == "" {
		return FileValidationError{
			Field:   "filename",
			Message: "filename cannot be empty",
		}
	}

	// Check filename length
	if len(filename) > 255 {
		return FileValidationError{
			Field:   "filename",
			Message: "filename too long (max 255 characters)",
		}
	}

	// Check for path traversal attempts
	if strings.Contains(filename, "..") {
		return FileValidationError{
			Field:   "filename",
			Message: "filename contains invalid path sequences",
		}
	}

	// Check for null bytes
	if strings.Contains(filename, "\x00") {
		return FileValidationError{
			Field:   "filename",
			Message: "filename contains null bytes",
		}
	}

	// Check for dangerous characters
	dangerousChars := regexp.MustCompile(`[<>:"|?*\\/]`)
	if dangerousChars.MatchString(filepath.Base(filename)) {
		return FileValidationError{
			Field:   "filename",
			Message: "filename contains invalid characters",
		}
	}

	return nil
}

// SanitizeFilename removes or replaces dangerous characters in filename
func (v *FileValidator) SanitizeFilename(filename string) string {
	// Get base name only (remove any path)
	base := filepath.Base(filename)

	// Replace dangerous characters with underscores
	sanitized := regexp.MustCompile(`[<>:"|?*\\/]`).ReplaceAllString(base, "_")

	// Replace multiple underscores with single
	sanitized = regexp.MustCompile(`_+`).ReplaceAllString(sanitized, "_")

	// Remove leading/trailing underscores and spaces
	sanitized = strings.Trim(sanitized, "_ ")

	// If empty after sanitization, use a default
	if sanitized == "" {
		sanitized = "file"
	}

	// Limit length
	if len(sanitized) > 255 {
		ext := filepath.Ext(sanitized)
		nameWithoutExt := strings.TrimSuffix(sanitized, ext)
		sanitized = nameWithoutExt[:255-len(ext)] + ext
	}

	return sanitized
}

// ValidateExtension checks if file extension is in the whitelist
func (v *FileValidator) ValidateExtension(ext string, fileType FileType) error {
	ext = strings.ToLower(ext)

	var allowedExts []string
	switch fileType {
	case FileTypePDF:
		allowedExts = AllowedPDFExtensions
	case FileTypeImage:
		allowedExts = AllowedImageExtensions
	case FileTypeVideo:
		allowedExts = AllowedVideoExtensions
	default:
		return FileValidationError{
			Field:   "fileType",
			Message: "unsupported file type",
		}
	}

	for _, allowed := range allowedExts {
		if ext == allowed {
			return nil
		}
	}

	return FileValidationError{
		Field:   "extension",
		Message: fmt.Sprintf("extension %s not allowed for %s files (allowed: %v)", ext, fileType, allowedExts),
	}
}

// ValidateSize checks if file size is within limits
func (v *FileValidator) ValidateSize(size int64, fileType FileType) error {
	if size <= 0 {
		return FileValidationError{
			Field:   "size",
			Message: "file size must be greater than 0",
		}
	}

	var maxSize int64
	switch fileType {
	case FileTypePDF:
		maxSize = MaxPDFSize
	case FileTypeImage:
		maxSize = MaxImageSize
	case FileTypeVideo:
		maxSize = MaxVideoSize
	default:
		return FileValidationError{
			Field:   "fileType",
			Message: "unsupported file type",
		}
	}

	if size > maxSize {
		return FileValidationError{
			Field:   "size",
			Message: fmt.Sprintf("file size %d bytes exceeds limit of %d bytes (%.2f MB)", size, maxSize, float64(maxSize)/(1024*1024)),
		}
	}

	return nil
}

// ValidateMimeType checks if MIME type matches the expected file type
func (v *FileValidator) ValidateMimeType(mimeType string, fileType FileType) error {
	if mimeType == "" {
		// MIME type validation is optional
		return nil
	}

	mimeType = strings.ToLower(mimeType)

	switch fileType {
	case FileTypePDF:
		if !strings.HasPrefix(mimeType, "application/pdf") {
			return FileValidationError{
				Field:   "mimeType",
				Message: fmt.Sprintf("invalid MIME type %s for PDF file", mimeType),
			}
		}
	case FileTypeImage:
		if !strings.HasPrefix(mimeType, "image/") {
			return FileValidationError{
				Field:   "mimeType",
				Message: fmt.Sprintf("invalid MIME type %s for image file", mimeType),
			}
		}
	case FileTypeVideo:
		if !strings.HasPrefix(mimeType, "video/") {
			return FileValidationError{
				Field:   "mimeType",
				Message: fmt.Sprintf("invalid MIME type %s for video file", mimeType),
			}
		}
	}

	return nil
}

// DetectFileType detects file type from extension
func (v *FileValidator) DetectFileType(filename string) FileType {
	ext := strings.ToLower(filepath.Ext(filename))

	for _, allowed := range AllowedPDFExtensions {
		if ext == allowed {
			return FileTypePDF
		}
	}

	for _, allowed := range AllowedImageExtensions {
		if ext == allowed {
			return FileTypeImage
		}
	}

	for _, allowed := range AllowedVideoExtensions {
		if ext == allowed {
			return FileTypeVideo
		}
	}

	return FileTypeOther
}

// ValidatePDF validates a PDF file
func (v *FileValidator) ValidatePDF(filename string, size int64) error {
	return v.ValidateFile(FileInfo{
		Filename: filename,
		Size:     size,
		MimeType: "application/pdf",
	}, FileTypePDF)
}

// ValidateImage validates an image file
func (v *FileValidator) ValidateImage(filename string, size int64) error {
	return v.ValidateFile(FileInfo{
		Filename: filename,
		Size:     size,
		MimeType: "image/jpeg", // Default, will accept any image/* in ValidateMimeType
	}, FileTypeImage)
}

// ValidateVideo validates a video file
func (v *FileValidator) ValidateVideo(filename string, size int64) error {
	return v.ValidateFile(FileInfo{
		Filename: filename,
		Size:     size,
		MimeType: "video/mp4", // Default, will accept any video/* in ValidateMimeType
	}, FileTypeVideo)
}

// FormatFileSize formats file size in human-readable format
func FormatFileSize(bytes int64) string {
	const unit = 1024
	if bytes < unit {
		return fmt.Sprintf("%d B", bytes)
	}

	div, exp := int64(unit), 0
	for n := bytes / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}

	return fmt.Sprintf("%.2f %cB", float64(bytes)/float64(div), "KMGTPE"[exp])
}

