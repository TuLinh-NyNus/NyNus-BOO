package latex

import (
	"encoding/json"
	"regexp"
	"strings"

	"exam-bank-system/apps/backend/internal/entity"
	"github.com/jackc/pgtype"
)

// AnswerExtractor extracts answers and correct answers from LaTeX content
type AnswerExtractor struct {
	bp *BracketParser
}

// QuestionAnswer represents a single answer option
type QuestionAnswer struct {
	ID        int    `json:"id"`
	Content   string `json:"content"`
	IsCorrect bool   `json:"isCorrect"`
}

// NewAnswerExtractor creates a new answer extractor
func NewAnswerExtractor() *AnswerExtractor {
	return &AnswerExtractor{
		bp: NewBracketParser(),
	}
}

// IdentifyQuestionType identifies question type based on LaTeX commands
func (ae *AnswerExtractor) IdentifyQuestionType(content string) string {
	// Remove solution section for analysis
	contentWithoutSolution := ae.removeSolutionForAnalysis(content)

	// Priority order:
	// 1. Check for choiceTF variants â†’ TF
	if strings.Contains(contentWithoutSolution, "\\choiceTF") {
		return string(entity.QuestionTypeTF)
	}

	// 2. Check for choice (not choiceTF) â†’ MC
	if strings.Contains(contentWithoutSolution, "\\choice") {
		return string(entity.QuestionTypeMC)
	}

	// 3. Check for shortans â†’ SA
	if strings.Contains(contentWithoutSolution, "\\shortans") {
		return string(entity.QuestionTypeSA)
	}

	// 4. Check for matching â†’ MA
	if strings.Contains(contentWithoutSolution, "\\matching") {
		return string(entity.QuestionTypeMA)
	}

	// 5. Default to essay
	return string(entity.QuestionTypeES)
}

// ExtractAnswersAndCorrect extracts answers and correct answer based on question type
func (ae *AnswerExtractor) ExtractAnswersAndCorrect(content, questionType string) (pgtype.JSONB, pgtype.JSONB) {
	var answersJSON, correctAnswerJSON pgtype.JSONB

	switch questionType {
	case string(entity.QuestionTypeMC):
		answers, correctAnswer := ae.extractMCAnswers(content)
		if len(answers) > 0 {
			answersData, _ := json.Marshal(answers)
			answersJSON.Set(answersData)
		}
		if correctAnswer != "" {
			correctAnswerJSON.Set([]byte(`"` + correctAnswer + `"`))
		}

	case string(entity.QuestionTypeTF):
		answers, correctAnswers := ae.extractTFAnswers(content)
		if len(answers) > 0 {
			answersData, _ := json.Marshal(answers)
			answersJSON.Set(answersData)
		}
		if len(correctAnswers) > 0 {
			correctAnswersData, _ := json.Marshal(correctAnswers)
			correctAnswerJSON.Set(correctAnswersData)
		}

	case string(entity.QuestionTypeSA):
		correctAnswer := ae.extractSAAnswer(content)
		if correctAnswer != "" {
			// For SA, create a single answer object
			answers := []QuestionAnswer{
				{ID: 0, Content: correctAnswer, IsCorrect: true},
			}
			answersData, _ := json.Marshal(answers)
			answersJSON.Set(answersData)
			correctAnswerJSON.Set([]byte(`"` + correctAnswer + `"`))
		}

	case string(entity.QuestionTypeES):
		// ES questions don't have predefined answers
		answersJSON.Status = pgtype.Null
		correctAnswerJSON.Status = pgtype.Null
	}

	return answersJSON, correctAnswerJSON
}

// ExtractSolution extracts solution from \loigiai{...} command
func (ae *AnswerExtractor) ExtractSolution(content string) string {
	loigiaiStart := strings.Index(content, "\\loigiai")
	if loigiaiStart == -1 {
		return ""
	}

	// Find the opening brace after \loigiai
	braceStart := strings.Index(content[loigiaiStart:], "{")
	if braceStart == -1 {
		return ""
	}
	braceStart += loigiaiStart

	// Extract solution using bracket parser
	solution := ae.bp.ExtractContentFromBraces(content, braceStart)
	return strings.TrimSpace(solution)
}

// extractMCAnswers extracts answers for Multiple Choice questions
func (ae *AnswerExtractor) extractMCAnswers(content string) ([]QuestionAnswer, string) {
	var answers []QuestionAnswer
	var correctAnswer string

	// Find \choice command (but not \choiceTF)
	choicePos := ae.findChoicePosition(content)
	if choicePos == -1 {
		return answers, correctAnswer
	}

	// Find the end of the choice command (after optional parameters)
	startPos := choicePos
	for startPos < len(content) && content[startPos] != '\n' && content[startPos] != '{' {
		startPos++
	}

	answerIndex := 0

	// Extract answers after \choice
	for startPos < len(content) {
		// Skip whitespace
		for startPos < len(content) && (content[startPos] == ' ' || content[startPos] == '\t' || content[startPos] == '\n') {
			startPos++
		}

		if startPos >= len(content) || content[startPos] != '{' {
			break
		}

		// Extract answer content
		answerContent := ae.bp.ExtractContentFromBraces(content, startPos)
		if answerContent == "" {
			break
		}

		// Trim and check for correct answer
		trimmedContent := strings.TrimSpace(answerContent)
		isCorrect := false

		// Check for \True at the end (most common case)
		if strings.HasSuffix(trimmedContent, " \\True") {
			isCorrect = true
			answerContent = strings.TrimSpace(trimmedContent[:len(trimmedContent)-6]) // Remove ' \True'
			correctAnswer = answerContent
		} else if strings.HasSuffix(trimmedContent, "\\True") {
			isCorrect = true
			answerContent = strings.TrimSpace(trimmedContent[:len(trimmedContent)-5]) // Remove '\True'
			correctAnswer = answerContent
		} else if strings.HasPrefix(trimmedContent, "\\True ") {
			isCorrect = true
			answerContent = strings.TrimSpace(trimmedContent[6:]) // Remove '\True '
			correctAnswer = answerContent
		} else if strings.HasPrefix(trimmedContent, "\\True") {
			isCorrect = true
			answerContent = strings.TrimSpace(trimmedContent[5:]) // Remove '\True'
			correctAnswer = answerContent
		} else {
			answerContent = trimmedContent
		}

		answers = append(answers, QuestionAnswer{
			ID:        answerIndex,
			Content:   answerContent,
			IsCorrect: isCorrect,
		})

		// Move past this answer
		startPos = ae.findClosingBrace(content, startPos) + 1
		answerIndex++
	}

	return answers, correctAnswer
}

// extractTFAnswers extracts answers for True/False questions
func (ae *AnswerExtractor) extractTFAnswers(content string) ([]QuestionAnswer, []string) {
	var answers []QuestionAnswer
	var correctAnswers []string

	// Find \choiceTF command
	choiceTFPos := strings.Index(content, "\\choiceTF")
	if choiceTFPos == -1 {
		return answers, correctAnswers
	}

	// Find the end of the choiceTF command (after optional parameters)
	startPos := choiceTFPos
	for startPos < len(content) && content[startPos] != '\n' && content[startPos] != '{' {
		startPos++
	}

	answerIndex := 0

	// Extract answers after \choiceTF
	for startPos < len(content) {
		// Skip whitespace
		for startPos < len(content) && (content[startPos] == ' ' || content[startPos] == '\t' || content[startPos] == '\n') {
			startPos++
		}

		if startPos >= len(content) || content[startPos] != '{' {
			break
		}

		// Extract answer content
		answerContent := ae.bp.ExtractContentFromBraces(content, startPos)
		if answerContent == "" {
			break
		}

		// Trim and check for correct answer
		trimmedContent := strings.TrimSpace(answerContent)
		isCorrect := false

		// Check for \True at the end (most common case)
		if strings.HasSuffix(trimmedContent, " \\True") {
			isCorrect = true
			answerContent = strings.TrimSpace(trimmedContent[:len(trimmedContent)-6]) // Remove ' \True'
			correctAnswers = append(correctAnswers, answerContent)
		} else if strings.HasSuffix(trimmedContent, "\\True") {
			isCorrect = true
			answerContent = strings.TrimSpace(trimmedContent[:len(trimmedContent)-5]) // Remove '\True'
			correctAnswers = append(correctAnswers, answerContent)
		} else if strings.HasSuffix(trimmedContent, " \\False") {
			// \False is also a correct answer marker for TF questions
			isCorrect = true
			answerContent = strings.TrimSpace(trimmedContent[:len(trimmedContent)-7]) // Remove ' \False'
			correctAnswers = append(correctAnswers, answerContent)
		} else if strings.HasSuffix(trimmedContent, "\\False") {
			isCorrect = true
			answerContent = strings.TrimSpace(trimmedContent[:len(trimmedContent)-6]) // Remove '\False'
			correctAnswers = append(correctAnswers, answerContent)
		} else if strings.HasPrefix(trimmedContent, "\\True ") {
			isCorrect = true
			answerContent = strings.TrimSpace(trimmedContent[6:]) // Remove '\True '
			correctAnswers = append(correctAnswers, answerContent)
		} else if strings.HasPrefix(trimmedContent, "\\True") {
			isCorrect = true
			answerContent = strings.TrimSpace(trimmedContent[5:]) // Remove '\True'
			correctAnswers = append(correctAnswers, answerContent)
		} else if strings.HasPrefix(trimmedContent, "\\False ") {
			isCorrect = true
			answerContent = strings.TrimSpace(trimmedContent[7:]) // Remove '\False '
			correctAnswers = append(correctAnswers, answerContent)
		} else if strings.HasPrefix(trimmedContent, "\\False") {
			isCorrect = true
			answerContent = strings.TrimSpace(trimmedContent[6:]) // Remove '\False'
			correctAnswers = append(correctAnswers, answerContent)
		} else {
			answerContent = trimmedContent
		}

		answers = append(answers, QuestionAnswer{
			ID:        answerIndex,
			Content:   answerContent,
			IsCorrect: isCorrect,
		})

		// Move past this answer
		startPos = ae.findClosingBrace(content, startPos) + 1
		answerIndex++
	}

	return answers, correctAnswers
}

// extractSAAnswer extracts answer for Short Answer questions
func (ae *AnswerExtractor) extractSAAnswer(content string) string {
	// Find \shortans command
	shortansPos := strings.Index(content, "\\shortans")
	if shortansPos == -1 {
		return ""
	}

	// Start from after \shortans
	pos := shortansPos + len("\\shortans")

	// Skip optional parameters [...]
	for pos < len(content) && (content[pos] == ' ' || content[pos] == '\t') {
		pos++
	}

	if pos < len(content) && content[pos] == '[' {
		// Skip optional parameter [...]
		bracketLevel := 1
		pos++
		for pos < len(content) && bracketLevel > 0 {
			if content[pos] == '[' {
				bracketLevel++
			} else if content[pos] == ']' {
				bracketLevel--
			}
			pos++
		}
	}

	// Skip whitespace again
	for pos < len(content) && (content[pos] == ' ' || content[pos] == '\t') {
		pos++
	}

	// Extract answer from braces {...}
	if pos < len(content) && content[pos] == '{' {
		answer := ae.bp.ExtractContentFromBraces(content, pos)
		if answer != "" {
			// Clean up the answer
			answer = strings.TrimSpace(answer)
			// Remove quotes if present
			answer = strings.Trim(answer, `'"`)
			return answer
		}
	}

	return ""
}

// findChoicePosition finds \choice command position (but not \choiceTF)
func (ae *AnswerExtractor) findChoicePosition(content string) int {
	pos := 0
	for pos < len(content) {
		choicePos := strings.Index(content[pos:], "\\choice")
		if choicePos == -1 {
			break
		}
		choicePos += pos

		// Check if it's not \choiceTF
		if choicePos+9 >= len(content) || content[choicePos:choicePos+9] != "\\choiceTF" {
			return choicePos
		}
		pos = choicePos + 1
	}
	return -1
}

// removeSolutionForAnalysis removes solution section for type analysis
func (ae *AnswerExtractor) removeSolutionForAnalysis(content string) string {
	re := regexp.MustCompile(`\\loigiai\s*\{.*?\}`)
	matches := re.FindStringSubmatch(content)
	if len(matches) > 0 {
		return content[:strings.Index(content, matches[0])]
	}
	return content
}

// findClosingBrace finds the position of the closing brace
func (ae *AnswerExtractor) findClosingBrace(content string, startPos int) int {
	if startPos >= len(content) || content[startPos] != '{' {
		return startPos
	}

	braceLevel := 1
	pos := startPos + 1

	for pos < len(content) && braceLevel > 0 {
		char := content[pos]

		// Handle escaped characters
		if char == '\\' && pos+1 < len(content) {
			pos += 2
			continue
		}

		if char == '{' {
			braceLevel++
		} else if char == '}' {
			braceLevel--
		}

		pos++
	}

	return pos - 1 // Position of closing brace
}
