package util

import (
	"time"

	"github.com/jackc/pgtype"
)

// StringToPgText converts a string to pgtype.Text
func StringToPgText(s string) pgtype.Text {
	var text pgtype.Text
	text.Set(s)
	return text
}

// PgTextToString converts pgtype.Text to string
func PgTextToString(text pgtype.Text) string {
	if text.Status == pgtype.Present {
		return text.String
	}
	return ""
}

// BoolToPgBool converts a bool to pgtype.Bool
func BoolToPgBool(b bool) pgtype.Bool {
	var pgBool pgtype.Bool
	pgBool.Set(b)
	return pgBool
}

// PgBoolToBool converts pgtype.Bool to bool
func PgBoolToBool(pgBool pgtype.Bool) bool {
	if pgBool.Status == pgtype.Present {
		return pgBool.Bool
	}
	return false
}

// TimeToPgTimestamptz converts time.Time to pgtype.Timestamptz
func TimeToPgTimestamptz(t time.Time) pgtype.Timestamptz {
	var ts pgtype.Timestamptz
	ts.Set(t)
	return ts
}

// PgTimestamptzToTime converts pgtype.Timestamptz to time.Time
func PgTimestamptzToTime(ts pgtype.Timestamptz) time.Time {
	if ts.Status == pgtype.Present {
		return ts.Time
	}
	return time.Time{}
}

// IsTextEmpty checks if pgtype.Text is empty or null
func IsTextEmpty(text pgtype.Text) bool {
	return text.Status != pgtype.Present || text.String == ""
}

// IsTextEqual compares pgtype.Text with string
func IsTextEqual(text pgtype.Text, s string) bool {
	return text.Status == pgtype.Present && text.String == s
}

// SetTextIfNotEmpty sets pgtype.Text if string is not empty
func SetTextIfNotEmpty(text *pgtype.Text, s string) {
	if s != "" {
		text.Set(s)
	}
}

// SetBoolIfNotNil sets pgtype.Bool if bool pointer is not nil
func SetBoolIfNotNil(pgBool *pgtype.Bool, b *bool) {
	if b != nil {
		pgBool.Set(*b)
	}
}

// PgJSONBToString converts pgtype.JSONB to string
func PgJSONBToString(jsonb pgtype.JSONB) string {
	if jsonb.Status == pgtype.Present {
		return string(jsonb.Bytes)
	}
	return ""
}

// StringToPgJSONB converts a string to pgtype.JSONB
func StringToPgJSONB(s string) pgtype.JSONB {
	var jsonb pgtype.JSONB
	jsonb.Set(s)
	return jsonb
}
