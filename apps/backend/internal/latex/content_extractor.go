package latex

import (
	"regexp"
	"strings"
)

// ContentExtractor implements 7-step content cleaning process
type ContentExtractor struct {
	bp *BracketParser
}

// NewContentExtractor creates a new content extractor
func NewContentExtractor() *ContentExtractor {
	return &ContentExtractor{
		bp: NewBracketParser(),
	}
}

// ExtractCleanContent applies all 7 steps to extract clean content
func (ce *ContentExtractor) ExtractCleanContent(latexContent string) (rawContent, cleanContent string) {
	// Step 1: Extract from ex environment
	rawContent = ce.ExtractFromExEnvironment(latexContent)
	if rawContent == "" {
		return "", ""
	}

	// Apply cleaning steps
	content := rawContent

	// Step 2: Remove \begin{ex} and \end{ex} tags from clean content
	content = ce.removeExTags(content)

	// Step 3: Remove metadata patterns
	content = ce.RemoveMetadataPatterns(content)

	// Step 4: Handle layout commands
	content = ce.HandleLayoutCommands(content)

	// Step 5: Remove image commands
	content = ce.RemoveImageCommands(content)

	// Step 6: Remove answer commands and their content completely
	content = ce.RemoveAnswerCommands(content)

	// Step 7: Remove solution section
	content = ce.RemoveSolutionSection(content)

	// Step 8: Normalize whitespace
	content = ce.NormalizeWhitespace(content)

	return rawContent, content
}

// Step 1: Extract content from \begin{ex}...\end{ex} environment
func (ce *ContentExtractor) ExtractFromExEnvironment(latexContent string) string {
	environments := ce.bp.ExtractEnvironmentContent(latexContent, "ex")
	if len(environments) > 0 {
		return environments[0] // Return first ex environment
	}
	return ""
}

// removeExTags removes \begin{ex} and \end{ex} tags
func (ce *ContentExtractor) removeExTags(content string) string {
	content = regexp.MustCompile(`\\begin\{ex\}`).ReplaceAllString(content, "")
	content = regexp.MustCompile(`\\end\{ex\}`).ReplaceAllString(content, "")
	return content
}

// Step 2: Remove metadata patterns (questionCode, source, subcount)
func (ce *ContentExtractor) RemoveMetadataPatterns(content string) string {
	patterns := []string{
		`%\s*\[\s*[0-9A-Z]{5,6}(?:-[0-9A-Z])?\s*\]\s*%?`, // QuestionCode
		`%\s*\[\s*Nguồn:?[^\]]+\s*\]\s*%?`,               // Source
		`\[\s*[A-Z]{2}\.\d+\s*\]`,                        // Subcount
	}

	for _, pattern := range patterns {
		re := regexp.MustCompile(pattern)
		content = re.ReplaceAllString(content, "")
	}

	return content
}

// Step 3: Handle layout commands (immini)
func (ce *ContentExtractor) HandleLayoutCommands(content string) string {
	// Handle \immini[optional]{content1}{content2} commands
	// Extract only the first argument (content1) and discard the second (usually image)

	maxIterations := 10
	iteration := 0

	for strings.Contains(content, "\\immini") && iteration < maxIterations {
		iteration++

		// Use regex first for simple cases
		imminiPattern := `\\immini(?:\[[^\]]*\])?\s*\{([^{}]*)\}\s*\{[^{}]*\}`
		re := regexp.MustCompile(imminiPattern)

		newContent := re.ReplaceAllString(content, "$1")

		// If regex worked, use the result
		if newContent != content {
			content = newContent
			continue
		}

		// Handle nested cases with bracket-aware parsing
		content = ce.handleNestedImmini(content)
		break
	}

	return content
}

// handleNestedImmini handles nested \immini commands with bracket-aware parsing
func (ce *ContentExtractor) handleNestedImmini(content string) string {
	for strings.Contains(content, "\\immini") {
		startPos := strings.Index(content, "\\immini")
		if startPos == -1 {
			break
		}

		// Find the start of the first brace
		firstBrace := strings.Index(content[startPos:], "{")
		if firstBrace == -1 {
			break
		}
		firstBrace += startPos

		// Extract first argument using bracket parser
		firstArg := ce.bp.ExtractContentFromBraces(content, firstBrace)
		if firstArg == "" {
			break
		}

		// Find end of first argument
		firstArgEnd := ce.findClosingBrace(content, firstBrace)
		if firstArgEnd == -1 {
			break
		}

		// Find second argument start
		secondBrace := strings.Index(content[firstArgEnd+1:], "{")
		if secondBrace == -1 {
			// No second argument, just replace with first
			content = content[:startPos] + firstArg + content[firstArgEnd+1:]
			continue
		}
		secondBrace += firstArgEnd + 1

		// Find end of second argument
		secondArgEnd := ce.findClosingBrace(content, secondBrace)
		if secondArgEnd == -1 {
			break
		}

		// Replace entire \immini command with just the first argument
		content = content[:startPos] + firstArg + content[secondArgEnd+1:]
	}

	return content
}

// Step 4: Remove image commands and environments
func (ce *ContentExtractor) RemoveImageCommands(content string) string {
	patterns := []string{
		`\\begin\{center\}[\s\S]*?\\end\{center\}`,
		`\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\}`,
		`\\includegraphics(?:\[[^\]]*\])?\{[^}]*\}`,
		`\\begin\{figure\}[\s\S]*?\\end\{figure\}`,
	}

	for _, pattern := range patterns {
		re := regexp.MustCompile(pattern)
		content = re.ReplaceAllString(content, "")
	}

	return content
}

// Step 5: Remove answer commands and their content completely
func (ce *ContentExtractor) RemoveAnswerCommands(content string) string {
	// Protect LaTeX math expressions before processing
	protectedPatterns := ce.protectMathExpressions(content)

	// Find positions of answer commands and cut content before them
	answerPositions := ce.findAnswerCommandPositions(protectedPatterns.content)

	if len(answerPositions) > 0 {
		// Cut content at the first answer command position
		cutPosition := answerPositions[0]
		protectedPatterns.content = protectedPatterns.content[:cutPosition]
	}

	// Clean up remaining fragments
	protectedPatterns.content = ce.cleanAnswerFragments(protectedPatterns.content)

	// Restore protected LaTeX math patterns
	content = ce.restoreMathExpressions(protectedPatterns)

	return content
}

// protectedContent holds content with protected math expressions
type protectedContent struct {
	content      string
	replacements []struct {
		placeholder string
		original    string
	}
}

// protectMathExpressions protects LaTeX math expressions from being removed
func (ce *ContentExtractor) protectMathExpressions(content string) *protectedContent {
	pc := &protectedContent{content: content}

	// Protect \dfrac{}{} patterns
	dfracRe := regexp.MustCompile(`\\dfrac\{([^}]*)\}\{([^}]*)\}`)
	matches := dfracRe.FindAllStringSubmatch(content, -1)
	for i, match := range matches {
		placeholder := "__DFRAC_" + string(rune('A'+i)) + "__"
		pc.content = strings.Replace(pc.content, match[0], placeholder, 1)
		pc.replacements = append(pc.replacements, struct {
			placeholder string
			original    string
		}{placeholder, match[0]})
	}

	// Protect \frac{}{} patterns
	fracRe := regexp.MustCompile(`\\frac\{([^}]*)\}\{([^}]*)\}`)
	matches = fracRe.FindAllStringSubmatch(pc.content, -1)
	for i, match := range matches {
		placeholder := "__FRAC_" + string(rune('A'+i)) + "__"
		pc.content = strings.Replace(pc.content, match[0], placeholder, 1)
		pc.replacements = append(pc.replacements, struct {
			placeholder string
			original    string
		}{placeholder, match[0]})
	}

	// Protect other math commands
	mathCommands := []string{"sqrt", "sum", "int", "lim", "sin", "cos", "tan", "log", "ln"}
	for _, cmd := range mathCommands {
		pattern := `\\` + cmd + `\{([^}]*)\}`
		re := regexp.MustCompile(pattern)
		matches = re.FindAllStringSubmatch(pc.content, -1)
		for i, match := range matches {
			placeholder := "__" + strings.ToUpper(cmd) + "_" + string(rune('A'+i)) + "__"
			pc.content = strings.Replace(pc.content, match[0], placeholder, 1)
			pc.replacements = append(pc.replacements, struct {
				placeholder string
				original    string
			}{placeholder, match[0]})
		}
	}

	return pc
}

// findAnswerCommandPositions finds positions of answer commands
func (ce *ContentExtractor) findAnswerCommandPositions(content string) []int {
	var positions []int

	// Find \choiceTF
	if pos := strings.Index(content, "\\choiceTF"); pos != -1 {
		positions = append(positions, pos)
	}

	// Find \choice (but not \choiceTF)
	pos := 0
	for {
		choicePos := strings.Index(content[pos:], "\\choice")
		if choicePos == -1 {
			break
		}
		choicePos += pos

		// Check if it's not \choiceTF
		if choicePos+9 >= len(content) || content[choicePos:choicePos+9] != "\\choiceTF" {
			positions = append(positions, choicePos)
			break
		}
		pos = choicePos + 1
	}

	// Find \shortans
	if pos := strings.Index(content, "\\shortans"); pos != -1 {
		positions = append(positions, pos)
	}

	// Find \matching
	if pos := strings.Index(content, "\\matching"); pos != -1 {
		positions = append(positions, pos)
	}

	return positions
}

// cleanAnswerFragments removes remaining answer fragments
func (ce *ContentExtractor) cleanAnswerFragments(content string) string {
	// Remove True/False markers
	content = regexp.MustCompile(`\{\\True\s+[^}]*\}`).ReplaceAllString(content, "")
	content = regexp.MustCompile(`\{\\False\s+[^}]*\}`).ReplaceAllString(content, "")
	content = regexp.MustCompile(`\\True\s*`).ReplaceAllString(content, "")
	content = regexp.MustCompile(`\\False\s*`).ReplaceAllString(content, "")

	return content
}

// restoreMathExpressions restores protected math expressions
func (ce *ContentExtractor) restoreMathExpressions(pc *protectedContent) string {
	content := pc.content
	for _, replacement := range pc.replacements {
		content = strings.Replace(content, replacement.placeholder, replacement.original, 1)
	}
	return content
}

// Step 6: Remove solution section (\loigiai{...})
func (ce *ContentExtractor) RemoveSolutionSection(content string) string {
	for {
		loigiaiStart := strings.Index(content, "\\loigiai")
		if loigiaiStart == -1 {
			break
		}

		// Find the opening brace after \loigiai
		braceStart := strings.Index(content[loigiaiStart:], "{")
		if braceStart == -1 {
			break
		}
		braceStart += loigiaiStart

		// Find the matching closing brace
		solutionEnd := ce.findMatchingSolutionEnd(content, braceStart)
		if solutionEnd == -1 {
			// No matching brace found, remove from loigiai to end
			content = content[:loigiaiStart]
			break
		}

		// Remove the entire solution section
		content = content[:loigiaiStart] + content[solutionEnd+1:]
	}

	return content
}

// findMatchingSolutionEnd finds the matching closing brace for solution
func (ce *ContentExtractor) findMatchingSolutionEnd(content string, braceStart int) int {
	braceCount := 0
	pos := braceStart
	maxSearchLength := len(content) - braceStart
	searchCount := 0

	for pos < len(content) {
		// Safety check to prevent infinite loops
		searchCount++
		if searchCount > maxSearchLength {
			return -1
		}

		char := content[pos]

		// Handle escaped characters
		if char == '\\' && pos+1 < len(content) {
			pos += 2
			continue
		}

		if char == '{' {
			braceCount++
		} else if char == '}' {
			braceCount--
			if braceCount == 0 {
				return pos
			}
		}

		pos++
	}

	return -1 // No matching brace found
}

// Step 7: Normalize whitespace
func (ce *ContentExtractor) NormalizeWhitespace(content string) string {
	// Convert newlines to spaces for better text flow
	content = strings.ReplaceAll(content, "\r\n", " ")
	content = strings.ReplaceAll(content, "\r", " ")
	content = strings.ReplaceAll(content, "\n", " ")

	// Replace multiple spaces with single space
	content = regexp.MustCompile(`[ ]+`).ReplaceAllString(content, " ")

	// Replace multiple tabs with spaces
	content = regexp.MustCompile(`\t+`).ReplaceAllString(content, " ")

	// Trim leading and trailing whitespace
	content = strings.TrimSpace(content)

	return content
}

// findClosingBrace finds the position of closing brace with bracket counting
func (ce *ContentExtractor) findClosingBrace(content string, startPos int) int {
	if startPos >= len(content) || content[startPos] != '{' {
		return -1
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

	if braceLevel == 0 {
		return pos - 1 // Position of closing brace
	}

	return -1
}
