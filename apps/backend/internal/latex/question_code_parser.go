package latex

import (
	"regexp"
	"strings"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/jackc/pgtype"
)

// QuestionCodeParser parses question metadata from LaTeX content
type QuestionCodeParser struct {
	bp *BracketParser
}

// NewQuestionCodeParser creates a new question code parser
func NewQuestionCodeParser() *QuestionCodeParser {
	return &QuestionCodeParser{
		bp: NewBracketParser(),
	}
}

// ParseMetadata extracts metadata from question block
func (qcp *QuestionCodeParser) ParseMetadata(content string) (questionCode *entity.QuestionCode, subcount, source string) {
	// Extract question code from %[XXXXX] or %[XXXXX-X] patterns
	questionCode = qcp.ExtractQuestionCode(content)

	// Extract subcount from [XX.N] pattern
	subcount = qcp.ExtractSubcount(content)

	// Extract source from %[Nguồn: "..."] pattern
	source = qcp.ExtractSource(content)

	return questionCode, subcount, source
}

// ExtractQuestionCode extracts and parses question code from content
func (qcp *QuestionCodeParser) ExtractQuestionCode(content string) *entity.QuestionCode {
	// Pattern for question code: %[XXXXX] or %[XXXXX-X]
	patterns := []string{
		`%\s*\[\s*([0-9A-Z]{5,6}(?:-[0-9A-Z])?)\s*\]`,
		`%\s*\[\s*([0-9A-Z]{5,6}(?:-[0-9A-Z])?)\s*\]\s*%?`,
	}

	var codeStr string
	for _, pattern := range patterns {
		re := regexp.MustCompile(pattern)
		matches := re.FindStringSubmatch(content)
		if len(matches) > 1 {
			codeStr = strings.TrimSpace(matches[1])
			break
		}
	}

	if codeStr == "" {
		return nil
	}

	return qcp.parseQuestionCodeString(codeStr)
}

// parseQuestionCodeString parses question code string into QuestionCode entity
func (qcp *QuestionCodeParser) parseQuestionCodeString(codeStr string) *entity.QuestionCode {
	if len(codeStr) < 5 {
		return nil
	}

	qc := &entity.QuestionCode{}
	qc.Code.Set(codeStr)

	// Determine format (ID5 or ID6)
	if strings.Contains(codeStr, "-") {
		qc.Format.Set(string(entity.CodeFormatID6))
		// Parse ID6 format: XXXXX-X (7 characters total)
		parts := strings.Split(codeStr, "-")
		if len(parts) != 2 || len(parts[0]) != 5 || len(parts[1]) != 1 {
			return nil
		}

		baseCode := parts[0]
		formCode := parts[1]

		// Parse base code (5 characters)
		if len(baseCode) >= 5 {
			qc.Grade.Set(string(baseCode[0]))
			qc.Subject.Set(string(baseCode[1]))
			qc.Chapter.Set(string(baseCode[2]))
			qc.Level.Set(string(baseCode[3]))
			qc.Lesson.Set(string(baseCode[4]))
			qc.Form.Set(formCode)
		}
	} else {
		qc.Format.Set(string(entity.CodeFormatID5))
		// Parse ID5 format: XXXXX (5 characters)
		if len(codeStr) >= 5 {
			qc.Grade.Set(string(codeStr[0]))
			qc.Subject.Set(string(codeStr[1]))
			qc.Chapter.Set(string(codeStr[2]))
			qc.Level.Set(string(codeStr[3]))
			qc.Lesson.Set(string(codeStr[4]))
			// Form is null for ID5
			qc.Form.Status = pgtype.Null
		}
	}

	return qc
}

// ExtractSubcount extracts subcount from [XX.N] pattern
func (qcp *QuestionCodeParser) ExtractSubcount(content string) string {
	// Pattern for subcount: [XX.N] where XX is 2 uppercase letters and N is number
	pattern := `\[\s*([A-Z]{2}\.\d+)\s*\]`
	re := regexp.MustCompile(pattern)

	matches := re.FindStringSubmatch(content)
	if len(matches) > 1 {
		return strings.TrimSpace(matches[1])
	}

	return ""
}

// ExtractSource extracts source from %[Nguồn: "..."] pattern
func (qcp *QuestionCodeParser) ExtractSource(content string) string {
	// Pattern for source: %[Nguồn: "..."] or similar
	patterns := []string{
		`%\s*\[\s*Nguồn:\s*"([^"]+)"\s*\]`,
		`%\s*\[\s*Nguồn:\s*([^\]]+)\s*\]`,
		`%\s*\[\s*([^%\[\]]*(?:Thi|Đề|Kiểm tra|Bài tập)[^\[\]]*)\s*\]`,
	}

	for _, pattern := range patterns {
		re := regexp.MustCompile(pattern)
		matches := re.FindStringSubmatch(content)
		if len(matches) > 1 {
			source := strings.TrimSpace(matches[1])
			// Clean up source text
			source = strings.Trim(source, `"'`)
			if source != "" {
				return source
			}
		}
	}

	return ""
}

// ValidateQuestionCode validates a question code format
func (qcp *QuestionCodeParser) ValidateQuestionCode(codeStr string) bool {
	if len(codeStr) < 5 || len(codeStr) > 7 {
		return false
	}

	// Check ID5 format (5 characters)
	if len(codeStr) == 5 {
		return regexp.MustCompile(`^[0-9A-Z]{5}$`).MatchString(codeStr)
	}

	// Check ID6 format (7 characters with dash)
	if len(codeStr) == 7 && strings.Contains(codeStr, "-") {
		parts := strings.Split(codeStr, "-")
		if len(parts) != 2 || len(parts[0]) != 5 || len(parts[1]) != 1 {
			return false
		}
		return regexp.MustCompile(`^[0-9A-Z]{5}-[0-9A-Z]$`).MatchString(codeStr)
	}

	return false
}

// GetQuestionCodeHierarchy returns human-readable hierarchy info
func (qcp *QuestionCodeParser) GetQuestionCodeHierarchy(qc *entity.QuestionCode) map[string]string {
	hierarchy := make(map[string]string)

	if qc.Grade.Status == pgtype.Present {
		hierarchy["grade"] = qcp.getGradeLabel(qc.Grade.String)
	}
	if qc.Subject.Status == pgtype.Present {
		hierarchy["subject"] = qcp.getSubjectLabel(qc.Subject.String)
	}
	if qc.Chapter.Status == pgtype.Present {
		hierarchy["chapter"] = "Chương " + qc.Chapter.String
	}
	if qc.Level.Status == pgtype.Present {
		hierarchy["level"] = qcp.getLevelLabel(qc.Level.String)
	}
	if qc.Lesson.Status == pgtype.Present {
		hierarchy["lesson"] = "Bài " + qc.Lesson.String
	}
	if qc.Form.Status == pgtype.Present {
		hierarchy["form"] = "Dạng " + qc.Form.String
	}

	return hierarchy
}

// getGradeLabel returns human-readable grade label
func (qcp *QuestionCodeParser) getGradeLabel(grade string) string {
	switch grade {
	case "0":
		return "Lớp 10"
	case "1":
		return "Lớp 11"
	case "2":
		return "Lớp 12"
	case "3":
		return "Lớp 3"
	case "4":
		return "Lớp 4"
	case "5":
		return "Lớp 5"
	case "6":
		return "Lớp 6"
	case "7":
		return "Lớp 7"
	case "8":
		return "Lớp 8"
	case "9":
		return "Lớp 9"
	default:
		return "Lớp " + grade
	}
}

// getSubjectLabel returns human-readable subject label
func (qcp *QuestionCodeParser) getSubjectLabel(subject string) string {
	switch subject {
	case "P":
		return "Toán học"
	case "L":
		return "Vật lý"
	case "H":
		return "Hóa học"
	case "S":
		return "Sinh học"
	case "E":
		return "Tiếng Anh"
	case "T":
		return "Lịch sử"
	case "D":
		return "Địa lý"
	default:
		return "Môn " + subject
	}
}

// getLevelLabel returns human-readable level label
func (qcp *QuestionCodeParser) getLevelLabel(level string) string {
	switch level {
	case "N":
		return "Nhận biết"
	case "H":
		return "Thông hiểu"
	case "V":
		return "Vận dụng"
	case "C":
		return "Vận dụng cao"
	case "T":
		return "VIP"
	case "M":
		return "Note"
	default:
		return "Mức " + level
	}
}
