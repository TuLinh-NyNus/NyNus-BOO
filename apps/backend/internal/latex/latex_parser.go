package latex

import (
	"fmt"
	"strings"

	"github.com/AnhPhan49/exam-bank-system/apps/backend/internal/entity"
	"github.com/google/uuid"
	"github.com/jackc/pgtype"
)

// LaTeXQuestionParser orchestrates the complete parsing process
type LaTeXQuestionParser struct {
	bp  *BracketParser
	qcp *QuestionCodeParser
	ce  *ContentExtractor
	ae  *AnswerExtractor
}

// NewLaTeXQuestionParser creates a new LaTeX question parser
func NewLaTeXQuestionParser() *LaTeXQuestionParser {
	return &LaTeXQuestionParser{
		bp:  NewBracketParser(),
		qcp: NewQuestionCodeParser(),
		ce:  NewContentExtractor(),
		ae:  NewAnswerExtractor(),
	}
}

// ParseLatexContent parses complete LaTeX file and extracts all questions
func (p *LaTeXQuestionParser) ParseLatexContent(latexContent string) ([]entity.Question, []entity.QuestionCode, []string) {
	var questions []entity.Question
	var questionCodes []entity.QuestionCode
	var errors []string

	// Extract question blocks
	questionBlocks := p.bp.ExtractEnvironmentContent(latexContent, "ex")

	// Track unique question codes
	seenCodes := make(map[string]bool)

	for i, block := range questionBlocks {
		question, questionCode, err := p.ParseSingleQuestion(block)
		if err != nil {
			errors = append(errors, fmt.Sprintf("Question block %d: %v", i+1, err))
			continue
		}

		if question != nil {
			// Assign sequential ID
			question.ID.Set(fmt.Sprintf("q_%d", len(questions)+1))
			questions = append(questions, *question)

			// Collect unique question codes
			if questionCode != nil && !seenCodes[questionCode.Code.String] {
				questionCodes = append(questionCodes, *questionCode)
				seenCodes[questionCode.Code.String] = true
			}
		}
	}

	return questions, questionCodes, errors
}

// ParseSingleQuestion parses a single question block into Question and QuestionCode entities
func (p *LaTeXQuestionParser) ParseSingleQuestion(questionBlock string) (*entity.Question, *entity.QuestionCode, error) {
	// Step 1: Extract metadata (questionCode, subcount, source)
	questionCode, subcount, source := p.qcp.ParseMetadata(questionBlock)

	// Step 2: Extract and clean content
	// Since questionBlock is already extracted from ex environment,
	// we need to apply content cleaning steps directly
	rawContent := strings.TrimSpace(questionBlock)
	if rawContent == "" {
		return nil, nil, fmt.Errorf("no content found in question block")
	}

	// Apply 7-step content cleaning process
	cleanContent := rawContent

	// Step 1: Remove \begin{ex} and \end{ex} tags (already done by BracketParser)
	// Step 2: Remove metadata patterns
	cleanContent = p.ce.RemoveMetadataPatterns(cleanContent)

	// Step 3: Handle layout commands
	cleanContent = p.ce.HandleLayoutCommands(cleanContent)

	// Step 4: Remove image commands
	cleanContent = p.ce.RemoveImageCommands(cleanContent)

	// Step 5: Remove answer commands and their content completely
	cleanContent = p.ce.RemoveAnswerCommands(cleanContent)

	// Step 6: Remove solution section
	cleanContent = p.ce.RemoveSolutionSection(cleanContent)

	// Step 7: Normalize whitespace
	cleanContent = p.ce.NormalizeWhitespace(cleanContent)

	// Validate clean content is not empty
	if strings.TrimSpace(cleanContent) == "" {
		return nil, nil, fmt.Errorf("no valid content found after cleaning")
	}

	// Step 3: Identify question type
	questionType := p.ae.IdentifyQuestionType(rawContent)

	// Validate question type
	if questionType == "" {
		return nil, nil, fmt.Errorf("unable to identify question type")
	}

	// Skip MA (Matching) questions as requested in design
	if questionType == string(entity.QuestionTypeMA) {
		return nil, nil, fmt.Errorf("matching questions (MA) are not supported yet")
	}

	// Step 4: Extract answers and correct answer
	answersJSON, correctAnswerJSON := p.ae.ExtractAnswersAndCorrect(rawContent, questionType)

	// Validate answers for MC and TF questions
	if (questionType == string(entity.QuestionTypeMC) || questionType == string(entity.QuestionTypeTF)) && len(answersJSON.Bytes) == 0 {
		return nil, nil, fmt.Errorf("no answers found for %s question", questionType)
	}

	// Step 5: Extract solution
	solution := p.ae.ExtractSolution(rawContent)

	// Step 6: Create Question entity
	question := &entity.Question{}

	// Set required fields
	question.RawContent.Set(rawContent)
	question.Content.Set(cleanContent)
	question.Type.Set(questionType)

	// Set optional fields
	if subcount != "" {
		question.Subcount.Set(subcount)
	} else {
		question.Subcount.Status = pgtype.Null
	}

	if source != "" {
		question.Source.Set(source)
	} else {
		question.Source.Status = pgtype.Null
	}

	if solution != "" {
		question.Solution.Set(solution)
	} else {
		question.Solution.Status = pgtype.Null
	}

	// Set answers and correct answer (JSONB fields)
	question.Answers = answersJSON
	question.CorrectAnswer = correctAnswerJSON

	// Set defaults
	question.UsageCount.Set(0)
	question.Creator.Set("ADMIN")
	question.Feedback.Set(0)
	question.Difficulty.Set(string(entity.QuestionDifficultyMedium))

	// Determine status based on content completeness
	question.Status.Set(p.determineQuestionStatus(questionType, answersJSON, correctAnswerJSON))

	// Set question code ID if available
	if questionCode != nil {
		question.QuestionCodeID.Set(questionCode.Code.String)
	} else {
		question.QuestionCodeID.Status = pgtype.Null
	}

	// Initialize empty tag array
	question.Tag.Set([]string{})

	return question, questionCode, nil
}

// ParseFromRawLatex parses raw LaTeX content and returns single question
func (p *LaTeXQuestionParser) ParseFromRawLatex(rawLatex string) (*entity.Question, error) {
	question, _, err := p.ParseSingleQuestion(rawLatex)
	if err != nil {
		return nil, err
	}

	if question == nil {
		return nil, fmt.Errorf("failed to parse question from LaTeX content")
	}

	// Generate UUID for ID
	question.ID.Set(uuid.New().String())

	return question, nil
}

// determineQuestionStatus determines question status based on completeness
func (p *LaTeXQuestionParser) determineQuestionStatus(questionType string, answers, correctAnswer pgtype.JSONB) string {
	switch questionType {
	case string(entity.QuestionTypeMC):
		if answers.Status == pgtype.Present && correctAnswer.Status == pgtype.Present {
			return string(entity.QuestionStatusActive)
		}
		return string(entity.QuestionStatusPending)

	case string(entity.QuestionTypeTF):
		if answers.Status == pgtype.Present {
			return string(entity.QuestionStatusActive)
		}
		return string(entity.QuestionStatusPending)

	case string(entity.QuestionTypeSA):
		if correctAnswer.Status == pgtype.Present {
			return string(entity.QuestionStatusActive)
		}
		return string(entity.QuestionStatusPending)

	case string(entity.QuestionTypeES):
		// ES questions are always active (no answers expected)
		return string(entity.QuestionStatusActive)

	default:
		return string(entity.QuestionStatusPending)
	}
}
