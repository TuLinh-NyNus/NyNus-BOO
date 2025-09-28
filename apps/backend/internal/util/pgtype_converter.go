package util

import (
	"time"

	"github.com/jackc/pgtype"
)

// PgTextToString converts pgtype.Text to string
func PgTextToString(t pgtype.Text) string {
	if t.Status == pgtype.Present {
		return t.String
	}
	return ""
}

// PgInt4ToInt32 converts pgtype.Int4 to int32
func PgInt4ToInt32(i pgtype.Int4) int32 {
	if i.Status == pgtype.Present {
		return i.Int
	}
	return 0
}

// PgInt8ToInt64 converts pgtype.Int8 to int64
func PgInt8ToInt64(i pgtype.Int8) int64 {
	if i.Status == pgtype.Present {
		return i.Int
	}
	return 0
}

// PgFloat8ToFloat64 converts pgtype.Float8 to float64
func PgFloat8ToFloat64(f pgtype.Float8) float64 {
	if f.Status == pgtype.Present {
		return f.Float
	}
	return 0
}

// PgBoolToBool converts pgtype.Bool to bool
func PgBoolToBool(b pgtype.Bool) bool {
	if b.Status == pgtype.Present {
		return b.Bool
	}
	return false
}

// PgTimestamptzToString converts pgtype.Timestamptz to string
func PgTimestamptzToString(t pgtype.Timestamptz) string {
	if t.Status == pgtype.Present {
		return t.Time.Format(time.RFC3339)
	}
	return ""
}

// PgTimestamptzToTime converts pgtype.Timestamptz to time.Time
func PgTimestamptzToTime(t pgtype.Timestamptz) time.Time {
	if t.Status == pgtype.Present {
		return t.Time
	}
	return time.Time{}
}

// PgJSONBToBytes converts pgtype.JSONB to []byte
func PgJSONBToBytes(j pgtype.JSONB) []byte {
	if j.Status == pgtype.Present {
		return j.Bytes
	}
	return nil
}

// PgJSONBToString converts pgtype.JSONB to string
func PgJSONBToString(j pgtype.JSONB) string {
	if j.Status == pgtype.Present {
		return string(j.Bytes)
	}
	return ""
}

// PgTextArrayToStringSlice converts pgtype.TextArray to []string
func PgTextArrayToStringSlice(ta pgtype.TextArray) []string {
	if ta.Status == pgtype.Present {
		result := make([]string, 0, len(ta.Elements))
		for _, elem := range ta.Elements {
			if elem.Status == pgtype.Present {
				result = append(result, elem.String)
			}
		}
		return result
	}
	return nil
}

// StringToPgText converts string to pgtype.Text
func StringToPgText(s string) pgtype.Text {
	if s == "" {
		return pgtype.Text{Status: pgtype.Null}
	}
	return pgtype.Text{String: s, Status: pgtype.Present}
}

// Int32ToPgInt4 converts int32 to pgtype.Int4
func Int32ToPgInt4(i int32) pgtype.Int4 {
	return pgtype.Int4{Int: i, Status: pgtype.Present}
}

// Int64ToPgInt8 converts int64 to pgtype.Int8
func Int64ToPgInt8(i int64) pgtype.Int8 {
	return pgtype.Int8{Int: i, Status: pgtype.Present}
}

// Float64ToPgFloat8 converts float64 to pgtype.Float8
func Float64ToPgFloat8(f float64) pgtype.Float8 {
	return pgtype.Float8{Float: f, Status: pgtype.Present}
}

// BoolToPgBool converts bool to pgtype.Bool
func BoolToPgBool(b bool) pgtype.Bool {
	return pgtype.Bool{Bool: b, Status: pgtype.Present}
}

// TimeToPgTimestamptz converts time.Time to pgtype.Timestamptz
func TimeToPgTimestamptz(t time.Time) pgtype.Timestamptz {
	if t.IsZero() {
		return pgtype.Timestamptz{Status: pgtype.Null}
	}
	return pgtype.Timestamptz{Time: t, Status: pgtype.Present}
}

// BytesToPgJSONB converts []byte to pgtype.JSONB
func BytesToPgJSONB(b []byte) pgtype.JSONB {
	if len(b) == 0 {
		return pgtype.JSONB{Status: pgtype.Null}
	}
	return pgtype.JSONB{Bytes: b, Status: pgtype.Present}
}

// StringSliceToPgTextArray converts []string to pgtype.TextArray
func StringSliceToPgTextArray(ss []string) pgtype.TextArray {
	if len(ss) == 0 {
		return pgtype.TextArray{Status: pgtype.Null}
	}

	elements := make([]pgtype.Text, len(ss))
	for i, s := range ss {
		elements[i] = pgtype.Text{String: s, Status: pgtype.Present}
	}

	return pgtype.TextArray{
		Elements: elements,
		Status:   pgtype.Present,
	}
}

// PgTextToNullString converts pgtype.Text to sql.NullString
func PgTextToNullString(t pgtype.Text) interface{} {
	if t.Status == pgtype.Present {
		return t.String
	}
	return nil
}

// PgJSONBToNullString converts pgtype.JSONB to sql.NullString
func PgJSONBToNullString(j pgtype.JSONB) interface{} {
	if j.Status == pgtype.Present {
		return string(j.Bytes)
	}
	return nil
}

// IsTextEmpty checks if a pgtype.Text is empty or null
func IsTextEmpty(t pgtype.Text) bool {
	return t.Status != pgtype.Present || t.String == ""
}

// IntToPgInt4 converts int32 to pgtype.Int4 (alias for Int32ToPgInt4)
func IntToPgInt4(value int32) pgtype.Int4 {
	return Int32ToPgInt4(value)
}

// TimestamptzToPgType converts time.Time to pgtype.Timestamptz (alias for TimeToPgTimestamptz)
func TimestamptzToPgType(value time.Time) pgtype.Timestamptz {
	return TimeToPgTimestamptz(value)
}

// IntToPgInt8 converts int64 to pgtype.Int8 (alias for Int64ToPgInt8)
func IntToPgInt8(value int64) pgtype.Int8 {
	return Int64ToPgInt8(value)
}
