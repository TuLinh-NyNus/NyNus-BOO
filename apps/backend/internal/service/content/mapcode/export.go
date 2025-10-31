package mapcode_mgmt

import (
	"context"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"sort"
	"strings"

	"exam-bank-system/apps/backend/internal/entity"
)

// ExportVersion exports a MapCode version in the specified format
func (m *MapCodeMgmt) ExportVersion(ctx context.Context, versionID string, format string) (string, string, error) {
	// Get version
	version, err := m.mapCodeRepo.GetVersionByID(ctx, versionID)
	if err != nil {
		return "", "", fmt.Errorf("version not found: %w", err)
	}

	// Load config
	config, err := m.getOrLoadConfig(ctx, version)
	if err != nil {
		return "", "", fmt.Errorf("failed to load config: %w", err)
	}

	var content string
	var filename string

	switch strings.ToLower(format) {
	case "markdown", "md":
		content, err = m.exportToMarkdown(config, version)
		filename = fmt.Sprintf("MapCode-%s.md", version.Version.String)
	case "json":
		content, err = m.exportToJSON(config, version)
		filename = fmt.Sprintf("MapCode-%s.json", version.Version.String)
	case "csv":
		content, err = m.exportToCSV(config, version)
		filename = fmt.Sprintf("MapCode-%s.csv", version.Version.String)
	default:
		return "", "", fmt.Errorf("unsupported format: %s (supported: markdown, json, csv)", format)
	}

	if err != nil {
		return "", "", err
	}

	return content, filename, nil
}

// exportToMarkdown exports config as Markdown
func (m *MapCodeMgmt) exportToMarkdown(config *entity.MapCodeConfig, version *entity.MapCodeVersion) (string, error) {
	var sb strings.Builder

	// Header
	sb.WriteString("# MapCode Configuration\n\n")
	sb.WriteString(fmt.Sprintf("**Version**: %s\n", version.Version.String))
	sb.WriteString(fmt.Sprintf("**Name**: %s\n", version.Name.String))
	sb.WriteString(fmt.Sprintf("**Description**: %s\n\n", version.Description.String))
	sb.WriteString("---\n\n")

	// Levels
	sb.WriteString("## Levels (Mức độ)\n\n")
	sb.WriteString("| Code | Description |\n")
	sb.WriteString("|------|-------------|\n")
	sortedKeys := getSortedKeys(config.Levels)
	for _, key := range sortedKeys {
		sb.WriteString(fmt.Sprintf("| `[%s]` | %s |\n", key, config.Levels[key]))
	}
	sb.WriteString("\n")

	// Grades
	sb.WriteString("## Grades (Lớp)\n\n")
	sb.WriteString("| Code | Description |\n")
	sb.WriteString("|------|-------------|\n")
	sortedKeys = getSortedKeys(config.Grades)
	for _, key := range sortedKeys {
		sb.WriteString(fmt.Sprintf("| `%s` | %s |\n", key, config.Grades[key]))
	}
	sb.WriteString("\n")

	// Subjects
	sb.WriteString("## Subjects (Ngân hàng)\n\n")
	sb.WriteString("| Code | Description |\n")
	sb.WriteString("|------|-------------|\n")
	sortedKeys = getSortedKeys(config.Subjects)
	for _, key := range sortedKeys {
		sb.WriteString(fmt.Sprintf("| `%s` | %s |\n", key, config.Subjects[key]))
	}
	sb.WriteString("\n")

	// Chapters
	sb.WriteString("## Chapters (Chương)\n\n")
	sb.WriteString("| Code | Description |\n")
	sb.WriteString("|------|-------------|\n")
	sortedKeys = getSortedKeys(config.Chapters)
	for _, key := range sortedKeys {
		sb.WriteString(fmt.Sprintf("| `%s` | %s |\n", key, config.Chapters[key]))
	}
	sb.WriteString("\n")

	// Lessons
	sb.WriteString("## Lessons (Bài)\n\n")
	sb.WriteString("| Code | Description |\n")
	sb.WriteString("|------|-------------|\n")
	sortedKeys = getSortedKeys(config.Lessons)
	for _, key := range sortedKeys {
		sb.WriteString(fmt.Sprintf("| `%s` | %s |\n", key, config.Lessons[key]))
	}
	sb.WriteString("\n")

	// Forms
	sb.WriteString("## Forms (Dạng)\n\n")
	sb.WriteString("| Code | Description |\n")
	sb.WriteString("|------|-------------|\n")
	sortedKeys = getSortedKeys(config.Forms)
	for _, key := range sortedKeys {
		sb.WriteString(fmt.Sprintf("| `%s` | %s |\n", key, config.Forms[key]))
	}
	sb.WriteString("\n")

	// Footer
	sb.WriteString("---\n\n")
	sb.WriteString("*Exported from NyNus Exam Bank System*\n")

	return sb.String(), nil
}

// exportToJSON exports config as JSON
func (m *MapCodeMgmt) exportToJSON(config *entity.MapCodeConfig, version *entity.MapCodeVersion) (string, error) {
	exportData := map[string]interface{}{
		"version":     version.Version.String,
		"name":        version.Name.String,
		"description": version.Description.String,
		"config": map[string]interface{}{
			"levels":   config.Levels,
			"grades":   config.Grades,
			"subjects": config.Subjects,
			"chapters": config.Chapters,
			"lessons":  config.Lessons,
			"forms":    config.Forms,
		},
	}

	jsonBytes, err := json.MarshalIndent(exportData, "", "  ")
	if err != nil {
		return "", fmt.Errorf("failed to marshal JSON: %w", err)
	}

	return string(jsonBytes), nil
}

// exportToCSV exports config as CSV
func (m *MapCodeMgmt) exportToCSV(config *entity.MapCodeConfig, version *entity.MapCodeVersion) (string, error) {
	var sb strings.Builder
	writer := csv.NewWriter(&sb)

	// Header
	writer.Write([]string{"Type", "Code", "Description"})

	// Write all entries
	writeCSVSection := func(sectionType string, data map[string]string) {
		sortedKeys := getSortedKeys(data)
		for _, key := range sortedKeys {
			writer.Write([]string{sectionType, key, data[key]})
		}
	}

	writeCSVSection("Level", config.Levels)
	writeCSVSection("Grade", config.Grades)
	writeCSVSection("Subject", config.Subjects)
	writeCSVSection("Chapter", config.Chapters)
	writeCSVSection("Lesson", config.Lessons)
	writeCSVSection("Form", config.Forms)

	writer.Flush()

	if err := writer.Error(); err != nil {
		return "", fmt.Errorf("failed to write CSV: %w", err)
	}

	return sb.String(), nil
}

// getSortedKeys returns sorted keys from a map for consistent output
func getSortedKeys(m map[string]string) []string {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	return keys
}
