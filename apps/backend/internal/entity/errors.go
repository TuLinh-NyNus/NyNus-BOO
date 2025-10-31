package entity

import "fmt"

// ErrInvalidInput represents a validation error
type ErrInvalidInput struct {
	Field   string
	Message string
}

// Error implements the error interface
func (e ErrInvalidInput) Error() string {
	return fmt.Sprintf("%s: %s", e.Field, e.Message)
}

// ErrNotFound represents a not found error
type ErrNotFound struct {
	Entity string
	ID     string
}

// Error implements the error interface
func (e ErrNotFound) Error() string {
	return fmt.Sprintf("%s with ID %s not found", e.Entity, e.ID)
}
