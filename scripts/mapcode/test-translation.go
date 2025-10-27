package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"

	_ "github.com/lib/pq"
)

const (
	dbHost     = "localhost"
	dbPort     = 5433
	dbUser     = "exam_bank_user"
	dbPassword = "exam_bank_password"
	dbName     = "exam_bank_db"
)

// Test translation với các question codes mẫu
var testCodes = []struct {
	code     string
	expected string
}{
	{
		code:     "0P1N1",
		expected: "Lớp 10 - 10-NGÂN HÀNG CHÍNH - Mệnh đề và tập hợp - Nhận biết - Mệnh đề",
	},
	{
		code:     "0P2H2",
		expected: "Lớp 10 - 10-NGÂN HÀNG CHÍNH - Bất phương trình... - Thông Hiểu - ...",
	},
	{
		code:     "2H5V3",
		expected: "Lớp 12 - ...",
	},
}

func main() {
	log.Println("🧪 MapCode Translation Test - Starting...")

	// Connect to database
	log.Println("📡 Connecting to database...")
	connStr := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		dbHost, dbPort, dbUser, dbPassword, dbName)
	
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("❌ Failed to connect: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("❌ Failed to ping: %v", err)
	}
	log.Println("✅ Database connected")

	// Get active version
	log.Println("🔍 Getting active MapCode version...")
	ctx := context.Background()
	
	var versionID, version, filePath string
	err = db.QueryRowContext(ctx, `
		SELECT id, version, file_path 
		FROM mapcode_versions 
		WHERE is_active = true
		LIMIT 1
	`).Scan(&versionID, &version, &filePath)
	
	if err != nil {
		log.Fatalf("❌ No active version found: %v", err)
	}
	log.Printf("✅ Active version: %s (ID: %s)\n", version, versionID)

	// Read and parse MapCode file
	log.Printf("📖 Reading MapCode file: %s\n", filePath)
	
	// File path is relative to scripts/mapcode, so prepend ../../
	absPath := filepath.Join("../../", filePath)
	
	// Check if file exists
	if _, err := os.Stat(absPath); os.IsNotExist(err) {
		// Try without ../ prefix (path might already be relative to script location)
		absPath = filePath
	}
	
	log.Printf("   Resolved path: %s\n", absPath)
	config, err := parseMapCodeFile(absPath)
	if err != nil {
		log.Fatalf("❌ Failed to parse MapCode: %v", err)
	}
	
	log.Printf("✅ Parsed MapCode successfully\n")
	log.Printf("   - Grades: %d entries\n", len(config.Grades))
	log.Printf("   - Subjects: %d entries\n", len(config.Subjects))
	log.Printf("   - Chapters: %d entries\n", len(config.Chapters))
	log.Printf("   - Levels: %d entries\n", len(config.Levels))
	log.Printf("   - Lessons: %d entries\n", len(config.Lessons))
	log.Printf("   - Forms: %d entries\n", len(config.Forms))

	// Test translations
	log.Println("\n🧪 Testing Translations:")
	log.Println("============================================================")
	
	passCount := 0
	for i, test := range testCodes {
		log.Printf("\nTest %d: %s\n", i+1, test.code)
		log.Println("-----------------------------------------------------------")
		
		translation, parts := translateCode(test.code, config)
		
		log.Printf("  Grade:   [%s] -> %s\n", parts["grade"], config.Grades[parts["grade"]])
		log.Printf("  Subject: [%s] -> %s\n", parts["subject"], config.Subjects[parts["subject"]])
		log.Printf("  Chapter: [%s] -> %s\n", parts["chapter"], config.Chapters[parts["chapter"]])
		log.Printf("  Level:   [%s] -> %s\n", parts["level"], config.Levels[parts["level"]])
		log.Printf("  Lesson:  [%s] -> %s\n", parts["lesson"], config.Lessons[parts["lesson"]])
		
		log.Printf("\n  ✨ Translation: %s\n", translation)
		
		if translation != "" {
			passCount++
			log.Println("  ✅ PASS")
		} else {
			log.Println("  ❌ FAIL")
		}
	}

	// Summary
	log.Println("\n============================================================")
	log.Println("🎯 Test Summary:")
	log.Printf("   Total: %d\n", len(testCodes))
	log.Printf("   Passed: %d\n", passCount)
	log.Printf("   Failed: %d\n", len(testCodes)-passCount)
	log.Println("============================================================")
	
	if passCount == len(testCodes) {
		log.Println("🎉 All tests passed!")
	} else {
		log.Println("⚠️  Some tests failed - check parser implementation")
	}
}

// MapCodeConfig holds parsed MapCode configuration
type MapCodeConfig struct {
	Grades   map[string]string
	Subjects map[string]string
	Chapters map[string]string
	Levels   map[string]string
	Lessons  map[string]string
	Forms    map[string]string
}

// parseMapCodeFile parses MapCode file in dash-based format
func parseMapCodeFile(filePath string) (*MapCodeConfig, error) {
	content, err := os.ReadFile(filePath)
	if err != nil {
		return nil, err
	}

	config := &MapCodeConfig{
		Grades:   make(map[string]string),
		Subjects: make(map[string]string),
		Chapters: make(map[string]string),
		Levels:   make(map[string]string),
		Lessons:  make(map[string]string),
		Forms:    make(map[string]string),
	}

	lines := string(content)
	for _, line := range splitLines(lines) {
		line = trim(line)
		
		if line == "" || line[0] == '%' {
			continue
		}

		// Parse level definitions: [X] Description
		if line[0] == '[' && !hasLeadingDash(line) {
			if key, value := parseBracketLine(line); key != "" {
				config.Levels[key] = value
			}
			continue
		}

		// Parse hierarchy
		dashCount := countLeadingDashes(line)
		switch dashCount {
		case 1:
			if key, value := parseDashLine(line); key != "" {
				config.Grades[key] = value
			}
		case 4:
			if key, value := parseDashLine(line); key != "" {
				config.Subjects[key] = value
			}
		case 7:
			if key, value := parseDashLine(line); key != "" {
				config.Chapters[key] = value
			}
		case 10:
			if key, value := parseDashLine(line); key != "" {
				config.Lessons[key] = value
			}
		case 13:
			if key, value := parseDashLine(line); key != "" {
				config.Forms[key] = value
			}
		}
	}

	return config, nil
}

// translateCode translates a question code using config
func translateCode(questionCode string, config *MapCodeConfig) (string, map[string]string) {
	if len(questionCode) < 5 {
		return "", nil
	}

	parts := make(map[string]string)
	var translations []string

	// Parse ID5 format
	parts["grade"] = string(questionCode[0])
	parts["subject"] = string(questionCode[1])
	parts["chapter"] = string(questionCode[2])
	parts["level"] = string(questionCode[3])
	parts["lesson"] = string(questionCode[4])

	// Translate each part
	if val, ok := config.Grades[parts["grade"]]; ok && val != "" {
		translations = append(translations, val)
	}
	if val, ok := config.Subjects[parts["subject"]]; ok && val != "" {
		translations = append(translations, val)
	}
	if val, ok := config.Chapters[parts["chapter"]]; ok && val != "" {
		translations = append(translations, val)
	}
	if val, ok := config.Levels[parts["level"]]; ok && val != "" {
		translations = append(translations, val)
	}
	if val, ok := config.Lessons[parts["lesson"]]; ok && val != "" {
		translations = append(translations, val)
	}

	result := ""
	for i, t := range translations {
		if i > 0 {
			result += " - "
		}
		result += t
	}

	return result, parts
}

// Helper functions
func splitLines(s string) []string {
	var lines []string
	var current string
	for _, c := range s {
		if c == '\n' {
			lines = append(lines, current)
			current = ""
		} else if c != '\r' {
			current += string(c)
		}
	}
	if current != "" {
		lines = append(lines, current)
	}
	return lines
}

func trim(s string) string {
	start, end := 0, len(s)
	for start < end && (s[start] == ' ' || s[start] == '\t') {
		start++
	}
	for end > start && (s[end-1] == ' ' || s[end-1] == '\t') {
		end--
	}
	return s[start:end]
}

func hasLeadingDash(s string) bool {
	return len(s) > 0 && s[0] == '-'
}

func countLeadingDashes(s string) int {
	count := 0
	for _, c := range s {
		if c == '-' {
			count++
		} else {
			break
		}
	}
	return count
}

func parseBracketLine(line string) (string, string) {
	// Parse: [X] Description
	if len(line) < 3 {
		return "", ""
	}
	
	closeIdx := -1
	for i, c := range line {
		if c == ']' {
			closeIdx = i
			break
		}
	}
	
	if closeIdx <= 1 {
		return "", ""
	}
	
	key := line[1:closeIdx]
	value := ""
	if closeIdx+1 < len(line) {
		value = trim(line[closeIdx+1:])
	}
	
	return trim(key), value
}

func parseDashLine(line string) (string, string) {
	// Remove leading dashes
	trimmed := line
	for len(trimmed) > 0 && trimmed[0] == '-' {
		trimmed = trimmed[1:]
	}
	trimmed = trim(trimmed)
	
	return parseBracketLine(trimmed)
}

