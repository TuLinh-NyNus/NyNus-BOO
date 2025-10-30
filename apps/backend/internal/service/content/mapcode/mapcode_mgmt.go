package mapcode_mgmt

import (
	"context"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/repository"
)

// MapCodeMgmt handles MapCode version management and translation
type MapCodeMgmt struct {
	mapCodeRepo      *repository.MapCodeRepository
	translationRepo  *repository.MapCodeTranslationRepository
	basePath         string                           // Base path for MapCode files
	translationCache map[string]*entity.MapCodeConfig // In-memory cache
}

// NewMapCodeMgmt creates a new MapCodeMgmt instance
func NewMapCodeMgmt(mapCodeRepo *repository.MapCodeRepository, translationRepo *repository.MapCodeTranslationRepository) *MapCodeMgmt {
	return &MapCodeMgmt{
		mapCodeRepo:      mapCodeRepo,
		translationRepo:  translationRepo,
		basePath:         "docs/resources/latex/mapcode",
		translationCache: make(map[string]*entity.MapCodeConfig),
	}
}

// CreateVersion creates a new MapCode version
func (m *MapCodeMgmt) CreateVersion(ctx context.Context, version, name, description, createdBy string) (*entity.MapCodeVersion, error) {
	// Check storage limits
	storageInfo, err := m.mapCodeRepo.GetStorageInfo(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to check storage: %w", err)
	}

	if !storageInfo.CanCreateNewVersion() {
		return nil, fmt.Errorf("storage limit exceeded: %s", storageInfo.GetWarningMessage())
	}

	// Create version folder
	versionPath := filepath.Join(m.basePath, version)
	if err := os.MkdirAll(versionPath, 0755); err != nil {
		return nil, fmt.Errorf("failed to create version folder: %w", err)
	}

	// Create MapCode file path
	filePath := filepath.Join(versionPath, fmt.Sprintf("MapCode-%s.md", strings.TrimPrefix(version, "v")))

	// Create version entity
	mapCodeVersion := &entity.MapCodeVersion{}
	mapCodeVersion.Version.Set(version)
	mapCodeVersion.Name.Set(name)
	mapCodeVersion.Description.Set(description)
	mapCodeVersion.FilePath.Set(filePath)
	mapCodeVersion.IsActive.Set(false) // New versions are inactive by default
	mapCodeVersion.CreatedBy.Set(createdBy)

	// Save to database
	if err := m.mapCodeRepo.CreateVersion(ctx, mapCodeVersion); err != nil {
		// Cleanup folder if database save fails
		os.RemoveAll(versionPath)
		return nil, fmt.Errorf("failed to save version: %w", err)
	}

	return mapCodeVersion, nil
}

// GetActiveVersion retrieves the currently active version
func (m *MapCodeMgmt) GetActiveVersion(ctx context.Context) (*entity.MapCodeVersion, error) {
	return m.mapCodeRepo.GetActiveVersion(ctx)
}

// SetActiveVersion sets a version as active
func (m *MapCodeMgmt) SetActiveVersion(ctx context.Context, versionID string) error {
	// Verify version exists
	version, err := m.mapCodeRepo.GetVersionByID(ctx, versionID)
	if err != nil {
		return fmt.Errorf("version not found: %w", err)
	}

	// Set as active in database
	if err := m.mapCodeRepo.SetActiveVersion(ctx, versionID); err != nil {
		return fmt.Errorf("failed to set active version: %w", err)
	}

	// Update symlink for current active version
	if err := m.updateActiveSymlink(version.FilePath.String); err != nil {
		// Log warning but don't fail the operation
		// The database is the source of truth
		fmt.Printf("Warning: failed to update symlink: %v\n", err)
	}

	return nil
}

// GetAllVersions retrieves all versions with pagination
func (m *MapCodeMgmt) GetAllVersions(ctx context.Context, offset, limit int) ([]*entity.MapCodeVersion, error) {
	return m.mapCodeRepo.GetAllVersions(ctx, offset, limit)
}

// DeleteVersion deletes a version (only if not active)
func (m *MapCodeMgmt) DeleteVersion(ctx context.Context, versionID string) error {
	// Get version info before deletion
	version, err := m.mapCodeRepo.GetVersionByID(ctx, versionID)
	if err != nil {
		return fmt.Errorf("version not found: %w", err)
	}

	if version.IsActive.Bool {
		return fmt.Errorf("cannot delete active version")
	}

	// Delete from database
	if err := m.mapCodeRepo.DeleteVersion(ctx, versionID); err != nil {
		return fmt.Errorf("failed to delete version: %w", err)
	}

	// Delete version folder
	versionFolder := filepath.Dir(version.FilePath.String)
	if err := os.RemoveAll(versionFolder); err != nil {
		// Log warning but don't fail the operation
		fmt.Printf("Warning: failed to delete version folder: %v\n", err)
	}

	return nil
}

// GetStorageInfo returns storage information
func (m *MapCodeMgmt) GetStorageInfo(ctx context.Context) (*entity.MapCodeStorageInfo, error) {
	return m.mapCodeRepo.GetStorageInfo(ctx)
}

// GetMapCodeConfig returns the full MapCode configuration
func (m *MapCodeMgmt) GetMapCodeConfig(ctx context.Context, versionID string) (*entity.MapCodeConfig, error) {
	var version *entity.MapCodeVersion
	var err error

	// If versionID is provided, use it; otherwise use active version
	if versionID != "" {
		version, err = m.mapCodeRepo.GetVersionByID(ctx, versionID)
	} else {
		version, err = m.GetActiveVersion(ctx)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to get version: %w", err)
	}

	// Load configuration from file
	config, err := m.getOrLoadConfig(ctx, version)
	if err != nil {
		return nil, fmt.Errorf("failed to load config: %w", err)
	}

	return config, nil
}

// TranslateQuestionCode translates a question code using active version with caching
func (m *MapCodeMgmt) TranslateQuestionCode(ctx context.Context, questionCode string) (string, error) {
	// Get active version
	activeVersion, err := m.GetActiveVersion(ctx)
	if err != nil {
		return "", fmt.Errorf("no active version found: %w", err)
	}

	// Try to get from cache first
	if cachedTranslation, err := m.translationRepo.GetTranslation(ctx, activeVersion.ID.String, questionCode); err == nil {
		return cachedTranslation.Translation.String, nil
	}

	// Load MapCode configuration
	config, err := m.getOrLoadConfig(ctx, activeVersion)
	if err != nil {
		return "", fmt.Errorf("failed to load MapCode config: %w", err)
	}

	// Parse and translate question code
	translation, err := m.translateCode(questionCode, config)
	if err != nil {
		return "", err
	}

	// Cache the translation
	go m.cacheTranslation(context.Background(), activeVersion.ID.String, questionCode, translation, config)

	return translation, nil
}

// TranslateQuestionCodes translates multiple question codes efficiently
func (m *MapCodeMgmt) TranslateQuestionCodes(ctx context.Context, questionCodes []string) (map[string]string, error) {
	if len(questionCodes) == 0 {
		return make(map[string]string), nil
	}

	// Get active version
	activeVersion, err := m.GetActiveVersion(ctx)
	if err != nil {
		return nil, fmt.Errorf("no active version found: %w", err)
	}

	// Load configuration once
	config, err := m.getOrLoadConfig(ctx, activeVersion)
	if err != nil {
		return nil, fmt.Errorf("failed to load MapCode config: %w", err)
	}

	results := make(map[string]string)
	var toCache []*entity.MapCodeTranslation

	for _, questionCode := range questionCodes {
		// Try cache first
		if cachedTranslation, err := m.translationRepo.GetTranslation(ctx, activeVersion.ID.String, questionCode); err == nil {
			results[questionCode] = cachedTranslation.Translation.String
			continue
		}

		// Translate if not cached
		translation, err := m.translateCode(questionCode, config)
		if err != nil {
			results[questionCode] = questionCode // Fallback to original
			continue
		}

		results[questionCode] = translation

		// Prepare for batch caching
		cacheEntry := &entity.MapCodeTranslation{}
		cacheEntry.VersionID.Set(activeVersion.ID.String)
		cacheEntry.QuestionCode.Set(questionCode)
		cacheEntry.Translation.Set(translation)
		m.setTranslationParts(cacheEntry, questionCode, config)
		toCache = append(toCache, cacheEntry)
	}

	// Batch cache new translations
	if len(toCache) > 0 {
		go m.translationRepo.BatchCreateTranslations(context.Background(), toCache)
	}

	return results, nil
}

// GetHierarchyNavigation returns navigation structure for a question code
func (m *MapCodeMgmt) GetHierarchyNavigation(ctx context.Context, questionCode string) (*HierarchyNavigation, error) {
	// Get active version
	activeVersion, err := m.GetActiveVersion(ctx)
	if err != nil {
		return nil, fmt.Errorf("no active version found: %w", err)
	}

	// Load configuration
	config, err := m.getOrLoadConfig(ctx, activeVersion)
	if err != nil {
		return nil, fmt.Errorf("failed to load MapCode config: %w", err)
	}

	return m.buildHierarchyNavigation(questionCode, config)
}

// HierarchyNavigation represents navigation structure
type HierarchyNavigation struct {
	QuestionCode string          `json:"question_code"`
	Grade        *HierarchyLevel `json:"grade"`
	Subject      *HierarchyLevel `json:"subject"`
	Chapter      *HierarchyLevel `json:"chapter"`
	Level        *HierarchyLevel `json:"level"`
	Lesson       *HierarchyLevel `json:"lesson"`
	Form         *HierarchyLevel `json:"form,omitempty"`
	Breadcrumbs  []string        `json:"breadcrumbs"`
}

// HierarchyLevel represents a single level in hierarchy
type HierarchyLevel struct {
	Code        string `json:"code"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

// loadMapCodeConfig loads and parses MapCode configuration from file
func (m *MapCodeMgmt) loadMapCodeConfig(filePath string) (*entity.MapCodeConfig, error) {
	content, err := ioutil.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}

	return m.parseMapCodeContent(string(content))
}

// parseMapCodeContent parses MapCode markdown content
// Supports both structured format (## sections) and dash-based hierarchy format
func (m *MapCodeMgmt) parseMapCodeContent(content string) (*entity.MapCodeConfig, error) {
	config := &entity.MapCodeConfig{
		Grades:   make(map[string]string),
		Subjects: make(map[string]string),
		Chapters: make(map[string]string),
		Levels:   make(map[string]string),
		Lessons:  make(map[string]string),
		Forms:    make(map[string]string),
	}

	// Try dash-based format first (actual MapCode.md format)
	if m.isDashBasedFormat(content) {
		return m.parseDashBasedFormat(content)
	}

	// Fallback to structured format parsing
	sections := map[string]map[string]string{
		"Grade Mapping":   config.Grades,
		"Subject Mapping": config.Subjects,
		"Chapter Mapping": config.Chapters,
		"Level Mapping":   config.Levels,
		"Lesson Mapping":  config.Lessons,
		"Form Mapping":    config.Forms,
	}

	for sectionName, sectionMap := range sections {
		if err := m.parseSection(content, sectionName, sectionMap); err != nil {
			return nil, fmt.Errorf("failed to parse %s: %w", sectionName, err)
		}
	}

	return config, nil
}

// isDashBasedFormat checks if content uses dash-based hierarchy format
func (m *MapCodeMgmt) isDashBasedFormat(content string) bool {
	// Check for patterns like "-[X]", "----[X]", "-------[X]"
	dashPatterns := []string{
		`^-\[[^\]]+\]`,
		`^----\[[^\]]+\]`,
		`^-------\[[^\]]+\]`,
	}

	lines := strings.Split(content, "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		for _, pattern := range dashPatterns {
			matched, _ := regexp.MatchString(pattern, line)
			if matched {
				return true
			}
		}
	}
	return false
}

// parseDashBasedFormat parses MapCode content in dash-based hierarchy format
func (m *MapCodeMgmt) parseDashBasedFormat(content string) (*entity.MapCodeConfig, error) {
	config := &entity.MapCodeConfig{
		Grades:   make(map[string]string),
		Subjects: make(map[string]string),
		Chapters: make(map[string]string),
		Levels:   make(map[string]string),
		Lessons:  make(map[string]string),
		Forms:    make(map[string]string),
	}

	lines := strings.Split(content, "\n")

	for _, line := range lines {
		trimmedLine := strings.TrimSpace(line)

		// Skip empty lines and comments
		if trimmedLine == "" || strings.HasPrefix(trimmedLine, "%") {
			continue
		}

		// Parse level/difficulty definitions: [X] Description
		// e.g., [N] Nhận biết, [H] Thông Hiểu
		if !strings.HasPrefix(trimmedLine, "-") && strings.HasPrefix(trimmedLine, "[") {
			levelMatch := regexp.MustCompile(`^\[([^\]]+)\]\s*(.+)$`).FindStringSubmatch(trimmedLine)
			if len(levelMatch) == 3 {
				key := strings.TrimSpace(levelMatch[1])
				value := strings.TrimSpace(levelMatch[2])
				config.Levels[key] = value
				continue
			}
		}

		// Parse hierarchy levels based on dash count
		dashCount := m.countLeadingDashes(line)

		switch dashCount {
		case 1: // -[X] Lớp (Grade)
			m.parseDashLine(line, 1, config.Grades)
		case 4: // ----[X] Môn (Subject)
			m.parseDashLine(line, 4, config.Subjects)
		case 7: // -------[X] Chương (Chapter)
			m.parseDashLine(line, 7, config.Chapters)
		case 10: // ----------[X] Bài (Lesson)
			m.parseDashLine(line, 10, config.Lessons)
		case 13: // -------------[X] Dạng (Form)
			m.parseDashLine(line, 13, config.Forms)
		}
	}

	return config, nil
}

// countLeadingDashes counts the number of leading dashes in a line
func (m *MapCodeMgmt) countLeadingDashes(line string) int {
	count := 0
	for _, char := range line {
		if char == '-' {
			count++
		} else {
			break
		}
	}
	return count
}

// parseDashLine parses a single dash-based line and extracts key-value
func (m *MapCodeMgmt) parseDashLine(line string, expectedDashes int, targetMap map[string]string) {
	// Remove leading dashes
	content := strings.TrimLeft(line, "-")
	content = strings.TrimSpace(content)

	// Parse pattern: [X] Description
	pattern := regexp.MustCompile(`^\[([^\]]+)\]\s*(.+)$`)
	matches := pattern.FindStringSubmatch(content)

	if len(matches) == 3 {
		key := strings.TrimSpace(matches[1])
		value := strings.TrimSpace(matches[2])

		// Store in map if not already exists (keep first occurrence)
		if _, exists := targetMap[key]; !exists {
			targetMap[key] = value
		}
	}
}

// parseSection parses a specific section of MapCode content
func (m *MapCodeMgmt) parseSection(content, sectionName string, targetMap map[string]string) error {
	// Find section start
	sectionPattern := fmt.Sprintf(`## %s\s*\n(.*?)(?:\n## |$)`, regexp.QuoteMeta(sectionName))
	sectionRegex := regexp.MustCompile(sectionPattern)
	matches := sectionRegex.FindStringSubmatch(content)

	if len(matches) < 2 {
		return fmt.Errorf("section %s not found", sectionName)
	}

	sectionContent := matches[1]

	// Parse mapping lines: "- X: Description"
	linePattern := `- ([^:]+):\s*(.+)`
	lineRegex := regexp.MustCompile(linePattern)
	lines := strings.Split(sectionContent, "\n")

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}

		lineMatches := lineRegex.FindStringSubmatch(line)
		if len(lineMatches) == 3 {
			key := strings.TrimSpace(lineMatches[1])
			value := strings.TrimSpace(lineMatches[2])
			targetMap[key] = value
		}
	}

	return nil
}

// translateCode translates a question code using configuration
func (m *MapCodeMgmt) translateCode(questionCode string, config *entity.MapCodeConfig) (string, error) {
	if len(questionCode) < 5 {
		return "", fmt.Errorf("invalid question code format")
	}

	var parts []string

	// Parse based on format (ID5 or ID6)
	if len(questionCode) == 5 {
		// ID5 format: XXXXX
		parts = append(parts, m.translatePart(string(questionCode[0]), config.Grades, "Lá»›p"))
		parts = append(parts, m.translatePart(string(questionCode[1]), config.Subjects, ""))
		parts = append(parts, m.translatePart(string(questionCode[2]), config.Chapters, ""))
		parts = append(parts, m.translatePart(string(questionCode[3]), config.Levels, ""))
		parts = append(parts, m.translatePart(string(questionCode[4]), config.Lessons, ""))
	} else if len(questionCode) == 7 && questionCode[5] == '-' {
		// ID6 format: XXXXX-X
		parts = append(parts, m.translatePart(string(questionCode[0]), config.Grades, "Lá»›p"))
		parts = append(parts, m.translatePart(string(questionCode[1]), config.Subjects, ""))
		parts = append(parts, m.translatePart(string(questionCode[2]), config.Chapters, ""))
		parts = append(parts, m.translatePart(string(questionCode[3]), config.Levels, ""))
		parts = append(parts, m.translatePart(string(questionCode[4]), config.Lessons, ""))
		parts = append(parts, m.translatePart(string(questionCode[6]), config.Forms, ""))
	} else {
		return "", fmt.Errorf("invalid question code format")
	}

	// Filter out empty parts and join
	var validParts []string
	for _, part := range parts {
		if part != "" {
			validParts = append(validParts, part)
		}
	}

	return strings.Join(validParts, " - "), nil
}

// translatePart translates a single part using mapping
func (m *MapCodeMgmt) translatePart(key string, mapping map[string]string, prefix string) string {
	if value, exists := mapping[key]; exists {
		if prefix != "" {
			return prefix + " " + value
		}
		return value
	}
	return key // Return original if not found
}

// updateActiveSymlink updates the symlink for active MapCode
func (m *MapCodeMgmt) updateActiveSymlink(targetPath string) error {
	symlinkPath := filepath.Join(m.basePath, "current", "active-mapcode.md")

	// Remove existing symlink
	if _, err := os.Lstat(symlinkPath); err == nil {
		if err := os.Remove(symlinkPath); err != nil {
			return fmt.Errorf("failed to remove existing symlink: %w", err)
		}
	}

	// Create new symlink
	relPath, err := filepath.Rel(filepath.Dir(symlinkPath), targetPath)
	if err != nil {
		return fmt.Errorf("failed to calculate relative path: %w", err)
	}

	if err := os.Symlink(relPath, symlinkPath); err != nil {
		return fmt.Errorf("failed to create symlink: %w", err)
	}

	return nil
}

// getOrLoadConfig gets configuration from cache or loads from file
func (m *MapCodeMgmt) getOrLoadConfig(ctx context.Context, version *entity.MapCodeVersion) (*entity.MapCodeConfig, error) {
	// Check in-memory cache first
	if config, exists := m.translationCache[version.ID.String]; exists {
		return config, nil
	}

	// Load from file
	config, err := m.loadMapCodeConfig(version.FilePath.String)
	if err != nil {
		return nil, err
	}

	// Cache in memory
	m.translationCache[version.ID.String] = config

	return config, nil
}

// cacheTranslation caches a single translation
func (m *MapCodeMgmt) cacheTranslation(ctx context.Context, versionID, questionCode, translation string, config *entity.MapCodeConfig) {
	cacheEntry := &entity.MapCodeTranslation{}
	cacheEntry.VersionID.Set(versionID)
	cacheEntry.QuestionCode.Set(questionCode)
	cacheEntry.Translation.Set(translation)

	m.setTranslationParts(cacheEntry, questionCode, config)

	// Ignore errors in background caching
	m.translationRepo.CreateTranslation(ctx, cacheEntry)
}

// setTranslationParts sets individual parts of translation
func (m *MapCodeMgmt) setTranslationParts(translation *entity.MapCodeTranslation, questionCode string, config *entity.MapCodeConfig) {
	if len(questionCode) >= 5 {
		if grade, exists := config.Grades[string(questionCode[0])]; exists {
			translation.Grade.Set(grade)
		}
		if subject, exists := config.Subjects[string(questionCode[1])]; exists {
			translation.Subject.Set(subject)
		}
		if chapter, exists := config.Chapters[string(questionCode[2])]; exists {
			translation.Chapter.Set(chapter)
		}
		if level, exists := config.Levels[string(questionCode[3])]; exists {
			translation.Level.Set(level)
		}
		if lesson, exists := config.Lessons[string(questionCode[4])]; exists {
			translation.Lesson.Set(lesson)
		}

		// Handle ID6 format
		if len(questionCode) == 7 && questionCode[5] == '-' {
			if form, exists := config.Forms[string(questionCode[6])]; exists {
				translation.Form.Set(form)
			}
		}
	}
}

// buildHierarchyNavigation builds navigation structure
func (m *MapCodeMgmt) buildHierarchyNavigation(questionCode string, config *entity.MapCodeConfig) (*HierarchyNavigation, error) {
	if len(questionCode) < 5 {
		return nil, fmt.Errorf("invalid question code format")
	}

	nav := &HierarchyNavigation{
		QuestionCode: questionCode,
		Breadcrumbs:  []string{},
	}

	// Build hierarchy levels
	if grade, exists := config.Grades[string(questionCode[0])]; exists {
		nav.Grade = &HierarchyLevel{
			Code:        string(questionCode[0]),
			Name:        grade,
			Description: "Lá»›p " + grade,
		}
		nav.Breadcrumbs = append(nav.Breadcrumbs, nav.Grade.Description)
	}

	if subject, exists := config.Subjects[string(questionCode[1])]; exists {
		nav.Subject = &HierarchyLevel{
			Code:        string(questionCode[1]),
			Name:        subject,
			Description: subject,
		}
		nav.Breadcrumbs = append(nav.Breadcrumbs, nav.Subject.Description)
	}

	if chapter, exists := config.Chapters[string(questionCode[2])]; exists {
		nav.Chapter = &HierarchyLevel{
			Code:        string(questionCode[2]),
			Name:        chapter,
			Description: chapter,
		}
		nav.Breadcrumbs = append(nav.Breadcrumbs, nav.Chapter.Description)
	}

	if level, exists := config.Levels[string(questionCode[3])]; exists {
		nav.Level = &HierarchyLevel{
			Code:        string(questionCode[3]),
			Name:        level,
			Description: level,
		}
		nav.Breadcrumbs = append(nav.Breadcrumbs, nav.Level.Description)
	}

	if lesson, exists := config.Lessons[string(questionCode[4])]; exists {
		nav.Lesson = &HierarchyLevel{
			Code:        string(questionCode[4]),
			Name:        lesson,
			Description: lesson,
		}
		nav.Breadcrumbs = append(nav.Breadcrumbs, nav.Lesson.Description)
	}

	// Handle ID6 format
	if len(questionCode) == 7 && questionCode[5] == '-' {
		if form, exists := config.Forms[string(questionCode[6])]; exists {
			nav.Form = &HierarchyLevel{
				Code:        string(questionCode[6]),
				Name:        form,
				Description: form,
			}
			nav.Breadcrumbs = append(nav.Breadcrumbs, nav.Form.Description)
		}
	}

	return nav, nil
}

// ClearCache clears in-memory cache (useful when switching versions)
func (m *MapCodeMgmt) ClearCache() {
	m.translationCache = make(map[string]*entity.MapCodeConfig)
}

// WarmupCache preloads configuration for active version
func (m *MapCodeMgmt) WarmupCache(ctx context.Context) error {
	activeVersion, err := m.GetActiveVersion(ctx)
	if err != nil {
		return err
	}

	_, err = m.getOrLoadConfig(ctx, activeVersion)
	return err
}
