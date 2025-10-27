package main

import (
	"context"
	"database/sql"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"time"

	_ "github.com/lib/pq"
)

const (
	// Database connection (default Docker compose values)
	dbHost     = "localhost"
	dbPort     = 5433 // Note: Docker maps 5432 -> 5433 on host
	dbUser     = "exam_bank_user"
	dbPassword = "exam_bank_password"
	dbName     = "exam_bank_db"

	// MapCode file locations (relative to project root)
	sourceMapCodeFile = "../../tools/parsing-question/src/parser/MapCode.md"
	targetBasePath    = "../../docs/resources/latex/mapcode"
)

func main() {
	log.Println("🚀 MapCode Import Tool - Starting...")

	// Step 1: Connect to database
	log.Println("📡 Connecting to database...")
	connStr := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		dbHost, dbPort, dbUser, dbPassword, dbName)
	
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("❌ Failed to connect to database: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("❌ Failed to ping database: %v", err)
	}
	log.Println("✅ Database connected successfully")

	// Step 2: Read source MapCode.md file
	log.Printf("📖 Reading MapCode.md from: %s\n", sourceMapCodeFile)
	content, err := ioutil.ReadFile(sourceMapCodeFile)
	if err != nil {
		log.Fatalf("❌ Failed to read MapCode.md: %v", err)
	}
	log.Printf("✅ Read %d bytes from MapCode.md\n", len(content))

	// Step 3: Create version folder and file
	version := fmt.Sprintf("v%s", time.Now().Format("2006-01-02"))
	versionPath := filepath.Join(targetBasePath, version)
	
	log.Printf("📁 Creating version folder: %s\n", versionPath)
	if err := os.MkdirAll(versionPath, 0755); err != nil {
		log.Fatalf("❌ Failed to create version folder: %v", err)
	}

	targetFilePath := filepath.Join(versionPath, fmt.Sprintf("MapCode-%s.md", time.Now().Format("2006-01-02")))
	log.Printf("💾 Writing MapCode to: %s\n", targetFilePath)
	
	if err := ioutil.WriteFile(targetFilePath, content, 0644); err != nil {
		log.Fatalf("❌ Failed to write MapCode file: %v", err)
	}
	log.Println("✅ MapCode file written successfully")

	// Step 4: Create version record in database
	log.Println("💾 Creating version record in database...")
	ctx := context.Background()
	
	query := `
		INSERT INTO mapcode_versions (
			version, name, description, file_path, is_active, created_by
		) VALUES (
			$1, $2, $3, $4, $5, $6
		)
		RETURNING id
	`

	var versionID string
	err = db.QueryRowContext(ctx, query,
		version,
		"MapCode Chính - Import từ tools/parsing-question",
		"MapCode configuration chính của hệ thống với đầy đủ phân cấp: Lớp > Môn > Chương > Bài > Dạng",
		targetFilePath,
		false, // Not active by default
		"SYSTEM",
	).Scan(&versionID)

	if err != nil {
		log.Fatalf("❌ Failed to create version record: %v", err)
	}
	log.Printf("✅ Version created successfully with ID: %s\n", versionID)

	// Step 5: Optionally set as active
	log.Println("🔄 Setting version as active...")
	
	// First, deactivate all versions
	_, err = db.ExecContext(ctx, "UPDATE mapcode_versions SET is_active = false")
	if err != nil {
		log.Fatalf("❌ Failed to deactivate versions: %v", err)
	}

	// Activate the new version
	_, err = db.ExecContext(ctx, "UPDATE mapcode_versions SET is_active = true WHERE id = $1", versionID)
	if err != nil {
		log.Fatalf("❌ Failed to activate version: %v", err)
	}
	log.Println("✅ Version set as active")

	// Step 6: Summary
	separator := "============================================================"
	log.Println("\n" + separator)
	log.Println("🎉 MapCode Import Completed Successfully!")
	log.Println(separator)
	log.Printf("Version ID:   %s\n", versionID)
	log.Printf("Version:      %s\n", version)
	log.Printf("File Path:    %s\n", targetFilePath)
	log.Printf("Status:       ACTIVE\n")
	log.Printf("Lines:        %d\n", countLines(content))
	log.Println(separator)
	log.Println("\n💡 Next steps:")
	log.Println("1. Test translation: Use gRPC TranslateCode endpoint")
	log.Println("2. Verify cached translations in mapcode_translations table")
	log.Println("3. Check frontend MapCode display components")
}

// countLines counts the number of lines in content
func countLines(content []byte) int {
	count := 0
	for _, b := range content {
		if b == '\n' {
			count++
		}
	}
	return count + 1
}

