package entity

import "fmt"

// ErrNotFound represents a resource not found error
type ErrNotFound struct {
	Resource string
	ID       string
}

func (e *ErrNotFound) Error() string {
	if e.ID != "" {
		return fmt.Sprintf("%s with ID '%s' not found", e.Resource, e.ID)
	}
	return fmt.Sprintf("%s not found", e.Resource)
}

// ErrAlreadyExists represents a resource already exists error
type ErrAlreadyExists struct {
	Resource string
	Field    string
	Value    string
}

func (e *ErrAlreadyExists) Error() string {
	return fmt.Sprintf("%s with %s '%s' already exists", e.Resource, e.Field, e.Value)
}

// ErrUnauthorized represents an unauthorized access error
type ErrUnauthorized struct {
	Action   string
	Resource string
	Reason   string
}

func (e *ErrUnauthorized) Error() string {
	if e.Reason != "" {
		return fmt.Sprintf("unauthorized to %s %s: %s", e.Action, e.Resource, e.Reason)
	}
	return fmt.Sprintf("unauthorized to %s %s", e.Action, e.Resource)
}

// ErrValidation represents a validation error
type ErrValidation struct {
	Field   string
	Message string
}

func (e *ErrValidation) Error() string {
	return fmt.Sprintf("validation error for field '%s': %s", e.Field, e.Message)
}

// ErrInternal represents an internal server error
type ErrInternal struct {
	Message string
	Cause   error
}

func (e *ErrInternal) Error() string {
	if e.Cause != nil {
		return fmt.Sprintf("internal error: %s (caused by: %v)", e.Message, e.Cause)
	}
	return fmt.Sprintf("internal error: %s", e.Message)
}

func (e *ErrInternal) Unwrap() error {
	return e.Cause
}
