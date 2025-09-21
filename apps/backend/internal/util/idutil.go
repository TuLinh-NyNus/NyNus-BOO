package util

import (
	"crypto/rand"
	"encoding/hex"
	"time"

	"github.com/oklog/ulid/v2"
)

// ULIDNow generates a new ULID with the current timestamp
func ULIDNow() string {
	entropy := ulid.Monotonic(rand.Reader, 0)
	return ulid.MustNew(ulid.Timestamp(time.Now()), entropy).String()
}

// ULIDFromTime generates a new ULID with the specified timestamp
func ULIDFromTime(t time.Time) string {
	entropy := ulid.Monotonic(rand.Reader, 0)
	return ulid.MustNew(ulid.Timestamp(t), entropy).String()
}

// ParseULID parses a ULID string and returns the ULID
func ParseULID(s string) (ulid.ULID, error) {
	return ulid.Parse(s)
}

// ULIDTime extracts the timestamp from a ULID string
func ULIDTime(s string) (time.Time, error) {
	id, err := ulid.Parse(s)
	if err != nil {
		return time.Time{}, err
	}
	return ulid.Time(id.Time()), nil
}

// GenerateSecureToken generates a secure random token as hex string
func GenerateSecureToken(bytes int) string {
	b := make([]byte, bytes)
	rand.Read(b)
	return hex.EncodeToString(b)
}
