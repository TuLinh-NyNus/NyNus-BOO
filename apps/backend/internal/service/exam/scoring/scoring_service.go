package scoring

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
)

// ScoringService handles exam scoring algorithms
type ScoringService struct{}

// NewScoringService creates a new scoring service instance
func NewScoringService() *ScoringService {
	return &ScoringService{}
}

// AnswerData represents the structure of answer_data JSONB field
type AnswerData struct {
	QuestionType string      `json:"question_type"`
	AnswerData   interface{} `json:"answer_data"`
}

// MCAnswerData represents Multiple Choice answer data
type MCAnswerData struct {
	SelectedAnswerID string `json:"selected_answer_id"`
}

// TFAnswerData represents True/False answer data (4 statements)
type TFAnswerData struct {
	SelectedAnswerIDs []string      `json:"selected_answer_ids"`
	Statements        []TFStatement `json:"statements"`
}

// TFStatement represents a single True/False statement
type TFStatement struct {
	ID       string `json:"id"`
	Content  string `json:"content"`
	Selected bool   `json:"selected"`
}

// SAAnswerData represents Short Answer data
type SAAnswerData struct {
	AnswerText      string `json:"answer_text"`
	NormalizedText  string `json:"normalized_text"`
	CaseSensitive   bool   `json:"case_sensitive"`
}

// ESAnswerData represents Essay answer data
type ESAnswerData struct {
	EssayText      string  `json:"essay_text"`
	WordCount      int     `json:"word_count"`
	CharacterCount int     `json:"character_count"`
	ManualScore    *float64 `json:"manual_score"`
}

// QuestionCorrectAnswer represents the correct answer structure from question table
type QuestionCorrectAnswer struct {
	QuestionType string      `json:"question_type"`
	CorrectData  interface{} `json:"correct_data"`
}

// MCCorrectData represents correct answer for MC questions
type MCCorrectData struct {
	CorrectAnswerID string `json:"correct_answer_id"`
}

// TFCorrectData represents correct answer for TF questions
type TFCorrectData struct {
	CorrectAnswerIDs []string `json:"correct_answer_ids"`
	AllAnswerIDs     []string `json:"all_answer_ids"`
}

// SACorrectData represents correct answer for SA questions
type SACorrectData struct {
	CorrectAnswers []string `json:"correct_answers"`
	CaseSensitive  bool     `json:"case_sensitive"`
}

// CalculateMCScore calculates score for Multiple Choice questions
// Returns 1.0 if correct, 0.0 if incorrect
func (s *ScoringService) CalculateMCScore(userAnswer, correctAnswer []byte, maxPoints float64) (float64, bool, error) {
	var userMC MCAnswerData
	var correctMC MCCorrectData

	// Parse user answer
	var userAnswerData AnswerData
	if err := json.Unmarshal(userAnswer, &userAnswerData); err != nil {
		return 0, false, fmt.Errorf("failed to parse user answer: %w", err)
	}

	userMCBytes, err := json.Marshal(userAnswerData.AnswerData)
	if err != nil {
		return 0, false, fmt.Errorf("failed to marshal user MC data: %w", err)
	}

	if err := json.Unmarshal(userMCBytes, &userMC); err != nil {
		return 0, false, fmt.Errorf("failed to parse user MC answer: %w", err)
	}

	// Parse correct answer
	var correctAnswerData QuestionCorrectAnswer
	if err := json.Unmarshal(correctAnswer, &correctAnswerData); err != nil {
		return 0, false, fmt.Errorf("failed to parse correct answer: %w", err)
	}

	correctMCBytes, err := json.Marshal(correctAnswerData.CorrectData)
	if err != nil {
		return 0, false, fmt.Errorf("failed to marshal correct MC data: %w", err)
	}

	if err := json.Unmarshal(correctMCBytes, &correctMC); err != nil {
		return 0, false, fmt.Errorf("failed to parse correct MC answer: %w", err)
	}

	// Compare answers
	isCorrect := userMC.SelectedAnswerID == correctMC.CorrectAnswerID
	if isCorrect {
		return maxPoints, true, nil
	}
	return 0, false, nil
}

// CalculateTFScore calculates score for True/False questions (4 statements)
// Scoring rule: 1 correct = 10%, 2 correct = 25%, 3 correct = 50%, 4 correct = 100%
func (s *ScoringService) CalculateTFScore(userAnswer, correctAnswer []byte, maxPoints float64) (float64, bool, error) {
	var userTF TFAnswerData
	var correctTF TFCorrectData

	// Parse user answer
	var userAnswerData AnswerData
	if err := json.Unmarshal(userAnswer, &userAnswerData); err != nil {
		return 0, false, fmt.Errorf("failed to parse user answer: %w", err)
	}

	userTFBytes, err := json.Marshal(userAnswerData.AnswerData)
	if err != nil {
		return 0, false, fmt.Errorf("failed to marshal user TF data: %w", err)
	}

	if err := json.Unmarshal(userTFBytes, &userTF); err != nil {
		return 0, false, fmt.Errorf("failed to parse user TF answer: %w", err)
	}

	// Parse correct answer
	var correctAnswerData QuestionCorrectAnswer
	if err := json.Unmarshal(correctAnswer, &correctAnswerData); err != nil {
		return 0, false, fmt.Errorf("failed to parse correct answer: %w", err)
	}

	correctTFBytes, err := json.Marshal(correctAnswerData.CorrectData)
	if err != nil {
		return 0, false, fmt.Errorf("failed to marshal correct TF data: %w", err)
	}

	if err := json.Unmarshal(correctTFBytes, &correctTF); err != nil {
		return 0, false, fmt.Errorf("failed to parse correct TF answer: %w", err)
	}

	// Validate 4 statements requirement
	if len(correctTF.AllAnswerIDs) != 4 {
		return 0, false, fmt.Errorf("TF questions must have exactly 4 statements, got %d", len(correctTF.AllAnswerIDs))
	}

	// Count correct selections and correct non-selections
	correctCount := 0
	userSelectedMap := make(map[string]bool)
	correctSelectedMap := make(map[string]bool)

	// Create maps for faster lookup
	for _, id := range userTF.SelectedAnswerIDs {
		userSelectedMap[id] = true
	}
	for _, id := range correctTF.CorrectAnswerIDs {
		correctSelectedMap[id] = true
	}

	// Count correct answers (both correct selections and correct non-selections)
	for _, answerID := range correctTF.AllAnswerIDs {
		userSelected := userSelectedMap[answerID]
		shouldBeSelected := correctSelectedMap[answerID]

		if userSelected == shouldBeSelected {
			correctCount++
		}
	}

	// Apply TF scoring rule
	var scoreMultiplier float64
	switch correctCount {
	case 4:
		scoreMultiplier = 1.0 // 100%
	case 3:
		scoreMultiplier = 0.5 // 50%
	case 2:
		scoreMultiplier = 0.25 // 25%
	case 1:
		scoreMultiplier = 0.1 // 10%
	default:
		scoreMultiplier = 0.0 // 0%
	}

	score := maxPoints * scoreMultiplier
	isCorrect := correctCount == 4 // Only consider fully correct as "correct"

	return score, isCorrect, nil
}

// CalculateSAScore calculates score for Short Answer questions
// Returns 1.0 if exact match, 0.0 if no match
func (s *ScoringService) CalculateSAScore(userAnswer, correctAnswer []byte, maxPoints float64) (float64, bool, error) {
	var userSA SAAnswerData
	var correctSA SACorrectData

	// Parse user answer
	var userAnswerData AnswerData
	if err := json.Unmarshal(userAnswer, &userAnswerData); err != nil {
		return 0, false, fmt.Errorf("failed to parse user answer: %w", err)
	}

	userSABytes, err := json.Marshal(userAnswerData.AnswerData)
	if err != nil {
		return 0, false, fmt.Errorf("failed to marshal user SA data: %w", err)
	}

	if err := json.Unmarshal(userSABytes, &userSA); err != nil {
		return 0, false, fmt.Errorf("failed to parse user SA answer: %w", err)
	}

	// Parse correct answer
	var correctAnswerData QuestionCorrectAnswer
	if err := json.Unmarshal(correctAnswer, &correctAnswerData); err != nil {
		return 0, false, fmt.Errorf("failed to parse correct answer: %w", err)
	}

	correctSABytes, err := json.Marshal(correctAnswerData.CorrectData)
	if err != nil {
		return 0, false, fmt.Errorf("failed to marshal correct SA data: %w", err)
	}

	if err := json.Unmarshal(correctSABytes, &correctSA); err != nil {
		return 0, false, fmt.Errorf("failed to parse correct SA answer: %w", err)
	}

	// Normalize user answer
	userText := userSA.AnswerText
	if !correctSA.CaseSensitive {
		userText = strings.ToLower(strings.TrimSpace(userText))
	} else {
		userText = strings.TrimSpace(userText)
	}

	// Check against all possible correct answers
	for _, correctText := range correctSA.CorrectAnswers {
		compareText := correctText
		if !correctSA.CaseSensitive {
			compareText = strings.ToLower(strings.TrimSpace(compareText))
		} else {
			compareText = strings.TrimSpace(compareText)
		}

		if userText == compareText {
			return maxPoints, true, nil
		}
	}

	return 0, false, nil
}

// CalculateESScore calculates score for Essay questions
// Returns 0.0 (manual scoring required)
func (s *ScoringService) CalculateESScore(userAnswer, correctAnswer []byte, maxPoints float64) (float64, bool, error) {
	var userES ESAnswerData

	// Parse user answer to validate format
	var userAnswerData AnswerData
	if err := json.Unmarshal(userAnswer, &userAnswerData); err != nil {
		return 0, false, fmt.Errorf("failed to parse user answer: %w", err)
	}

	userESBytes, err := json.Marshal(userAnswerData.AnswerData)
	if err != nil {
		return 0, false, fmt.Errorf("failed to marshal user ES data: %w", err)
	}

	if err := json.Unmarshal(userESBytes, &userES); err != nil {
		return 0, false, fmt.Errorf("failed to parse user ES answer: %w", err)
	}

	// Check if manual score is already provided
	if userES.ManualScore != nil {
		return *userES.ManualScore, *userES.ManualScore > 0, nil
	}

	// Essay questions require manual scoring
	return 0, false, nil
}

// ScoreAnswer scores a single answer based on question type
func (s *ScoringService) ScoreAnswer(ctx context.Context, questionType string, userAnswer, correctAnswer []byte, maxPoints float64) (float64, bool, error) {
	switch questionType {
	case "MC":
		return s.CalculateMCScore(userAnswer, correctAnswer, maxPoints)
	case "TF":
		return s.CalculateTFScore(userAnswer, correctAnswer, maxPoints)
	case "SA":
		return s.CalculateSAScore(userAnswer, correctAnswer, maxPoints)
	case "ES":
		return s.CalculateESScore(userAnswer, correctAnswer, maxPoints)
	default:
		return 0, false, fmt.Errorf("unsupported question type: %s", questionType)
	}
}
