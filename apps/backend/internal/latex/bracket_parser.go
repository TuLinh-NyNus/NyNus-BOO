package latex

import (
	"strings"
)

// BracketParser provides bracket-aware parsing for LaTeX commands
type BracketParser struct{}

// NewBracketParser creates a new bracket parser
func NewBracketParser() *BracketParser {
	return &BracketParser{}
}

// ExtractEnvironmentContent extracts content from LaTeX environments like \begin{ex}...\end{ex}
func (bp *BracketParser) ExtractEnvironmentContent(content, envName string) []string {
	var results []string

	beginTag := "\\begin{" + envName + "}"
	endTag := "\\end{" + envName + "}"

	pos := 0
	for pos < len(content) {
		// Find beginning of environment
		beginPos := strings.Index(content[pos:], beginTag)
		if beginPos == -1 {
			break
		}
		beginPos += pos

		// Start after the \begin{env} tag
		contentStart := beginPos + len(beginTag)

		// Find matching \end{env} tag with nesting support
		endPos := bp.findMatchingEndTag(content, contentStart, beginTag, endTag)
		if endPos == -1 {
			break
		}

		// Extract content between tags
		envContent := content[contentStart:endPos]
		results = append(results, envContent)

		// Continue after this environment
		pos = endPos + len(endTag)
	}

	return results
}

// ExtractContentFromBraces extracts content from braces starting at given position
func (bp *BracketParser) ExtractContentFromBraces(content string, startPos int) string {
	if startPos >= len(content) || content[startPos] != '{' {
		return ""
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

		// Count braces
		if char == '{' {
			braceLevel++
		} else if char == '}' {
			braceLevel--
		}

		pos++
	}

	if braceLevel == 0 {
		return content[startPos+1 : pos-1]
	}

	// Unmatched braces, return what we have
	return content[startPos+1:]
}

// findMatchingEndTag finds the matching end tag considering nesting
func (bp *BracketParser) findMatchingEndTag(content string, startPos int, beginTag, endTag string) int {
	nestLevel := 1
	pos := startPos

	for pos < len(content) && nestLevel > 0 {
		// Check for nested begin tags
		if pos+len(beginTag) <= len(content) && content[pos:pos+len(beginTag)] == beginTag {
			nestLevel++
			pos += len(beginTag)
			continue
		}

		// Check for end tags
		if pos+len(endTag) <= len(content) && content[pos:pos+len(endTag)] == endTag {
			nestLevel--
			if nestLevel == 0 {
				return pos
			}
			pos += len(endTag)
			continue
		}

		pos++
	}

	return -1 // No matching end tag found
}

// ExtractQuestionBlocks extracts individual question blocks from LaTeX content
func (bp *BracketParser) ExtractQuestionBlocks(content string) []string {
	var blocks []string

	// Find all \begin{ex}...\end{ex} environments with preceding metadata
	pos := 0
	for pos < len(content) {
		// Look for comment metadata before \begin{ex}
		metadataStart := pos

		// Find next \begin{ex}
		beginPos := strings.Index(content[pos:], "\\begin{ex}")
		if beginPos == -1 {
			break
		}
		beginPos += pos

		// Look backwards for preceding comment lines that might contain metadata
		lineStart := beginPos
		for lineStart > 0 && content[lineStart-1] != '\n' {
			lineStart--
		}

		// Check a few lines before for metadata comments
		for i := 0; i < 3 && lineStart > 0; i++ {
			// Find start of previous line
			prevLineEnd := lineStart - 1
			if prevLineEnd >= 0 && content[prevLineEnd] == '\n' {
				prevLineStart := prevLineEnd
				for prevLineStart > 0 && content[prevLineStart-1] != '\n' {
					prevLineStart--
				}

				line := strings.TrimSpace(content[prevLineStart:prevLineEnd])
				// If line starts with %, it might be metadata
				if strings.HasPrefix(line, "%") {
					metadataStart = prevLineStart
					lineStart = prevLineStart
				} else {
					break
				}
			} else {
				break
			}
		}

		// Extract the ex environment content
		contentStart := beginPos + len("\\begin{ex}")
		endPos := bp.findMatchingEndTag(content, contentStart, "\\begin{ex}", "\\end{ex}")
		if endPos == -1 {
			break
		}

		// Include metadata and full environment
		blockEnd := endPos + len("\\end{ex}")
		block := content[metadataStart:blockEnd]
		blocks = append(blocks, strings.TrimSpace(block))

		pos = blockEnd
	}

	return blocks
}
