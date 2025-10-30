package validation

import (
	"strings"
	"testing"
)

func TestNewFileValidator(t *testing.T) {
	v := NewFileValidator()
	if v == nil {
		t.Fatal("expected non-nil validator")
	}
}

func TestValidateFilename(t *testing.T) {
	v := NewFileValidator()

	tests := []struct {
		name      string
		filename  string
		expectErr bool
	}{
		{"valid simple", "document.pdf", false},
		{"valid with spaces", "my document.pdf", false},
		{"valid with underscore", "my_document.pdf", false},
		{"valid with dash", "my-document.pdf", false},
		{"empty filename", "", true},
		{"path traversal", "../../../etc/passwd", true},
		{"null byte", "file\x00.pdf", true},
		// Slash and backslash are handled by filepath.Base (path separators)
		{"dangerous chars slash", "file/test.pdf", false}, // Base takes "test.pdf"
		// Note: Backslash test removed - behavior differs between Windows (path separator) and Linux (regular char)
		{"dangerous chars pipe", "file|test.pdf", true},
		{"dangerous chars question", "file?.pdf", true},
		{"dangerous chars asterisk", "file*.pdf", true},
		{"too long filename", strings.Repeat("a", 256) + ".pdf", true},
		{"unicode filename", "Tailieu.pdf", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := v.ValidateFilename(tt.filename)
			if tt.expectErr && err == nil {
				t.Errorf("expected error for filename %q", tt.filename)
			}
			if !tt.expectErr && err != nil {
				t.Errorf("unexpected error for filename %q: %v", tt.filename, err)
			}
		})
	}
}

func TestSanitizeFilename(t *testing.T) {
	v := NewFileValidator()

	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{"clean filename", "document.pdf", "document.pdf"},
		{"with spaces", "my document.pdf", "my document.pdf"},
		{"dangerous chars", "file|test?.pdf", "file_test_.pdf"},
		{"multiple underscores", "file___test.pdf", "file_test.pdf"},
		{"leading trailing", "  _file_  ", "file"},
		{"path in filename", "/etc/passwd", "passwd"},
		{"backslash path", "C:\\Users\\file.pdf", "file.pdf"}, // filepath.Base removes path
		{"empty after sanitize", "|?*", "file"},
		{"too long", strings.Repeat("a", 300) + ".pdf", strings.Repeat("a", 251) + ".pdf"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := v.SanitizeFilename(tt.input)
			if result != tt.expected {
				t.Errorf("expected %q, got %q", tt.expected, result)
			}
		})
	}
}

func TestValidateExtension(t *testing.T) {
	v := NewFileValidator()

	tests := []struct {
		name      string
		ext       string
		fileType  FileType
		expectErr bool
	}{
		{"pdf valid", ".pdf", FileTypePDF, false},
		{"PDF uppercase", ".PDF", FileTypePDF, false},
		{"jpg valid", ".jpg", FileTypeImage, false},
		{"jpeg valid", ".jpeg", FileTypeImage, false},
		{"png valid", ".png", FileTypeImage, false},
		{"mp4 valid", ".mp4", FileTypeVideo, false},
		{"mov valid", ".mov", FileTypeVideo, false},
		{"pdf wrong type", ".pdf", FileTypeImage, true},
		{"jpg wrong type", ".jpg", FileTypePDF, true},
		{"exe not allowed", ".exe", FileTypePDF, true},
		{"sh not allowed", ".sh", FileTypeVideo, true},
		{"no extension", "", FileTypePDF, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := v.ValidateExtension(tt.ext, tt.fileType)
			if tt.expectErr && err == nil {
				t.Errorf("expected error for ext %q type %s", tt.ext, tt.fileType)
			}
			if !tt.expectErr && err != nil {
				t.Errorf("unexpected error for ext %q type %s: %v", tt.ext, tt.fileType, err)
			}
		})
	}
}

func TestValidateSize(t *testing.T) {
	v := NewFileValidator()

	tests := []struct {
		name      string
		size      int64
		fileType  FileType
		expectErr bool
	}{
		{"pdf valid size", 1024 * 1024, FileTypePDF, false},
		{"pdf max size", MaxPDFSize, FileTypePDF, false},
		{"pdf over size", MaxPDFSize + 1, FileTypePDF, true},
		{"image valid size", 1024 * 1024, FileTypeImage, false},
		{"image max size", MaxImageSize, FileTypeImage, false},
		{"image over size", MaxImageSize + 1, FileTypeImage, true},
		{"video valid size", 100 * 1024 * 1024, FileTypeVideo, false},
		{"video max size", MaxVideoSize, FileTypeVideo, false},
		{"video over size", MaxVideoSize + 1, FileTypeVideo, true},
		{"zero size", 0, FileTypePDF, true},
		{"negative size", -1, FileTypePDF, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := v.ValidateSize(tt.size, tt.fileType)
			if tt.expectErr && err == nil {
				t.Errorf("expected error for size %d type %s", tt.size, tt.fileType)
			}
			if !tt.expectErr && err != nil {
				t.Errorf("unexpected error for size %d type %s: %v", tt.size, tt.fileType, err)
			}
		})
	}
}

func TestValidateMimeType(t *testing.T) {
	v := NewFileValidator()

	tests := []struct {
		name      string
		mimeType  string
		fileType  FileType
		expectErr bool
	}{
		{"pdf valid", "application/pdf", FileTypePDF, false},
		{"jpg valid", "image/jpeg", FileTypeImage, false},
		{"png valid", "image/png", FileTypeImage, false},
		{"mp4 valid", "video/mp4", FileTypeVideo, false},
		{"empty mime", "", FileTypePDF, false}, // Empty is optional
		{"pdf wrong mime", "text/plain", FileTypePDF, true},
		{"image wrong mime", "application/pdf", FileTypeImage, true},
		{"video wrong mime", "image/png", FileTypeVideo, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := v.ValidateMimeType(tt.mimeType, tt.fileType)
			if tt.expectErr && err == nil {
				t.Errorf("expected error for mime %q type %s", tt.mimeType, tt.fileType)
			}
			if !tt.expectErr && err != nil {
				t.Errorf("unexpected error for mime %q type %s: %v", tt.mimeType, tt.fileType, err)
			}
		})
	}
}

func TestDetectFileType(t *testing.T) {
	v := NewFileValidator()

	tests := []struct {
		name     string
		filename string
		expected FileType
	}{
		{"pdf file", "document.pdf", FileTypePDF},
		{"jpg file", "image.jpg", FileTypeImage},
		{"jpeg file", "photo.jpeg", FileTypeImage},
		{"png file", "graphic.png", FileTypeImage},
		{"mp4 file", "video.mp4", FileTypeVideo},
		{"mov file", "clip.mov", FileTypeVideo},
		{"unknown ext", "file.txt", FileTypeOther},
		{"no ext", "file", FileTypeOther},
		{"uppercase", "DOC.PDF", FileTypePDF},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := v.DetectFileType(tt.filename)
			if result != tt.expected {
				t.Errorf("expected %s, got %s", tt.expected, result)
			}
		})
	}
}

func TestValidateFile(t *testing.T) {
	v := NewFileValidator()

	tests := []struct {
		name         string
		file         FileInfo
		expectedType FileType
		expectErr    bool
	}{
		{
			name: "valid pdf",
			file: FileInfo{
				Filename: "document.pdf",
				Size:     1024 * 1024,
				MimeType: "application/pdf",
			},
			expectedType: FileTypePDF,
			expectErr:    false,
		},
		{
			name: "valid image",
			file: FileInfo{
				Filename: "photo.jpg",
				Size:     1024 * 1024,
				MimeType: "image/jpeg",
			},
			expectedType: FileTypeImage,
			expectErr:    false,
		},
		{
			name: "pdf too large",
			file: FileInfo{
				Filename: "huge.pdf",
				Size:     MaxPDFSize + 1,
				MimeType: "application/pdf",
			},
			expectedType: FileTypePDF,
			expectErr:    true,
		},
		{
			name: "wrong extension",
			file: FileInfo{
				Filename: "document.txt",
				Size:     1024,
				MimeType: "text/plain",
			},
			expectedType: FileTypePDF,
			expectErr:    true,
		},
		{
			name: "dangerous filename",
			file: FileInfo{
				Filename: "../../../etc/passwd.pdf",
				Size:     1024,
				MimeType: "application/pdf",
			},
			expectedType: FileTypePDF,
			expectErr:    true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := v.ValidateFile(tt.file, tt.expectedType)
			if tt.expectErr && err == nil {
				t.Errorf("expected error for file %+v", tt.file)
			}
			if !tt.expectErr && err != nil {
				t.Errorf("unexpected error for file %+v: %v", tt.file, err)
			}
		})
	}
}

func TestFormatFileSize(t *testing.T) {
	tests := []struct {
		name     string
		bytes    int64
		expected string
	}{
		{"bytes", 500, "500 B"},
		{"kilobytes", 1024, "1.00 KB"},
		{"megabytes", 1024 * 1024, "1.00 MB"},
		{"gigabytes", 1024 * 1024 * 1024, "1.00 GB"},
		{"mixed MB", 5 * 1024 * 1024, "5.00 MB"},
		{"fractional MB", 1536 * 1024, "1.50 MB"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := FormatFileSize(tt.bytes)
			if result != tt.expected {
				t.Errorf("expected %s, got %s", tt.expected, result)
			}
		})
	}
}
