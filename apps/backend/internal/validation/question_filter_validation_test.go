package validation

import (
	"testing"
	"time"

	v1 "github.com/AnhPhan49/exam-bank-system/apps/backend/pkg/proto/v1"
	"google.golang.org/protobuf/types/known/timestamppb"
)

func TestQuestionFilterValidator_ValidateListQuestionsByFilterRequest(t *testing.T) {
	validator := NewQuestionFilterValidator()

	tests := []struct {
		name    string
		req     *v1.ListQuestionsByFilterRequest
		wantErr bool
	}{
		{
			name:    "nil request",
			req:     nil,
			wantErr: true,
		},
		{
			name:    "empty request",
			req:     &v1.ListQuestionsByFilterRequest{},
			wantErr: false,
		},
		{
			name: "valid question code filter",
			req: &v1.ListQuestionsByFilterRequest{
				QuestionCodeFilter: &v1.QuestionCodeFilter{
					Grades:   []string{"0", "1"},
					Subjects: []string{"P", "L"},
					Chapters: []string{"1", "2"},
					Levels:   []string{"N", "H"},
					Lessons:  []string{"1", "A"},
					Forms:    []string{"1", "2"},
				},
			},
			wantErr: false,
		},
		{
			name: "invalid grade",
			req: &v1.ListQuestionsByFilterRequest{
				QuestionCodeFilter: &v1.QuestionCodeFilter{
					Grades: []string{"3"}, // Invalid grade
				},
			},
			wantErr: true,
		},
		{
			name: "invalid subject",
			req: &v1.ListQuestionsByFilterRequest{
				QuestionCodeFilter: &v1.QuestionCodeFilter{
					Subjects: []string{"X"}, // Invalid subject
				},
			},
			wantErr: true,
		},
		{
			name: "valid metadata filter",
			req: &v1.ListQuestionsByFilterRequest{
				MetadataFilter: &v1.MetadataFilter{
					Types:         []string{"MC", "TF"},
					Statuses:      []string{"ACTIVE", "PENDING"},
					Difficulties:  []string{"EASY", "MEDIUM"},
					MinUsageCount: 1,
					MaxUsageCount: 10,
				},
			},
			wantErr: false,
		},
		{
			name: "invalid usage count range",
			req: &v1.ListQuestionsByFilterRequest{
				MetadataFilter: &v1.MetadataFilter{
					MinUsageCount: 10,
					MaxUsageCount: 5, // Min > Max
				},
			},
			wantErr: true,
		},
		{
			name: "valid pagination",
			req: &v1.ListQuestionsByFilterRequest{
				Pagination: &v1.FilterPagination{
					Page:  1,
					Limit: 20,
					Sort: []*v1.SortOptions{
						{
							Field: v1.SortField_SORT_FIELD_CREATED_AT,
							Order: v1.SortOrder_SORT_ORDER_DESC,
						},
					},
				},
			},
			wantErr: false,
		},
		{
			name: "invalid pagination - page 0",
			req: &v1.ListQuestionsByFilterRequest{
				Pagination: &v1.FilterPagination{
					Page:  0, // Invalid page
					Limit: 20,
				},
			},
			wantErr: true,
		},
		{
			name: "invalid pagination - limit too high",
			req: &v1.ListQuestionsByFilterRequest{
				Pagination: &v1.FilterPagination{
					Page:  1,
					Limit: 101, // Exceeds max limit
				},
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validator.ValidateListQuestionsByFilterRequest(tt.req)
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateListQuestionsByFilterRequest() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestQuestionFilterValidator_ValidateSearchQuestionsRequest(t *testing.T) {
	validator := NewQuestionFilterValidator()

	tests := []struct {
		name    string
		req     *v1.SearchQuestionsRequest
		wantErr bool
	}{
		{
			name:    "nil request",
			req:     nil,
			wantErr: true,
		},
		{
			name: "empty query",
			req: &v1.SearchQuestionsRequest{
				Query: "",
			},
			wantErr: true,
		},
		{
			name: "valid search request",
			req: &v1.SearchQuestionsRequest{
				Query:        "mathematics",
				SearchFields: []string{"content", "solution"},
			},
			wantErr: false,
		},
		{
			name: "invalid search field",
			req: &v1.SearchQuestionsRequest{
				Query:        "mathematics",
				SearchFields: []string{"invalid_field"},
			},
			wantErr: true,
		},
		{
			name: "query too long",
			req: &v1.SearchQuestionsRequest{
				Query: string(make([]byte, 1001)), // Exceeds max length
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validator.ValidateSearchQuestionsRequest(tt.req)
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateSearchQuestionsRequest() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestQuestionFilterValidator_ValidateGetQuestionsByQuestionCodeRequest(t *testing.T) {
	validator := NewQuestionFilterValidator()

	tests := []struct {
		name    string
		req     *v1.GetQuestionsByQuestionCodeRequest
		wantErr bool
	}{
		{
			name:    "nil request",
			req:     nil,
			wantErr: true,
		},
		{
			name: "missing question code filter",
			req: &v1.GetQuestionsByQuestionCodeRequest{
				QuestionCodeFilter: nil,
			},
			wantErr: true,
		},
		{
			name: "valid request",
			req: &v1.GetQuestionsByQuestionCodeRequest{
				QuestionCodeFilter: &v1.QuestionCodeFilter{
					Grades:   []string{"0"},
					Subjects: []string{"P"},
				},
			},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validator.ValidateGetQuestionsByQuestionCodeRequest(tt.req)
			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateGetQuestionsByQuestionCodeRequest() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestQuestionFilterValidator_validateQuestionCodeFilter(t *testing.T) {
	validator := NewQuestionFilterValidator()

	tests := []struct {
		name    string
		filter  *v1.QuestionCodeFilter
		wantErr bool
	}{
		{
			name: "valid filter",
			filter: &v1.QuestionCodeFilter{
				Grades:   []string{"0", "1", "2"},
				Subjects: []string{"P", "L", "H", "T", "S"},
				Chapters: []string{"1", "10", "20"},
				Levels:   []string{"N", "H", "V", "C", "T", "M"},
				Lessons:  []string{"1", "99", "A", "Z"},
				Forms:    []string{"1", "9"},
			},
			wantErr: false,
		},
		{
			name: "invalid chapter - too high",
			filter: &v1.QuestionCodeFilter{
				Chapters: []string{"21"},
			},
			wantErr: true,
		},
		{
			name: "invalid lesson format",
			filter: &v1.QuestionCodeFilter{
				Lessons: []string{"100"}, // Too high
			},
			wantErr: true,
		},
		{
			name: "invalid form",
			filter: &v1.QuestionCodeFilter{
				Forms: []string{"0"}, // Must be 1-9
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validator.validateQuestionCodeFilter(tt.filter)
			if (err != nil) != tt.wantErr {
				t.Errorf("validateQuestionCodeFilter() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestQuestionFilterValidator_validateDateFilter(t *testing.T) {
	validator := NewQuestionFilterValidator()

	now := time.Now()
	past := now.Add(-24 * time.Hour)
	future := now.Add(24 * time.Hour)

	tests := []struct {
		name    string
		filter  *v1.DateRangeFilter
		wantErr bool
	}{
		{
			name: "valid date range",
			filter: &v1.DateRangeFilter{
				CreatedAfter:  timestamppb.New(past),
				CreatedBefore: timestamppb.New(future),
			},
			wantErr: false,
		},
		{
			name: "invalid date range - after > before",
			filter: &v1.DateRangeFilter{
				CreatedAfter:  timestamppb.New(future),
				CreatedBefore: timestamppb.New(past),
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validator.validateDateFilter(tt.filter)
			if (err != nil) != tt.wantErr {
				t.Errorf("validateDateFilter() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}
