package repository

import "errors"

// Common repository errors
var (
	ErrNotFound      = errors.New("record not found")
	ErrInvalidField  = errors.New("invalid field name")
	ErrUserNotFound  = errors.New("user not found")
	ErrDuplicateKey  = errors.New("duplicate key violation")
	ErrForeignKey    = errors.New("foreign key violation")
	ErrInvalidInput  = errors.New("invalid input")
)

// GenerateID generates a unique ID for entities
func GenerateID() string {
	// Simple implementation - in production use UUID or similar
	return generateUniqueID()
}

func generateUniqueID() string {
	// Placeholder - implement proper UUID generation
	return "id_" + generateRandomString(16)
}

func generateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	result := make([]byte, length)
	for i := range result {
		result[i] = charset[i%len(charset)]
	}
	return string(result)
}