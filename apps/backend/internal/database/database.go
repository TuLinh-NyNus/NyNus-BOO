package database

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/util"

	"github.com/google/uuid"
	"github.com/jackc/pgtype"
)

// Entity interface that all entities must implement
type Entity interface {
	FieldMap() ([]string, []interface{})
	TableName() string
}

// QueryExecer interface for database operations
type QueryExecer interface {
	QueryContext(ctx context.Context, query string, args ...interface{}) (*sql.Rows, error)
	ExecContext(ctx context.Context, query string, args ...interface{}) (sql.Result, error)
}

// InsertExcept inserts an entity excluding specified fields
func InsertExcept(ctx context.Context, entity Entity, excludeFields []string, execFunc func(ctx context.Context, query string, args ...interface{}) (sql.Result, error)) (sql.Result, error) {
	fields, values := entity.FieldMap()
	
	// Filter out excluded fields
	var filteredFields []string
	var filteredValues []interface{}
	
	excludeMap := make(map[string]bool)
	for _, field := range excludeFields {
		excludeMap[field] = true
	}
	
	for i, field := range fields {
		if !excludeMap[field] {
			filteredFields = append(filteredFields, field)
			filteredValues = append(filteredValues, values[i])
		}
	}
	
	// Build query
	placeholders := make([]string, len(filteredFields))
	for i := range placeholders {
		placeholders[i] = fmt.Sprintf("$%d", i+1)
	}
	
	query := fmt.Sprintf(
		"INSERT INTO %s (%s) VALUES (%s)",
		entity.TableName(),
		strings.Join(filteredFields, ", "),
		strings.Join(placeholders, ", "),
	)
	
	return execFunc(ctx, query, filteredValues...)
}

// UpdateByID updates an entity by ID
func UpdateByID(ctx context.Context, entity Entity, id string, excludeFields []string, execFunc func(ctx context.Context, query string, args ...interface{}) (sql.Result, error)) (sql.Result, error) {
	fields, values := entity.FieldMap()
	
	// Filter out excluded fields and ID field
	var filteredFields []string
	var filteredValues []interface{}
	
	excludeMap := make(map[string]bool)
	for _, field := range excludeFields {
		excludeMap[field] = true
	}
	excludeMap["id"] = true // Always exclude ID from updates
	
	for i, field := range fields {
		if !excludeMap[field] {
			filteredFields = append(filteredFields, field)
			filteredValues = append(filteredValues, values[i])
		}
	}
	
	// Build SET clause
	setClauses := make([]string, len(filteredFields))
	for i, field := range filteredFields {
		setClauses[i] = fmt.Sprintf("%s = $%d", field, i+1)
	}
	
	// Add ID parameter
	filteredValues = append(filteredValues, id)
	
	query := fmt.Sprintf(
		"UPDATE %s SET %s WHERE id = $%d",
		entity.TableName(),
		strings.Join(setClauses, ", "),
		len(filteredValues),
	)
	
	return execFunc(ctx, query, filteredValues...)
}

// SelectByID selects an entity by ID
func SelectByID(ctx context.Context, entity Entity, id string, queryFunc func(ctx context.Context, query string, args ...interface{}) (*sql.Rows, error)) error {
	fields, values := entity.FieldMap()
	
	query := fmt.Sprintf(
		"SELECT %s FROM %s WHERE id = $1",
		strings.Join(fields, ", "),
		entity.TableName(),
	)
	
	rows, err := queryFunc(ctx, query, id)
	if err != nil {
		return err
	}
	defer rows.Close()
	
	if !rows.Next() {
		return sql.ErrNoRows
	}
	
	return rows.Scan(values...)
}

// SelectAll selects all entities
func SelectAll(ctx context.Context, entity Entity, queryFunc func(ctx context.Context, query string, args ...interface{}) (*sql.Rows, error)) (*sql.Rows, error) {
	fields, _ := entity.FieldMap()
	
	query := fmt.Sprintf(
		"SELECT %s FROM %s ORDER BY created_at DESC",
		strings.Join(fields, ", "),
		entity.TableName(),
	)
	
	return queryFunc(ctx, query)
}

// SelectByField selects entities by a specific field
func SelectByField(ctx context.Context, entity Entity, fieldName string, fieldValue interface{}, queryFunc func(ctx context.Context, query string, args ...interface{}) (*sql.Rows, error)) (*sql.Rows, error) {
	fields, _ := entity.FieldMap()
	
	query := fmt.Sprintf(
		"SELECT %s FROM %s WHERE %s = $1",
		strings.Join(fields, ", "),
		entity.TableName(),
		fieldName,
	)
	
	return queryFunc(ctx, query, fieldValue)
}

// DeleteByID deletes an entity by ID
func DeleteByID(ctx context.Context, entity Entity, id string, execFunc func(ctx context.Context, query string, args ...interface{}) (sql.Result, error)) (sql.Result, error) {
	query := fmt.Sprintf("DELETE FROM %s WHERE id = $1", entity.TableName())
	return execFunc(ctx, query, id)
}

// PrepareEntityForInsert sets common fields for insert operations
func PrepareEntityForInsert(entity Entity) error {
	fields, values := entity.FieldMap()
	
	now := time.Now()
	
	for i, field := range fields {
		switch field {
		case "id":
			if idField, ok := values[i].(*pgtype.Text); ok {
				if util.IsTextEmpty(*idField) {
					idField.Set(uuid.New().String())
				}
			}
		case "created_at":
			if createdAtField, ok := values[i].(*pgtype.Timestamptz); ok {
				createdAtField.Set(now)
			}
		case "updated_at":
			if updatedAtField, ok := values[i].(*pgtype.Timestamptz); ok {
				updatedAtField.Set(now)
			}
		}
	}
	
	return nil
}

// PrepareEntityForUpdate sets common fields for update operations
func PrepareEntityForUpdate(entity Entity) error {
	fields, values := entity.FieldMap()
	
	now := time.Now()
	
	for i, field := range fields {
		if field == "updated_at" {
			if updatedAtField, ok := values[i].(*pgtype.Timestamptz); ok {
				updatedAtField.Set(now)
			}
		}
	}
	
	return nil
}
