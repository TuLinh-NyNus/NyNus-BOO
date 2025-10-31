package mapcode_mgmt

import (
	"context"
)

// GetMostUsedQuestionCodes returns top N most frequently used codes
func (m *MapCodeMgmt) GetMostUsedQuestionCodes(ctx context.Context, limit int) ([]string, error) {
	// This requires database access through repository
	// For now, we'll use a direct query approach
	// TODO: Move to repository layer if needed
	
	query := `
		SELECT 
			q.question_code_id,
			COUNT(*) as usage_count
		FROM questions q
		WHERE q.question_code_id IS NOT NULL
			AND q.question_code_id != ''
		GROUP BY q.question_code_id
		ORDER BY usage_count DESC
		LIMIT $1
	`
	
	// Get database connection from repository
	// Note: This is a simplified approach
	// In production, consider adding this to repository layer
	
	codes := []string{
		// Fallback: Pre-defined common codes
		"0P1N1", "0P2H2", "0P3V3", "0P4T4", "0P5D5",
		"1P1N1", "1P2H2", "1P3V3", "1P4T4", "1P5D5",
		"2P1N1", "2P2H2", "2P3V3", "2P4T4", "2P5D5",
	}
	
	// TODO: Implement actual database query when repository supports it
	// For now, return pre-defined common codes
	_ = query
	
	if limit < len(codes) {
		return codes[:limit], nil
	}
	
	return codes, nil
}

// PreCacheCommonCodes pre-populates cache for common codes
func (m *MapCodeMgmt) PreCacheCommonCodes(ctx context.Context) error {
	// Get top 1000 most used codes
	codes, err := m.GetMostUsedQuestionCodes(ctx, 1000)
	if err != nil {
		return err
	}
	
	// Batch translate and cache
	_, err = m.TranslateQuestionCodes(ctx, codes)
	return err
}

