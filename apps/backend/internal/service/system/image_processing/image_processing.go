package image_processing

import (
	"context"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

// ImageProcessingService handles LaTeX to image conversion
type ImageProcessingService struct {
	config       *ImageConfig
	logger       *logrus.Logger
	workDir      string
	templatePath string
}

// ImageConfig holds configuration for image processing
type ImageConfig struct {
	TexLiveBin     string        // Path to TeX Live bin directory
	LatexEngine    string        // lualatex or xelatex
	ImageConverter string        // magick or cwebp
	TmpDir         string        // Temporary directory for processing
	OutputDir      string        // Output directory for images
	CompileTimeout time.Duration // Timeout for LaTeX compilation
	ConvertTimeout time.Duration // Timeout for image conversion
	MaxConcurrency int           // Maximum concurrent jobs
	ImageQuality   int           // WebP quality (1-100)
	EnableCache    bool          // Enable caching of compiled images
	CacheDir       string        // Cache directory
	SafeMode       bool          // Enable safe mode (restricted shell-escape)
}

// NewImageProcessingService creates a new image processing service
func NewImageProcessingService(config *ImageConfig, logger *logrus.Logger) (*ImageProcessingService, error) {
	// Validate configuration
	if config.TexLiveBin == "" {
		return nil, fmt.Errorf("TeX Live bin directory not configured")
	}
	if config.LatexEngine == "" {
		config.LatexEngine = "lualatex"
	}
	if config.ImageConverter == "" {
		config.ImageConverter = "magick"
	}
	if config.CompileTimeout == 0 {
		config.CompileTimeout = 30 * time.Second
	}
	if config.ConvertTimeout == 0 {
		config.ConvertTimeout = 10 * time.Second
	}
	if config.MaxConcurrency == 0 {
		config.MaxConcurrency = 5
	}
	if config.ImageQuality == 0 {
		config.ImageQuality = 85
	}

	// Create directories
	if err := os.MkdirAll(config.TmpDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create tmp directory: %w", err)
	}
	if err := os.MkdirAll(config.OutputDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create output directory: %w", err)
	}
	if config.EnableCache && config.CacheDir != "" {
		if err := os.MkdirAll(config.CacheDir, 0755); err != nil {
			return nil, fmt.Errorf("failed to create cache directory: %w", err)
		}
	}

	// Create work directory
	workDir := filepath.Join(config.TmpDir, "work_"+uuid.New().String())
	if err := os.MkdirAll(workDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create work directory: %w", err)
	}

	// Load template
	templatePath := filepath.Join("templates", "tikz-template.tex")

	return &ImageProcessingService{
		config:       config,
		logger:       logger,
		workDir:      workDir,
		templatePath: templatePath,
	}, nil
}

// ProcessTikZ processes TikZ code to WebP image
func (s *ImageProcessingService) ProcessTikZ(ctx context.Context, tikzCode string, outputName string) (string, error) {
	// Create unique job ID
	jobID := uuid.New().String()
	jobDir := filepath.Join(s.workDir, jobID)

	// Create job directory
	if err := os.MkdirAll(jobDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create job directory: %w", err)
	}
	defer s.cleanupJobDir(jobDir)

	// Check cache if enabled
	if s.config.EnableCache && s.config.CacheDir != "" {
		cachedPath := s.checkCache(tikzCode)
		if cachedPath != "" {
			s.logger.WithField("cache_hit", cachedPath).Info("Using cached image")
			return cachedPath, nil
		}
	}

	// Sanitize TikZ code (remove potentially dangerous commands)
	sanitizedCode := s.sanitizeTikZCode(tikzCode)

	// Create LaTeX document with TikZ code
	latexContent := s.createTikZDocument(sanitizedCode)

	// Write LaTeX file
	texFile := filepath.Join(jobDir, "document.tex")
	if err := os.WriteFile(texFile, []byte(latexContent), 0644); err != nil {
		return "", fmt.Errorf("failed to write LaTeX file: %w", err)
	}

	// Compile LaTeX to PDF
	pdfFile := filepath.Join(jobDir, "document.pdf")
	if err := s.compileLatex(ctx, texFile, pdfFile); err != nil {
		return "", fmt.Errorf("LaTeX compilation failed: %w", err)
	}

	// Convert PDF to WebP
	webpFile := filepath.Join(s.config.OutputDir, outputName+".webp")
	if err := s.convertToWebP(ctx, pdfFile, webpFile); err != nil {
		return "", fmt.Errorf("WebP conversion failed: %w", err)
	}

	// Cache the result if enabled
	if s.config.EnableCache && s.config.CacheDir != "" {
		s.cacheImage(tikzCode, webpFile)
	}

	return webpFile, nil
}

// ProcessIncludegraphics processes external image references
func (s *ImageProcessingService) ProcessIncludegraphics(ctx context.Context, imagePath string, outputName string) (string, error) {
	// Check if image exists
	if _, err := os.Stat(imagePath); err != nil {
		return "", fmt.Errorf("image file not found: %w", err)
	}

	// Convert to WebP if not already
	ext := strings.ToLower(filepath.Ext(imagePath))
	if ext == ".webp" {
		// Just copy to output directory
		outputPath := filepath.Join(s.config.OutputDir, outputName+".webp")
		if err := s.copyFile(imagePath, outputPath); err != nil {
			return "", fmt.Errorf("failed to copy image: %w", err)
		}
		return outputPath, nil
	}

	// Convert to WebP
	webpFile := filepath.Join(s.config.OutputDir, outputName+".webp")
	if err := s.convertToWebP(ctx, imagePath, webpFile); err != nil {
		return "", fmt.Errorf("WebP conversion failed: %w", err)
	}

	return webpFile, nil
}

// compileLatex compiles LaTeX file to PDF
func (s *ImageProcessingService) compileLatex(ctx context.Context, texFile, pdfFile string) error {
	// Prepare LaTeX command
	latexBin := filepath.Join(s.config.TexLiveBin, s.config.LatexEngine)

	// Build command arguments
	args := []string{
		"-interaction=nonstopmode",
		"-halt-on-error",
		"-output-directory", filepath.Dir(texFile),
		"-no-shell-escape",
		"-recorder",
	}

	// Add shell-escape only if not in safe mode
	if !s.config.SafeMode {
		// Remove no-shell-escape and add shell-escape
		args = args[:len(args)-2]
		args = append(args, "-shell-escape", "-recorder")
	}

	args = append(args, filepath.Base(texFile))

	// Create command with timeout
	ctx, cancel := context.WithTimeout(ctx, s.config.CompileTimeout)
	defer cancel()

	cmd := exec.CommandContext(ctx, latexBin, args...)
	cmd.Dir = filepath.Dir(texFile)

	// Set environment variables for TeX Live
	cmd.Env = append(os.Environ(),
		"TEXMFHOME="+filepath.Join(s.config.TexLiveBin, "..", "texmf"),
		"PATH="+s.config.TexLiveBin+string(os.PathListSeparator)+os.Getenv("PATH"),
	)

	// Run LaTeX compilation
	output, err := cmd.CombinedOutput()
	if err != nil {
		s.logger.WithFields(logrus.Fields{
			"error":  err,
			"output": string(output),
		}).Error("LaTeX compilation failed")
		return fmt.Errorf("LaTeX compilation failed: %w", err)
	}

	// Check if PDF was created
	if _, err := os.Stat(pdfFile); err != nil {
		return fmt.Errorf("PDF file not created: %w", err)
	}

	return nil
}

// convertToWebP converts image to WebP format
func (s *ImageProcessingService) convertToWebP(ctx context.Context, inputFile, outputFile string) error {
	var cmd *exec.Cmd

	// Create command with timeout
	ctx, cancel := context.WithTimeout(ctx, s.config.ConvertTimeout)
	defer cancel()

	switch s.config.ImageConverter {
	case "magick":
		// Use ImageMagick
		cmd = exec.CommandContext(ctx, "magick",
			inputFile,
			"-quality", fmt.Sprintf("%d", s.config.ImageQuality),
			"-define", "webp:lossless=false",
			"-define", "webp:method=6",
			outputFile,
		)
	case "cwebp":
		// Use cwebp directly
		cmd = exec.CommandContext(ctx, "cwebp",
			"-q", fmt.Sprintf("%d", s.config.ImageQuality),
			inputFile,
			"-o", outputFile,
		)
	default:
		return fmt.Errorf("unsupported image converter: %s", s.config.ImageConverter)
	}

	// Run conversion
	output, err := cmd.CombinedOutput()
	if err != nil {
		s.logger.WithFields(logrus.Fields{
			"error":     err,
			"output":    string(output),
			"converter": s.config.ImageConverter,
		}).Error("Image conversion failed")
		return fmt.Errorf("image conversion failed: %w", err)
	}

	// Check if output file was created
	if _, err := os.Stat(outputFile); err != nil {
		return fmt.Errorf("WebP file not created: %w", err)
	}

	return nil
}

// sanitizeTikZCode removes potentially dangerous commands from TikZ code
func (s *ImageProcessingService) sanitizeTikZCode(code string) string {
	// Remove dangerous commands
	dangerousCommands := []string{
		"\\input", "\\include", "\\write", "\\read",
		"\\immediate", "\\openout", "\\closeout",
		"\\newwrite", "\\newread", "\\catcode",
		"\\def", "\\let", "\\expandafter",
	}

	sanitized := code
	for _, cmd := range dangerousCommands {
		sanitized = strings.ReplaceAll(sanitized, cmd, "")
	}

	return sanitized
}

// createTikZDocument creates a complete LaTeX document with TikZ code
func (s *ImageProcessingService) createTikZDocument(tikzCode string) string {
	// Basic template for TikZ compilation
	template := `\documentclass[tikz,border=2mm]{standalone}
\usepackage{tikz}
\usepackage{pgfplots}
\usepackage{amsmath}
\usepackage{amssymb}
\usepackage{unicode-math}
\setmathfont{Latin Modern Math}
\usetikzlibrary{arrows.meta,patterns,shapes,positioning,calc,angles,quotes,datavisualization}
\pgfplotsset{compat=1.17}

\begin{document}
%s
\end{document}
`
	return fmt.Sprintf(template, tikzCode)
}

// checkCache checks if image is already cached
func (s *ImageProcessingService) checkCache(tikzCode string) string {
	if !s.config.EnableCache || s.config.CacheDir == "" {
		return ""
	}

	// Generate cache key from TikZ code
	cacheKey := s.generateCacheKey(tikzCode)
	cachePath := filepath.Join(s.config.CacheDir, cacheKey+".webp")

	// Check if cached file exists
	if _, err := os.Stat(cachePath); err == nil {
		return cachePath
	}

	return ""
}

// cacheImage saves image to cache
func (s *ImageProcessingService) cacheImage(tikzCode string, imagePath string) {
	if !s.config.EnableCache || s.config.CacheDir == "" {
		return
	}

	cacheKey := s.generateCacheKey(tikzCode)
	cachePath := filepath.Join(s.config.CacheDir, cacheKey+".webp")

	// Copy image to cache
	if err := s.copyFile(imagePath, cachePath); err != nil {
		s.logger.WithError(err).Warn("Failed to cache image")
	}
}

// generateCacheKey generates a cache key from TikZ code
func (s *ImageProcessingService) generateCacheKey(tikzCode string) string {
	// Simple hash using Go's built-in hash function
	// In production, use a proper hash like SHA256
	return fmt.Sprintf("%x", hashString(tikzCode))
}

// hashString creates a simple hash of a string
func hashString(s string) uint64 {
	var h uint64 = 5381
	for _, c := range s {
		h = ((h << 5) + h) + uint64(c)
	}
	return h
}

// copyFile copies a file from src to dst
func (s *ImageProcessingService) copyFile(src, dst string) error {
	source, err := os.Open(src)
	if err != nil {
		return err
	}
	defer source.Close()

	destination, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer destination.Close()

	_, err = io.Copy(destination, source)
	return err
}

// cleanupJobDir removes job directory
func (s *ImageProcessingService) cleanupJobDir(jobDir string) {
	if err := os.RemoveAll(jobDir); err != nil {
		s.logger.WithError(err).Warn("Failed to cleanup job directory")
	}
}

// Cleanup cleans up the work directory
func (s *ImageProcessingService) Cleanup() error {
	return os.RemoveAll(s.workDir)
}
