package migration

import (
	"database/sql"
	"fmt"
	"io/ioutil"
	"log"
	"path/filepath"
	"sort"
	"strconv"
	"strings"

	_ "github.com/lib/pq"
)

// Migrator handles database migrations
type Migrator struct {
	db            *sql.DB
	migrationsDir string
}

// NewMigrator creates a new migrator instance
func NewMigrator(db *sql.DB, migrationsDir string) *Migrator {
	return &Migrator{
		db:            db,
		migrationsDir: migrationsDir,
	}
}

// Migration represents a single migration file
type Migration struct {
	Version int
	Name    string
	UpSQL   string
	DownSQL string
}

// RunMigrations executes all pending migrations
func (m *Migrator) RunMigrations() error {
	log.Println("🔄 Starting database migrations...")

	// Create schema_migrations table if it doesn't exist
	if err := m.createMigrationsTable(); err != nil {
		return fmt.Errorf("failed to create migrations table: %w", err)
	}

	// Get all migration files
	migrations, err := m.loadMigrations()
	if err != nil {
		return fmt.Errorf("failed to load migrations: %w", err)
	}

	// Get applied migrations
	appliedVersions, err := m.getAppliedMigrations()
	if err != nil {
		return fmt.Errorf("failed to get applied migrations: %w", err)
	}

	// Run pending migrations
	pendingCount := 0
	for _, migration := range migrations {
		if !contains(appliedVersions, migration.Version) {
			log.Printf("📄 Running migration %d: %s", migration.Version, migration.Name)
			if err := m.runMigration(migration); err != nil {
				return fmt.Errorf("failed to run migration %d: %w", migration.Version, err)
			}
			pendingCount++
		}
	}

	if pendingCount == 0 {
		log.Println("✅ No pending migrations found")
	} else {
		log.Printf("✅ Successfully applied %d migrations", pendingCount)
	}

	return nil
}

// createMigrationsTable creates the schema_migrations table
func (m *Migrator) createMigrationsTable() error {
	query := `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version BIGINT PRIMARY KEY,
			dirty BOOLEAN NOT NULL DEFAULT FALSE,
			applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
		);
	`
	_, err := m.db.Exec(query)
	return err
}

// loadMigrations loads all migration files from the migrations directory
func (m *Migrator) loadMigrations() ([]Migration, error) {
	files, err := ioutil.ReadDir(m.migrationsDir)
	if err != nil {
		return nil, err
	}

	var migrations []Migration
	migrationMap := make(map[int]*Migration)

	for _, file := range files {
		if file.IsDir() {
			continue
		}

		filename := file.Name()
		if !strings.HasSuffix(filename, ".sql") {
			continue
		}

		// Parse filename: 000001_initial_schema.up.sql or 000001_initial_schema.down.sql
		parts := strings.Split(filename, "_")
		if len(parts) < 2 {
			continue
		}

		versionStr := parts[0]
		version, err := strconv.Atoi(versionStr)
		if err != nil {
			continue
		}

		isUp := strings.Contains(filename, ".up.sql")
		isDown := strings.Contains(filename, ".down.sql")

		if !isUp && !isDown {
			continue
		}

		// Read file content
		content, err := ioutil.ReadFile(filepath.Join(m.migrationsDir, filename))
		if err != nil {
			return nil, err
		}

		// Get or create migration
		migration, exists := migrationMap[version]
		if !exists {
			name := strings.Join(parts[1:], "_")
			name = strings.TrimSuffix(name, ".up.sql")
			name = strings.TrimSuffix(name, ".down.sql")
			migration = &Migration{
				Version: version,
				Name:    name,
			}
			migrationMap[version] = migration
		}

		if isUp {
			migration.UpSQL = string(content)
		} else {
			migration.DownSQL = string(content)
		}
	}

	// Convert map to slice and sort by version
	for _, migration := range migrationMap {
		if migration.UpSQL != "" { // Only include migrations with up SQL
			migrations = append(migrations, *migration)
		}
	}

	sort.Slice(migrations, func(i, j int) bool {
		return migrations[i].Version < migrations[j].Version
	})

	return migrations, nil
}

// getAppliedMigrations returns a list of applied migration versions
func (m *Migrator) getAppliedMigrations() ([]int, error) {
	query := "SELECT version FROM schema_migrations WHERE dirty = false ORDER BY version"
	rows, err := m.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var versions []int
	for rows.Next() {
		var version int
		if err := rows.Scan(&version); err != nil {
			return nil, err
		}
		versions = append(versions, version)
	}

	return versions, rows.Err()
}

// runMigration executes a single migration
func (m *Migrator) runMigration(migration Migration) error {
	tx, err := m.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Mark migration as dirty
	_, err = tx.Exec("INSERT INTO schema_migrations (version, dirty) VALUES ($1, true) ON CONFLICT (version) DO UPDATE SET dirty = true", migration.Version)
	if err != nil {
		return err
	}

	// Execute migration SQL
	_, err = tx.Exec(migration.UpSQL)
	if err != nil {
		return err
	}

	// Mark migration as clean
	_, err = tx.Exec("UPDATE schema_migrations SET dirty = false, applied_at = NOW() WHERE version = $1", migration.Version)
	if err != nil {
		return err
	}

	return tx.Commit()
}

// contains checks if a slice contains a value
func contains(slice []int, value int) bool {
	for _, item := range slice {
		if item == value {
			return true
		}
	}
	return false
}
