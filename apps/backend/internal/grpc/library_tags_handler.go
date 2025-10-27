package grpc

import (
	"context"

	"github.com/sirupsen/logrus"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/repository"
)

// LibraryTagsHandler handles tag-related operations
type LibraryTagsHandler struct {
	tagRepo repository.TagRepository
	logger  *logrus.Logger
}

// NewLibraryTagsHandler creates a new tags handler
func NewLibraryTagsHandler(tagRepo repository.TagRepository, logger *logrus.Logger) *LibraryTagsHandler {
	return &LibraryTagsHandler{
		tagRepo: tagRepo,
		logger:  logger,
	}
}

// CreateTagRequest represents a tag creation request
type CreateTagRequest struct {
	Name        string
	Description string
	Color       string
	IsTrending  bool
}

// UpdateTagRequest represents a tag update request
type UpdateTagRequest struct {
	TagID       string
	Name        string
	Description string
	Color       string
	IsTrending  bool
}

// TagResponse represents a tag response
type TagResponse struct {
	ID          string
	Name        string
	Description string
	Color       string
	IsTrending  bool
	UsageCount  int
	CreatedAt   string
	UpdatedAt   string
}

// ListTagsRequest represents a list tags request
type ListTagsRequest struct {
	Search     string
	IsTrending *bool
	Limit      int
	Offset     int
}

// ListTagsResponse represents a list tags response
type ListTagsResponse struct {
	Tags  []*TagResponse
	Total int
}

// CreateTag creates a new tag
func (h *LibraryTagsHandler) CreateTag(ctx context.Context, req *CreateTagRequest) (*TagResponse, error) {
	h.logger.WithFields(logrus.Fields{
		"name":  req.Name,
		"color": req.Color,
	}).Info("Creating new tag")

	// Validate input
	if req.Name == "" {
		return nil, status.Error(codes.InvalidArgument, "Tag name is required")
	}

	// Create tag entity
	tag := &entity.Tag{
		Name:        req.Name,
		Description: req.Description,
		Color:       req.Color,
		IsTrending:  req.IsTrending,
		UsageCount:  0,
	}

	// Save to database
	createdTag, err := h.tagRepo.CreateTag(ctx, tag)
	if err != nil {
		h.logger.WithError(err).Error("Failed to create tag")
		return nil, status.Error(codes.Internal, "Failed to create tag")
	}

	h.logger.WithField("tag_id", createdTag.ID).Info("Tag created successfully")

	return h.tagToResponse(createdTag), nil
}

// GetTag retrieves a tag by ID
func (h *LibraryTagsHandler) GetTag(ctx context.Context, tagID string) (*TagResponse, error) {
	if tagID == "" {
		return nil, status.Error(codes.InvalidArgument, "Tag ID is required")
	}

	tag, err := h.tagRepo.GetTag(ctx, tagID)
	if err != nil {
		h.logger.WithError(err).WithField("tag_id", tagID).Error("Failed to get tag")
		return nil, status.Error(codes.NotFound, "Tag not found")
	}

	return h.tagToResponse(tag), nil
}

// ListTags retrieves tags with filters
func (h *LibraryTagsHandler) ListTags(ctx context.Context, req *ListTagsRequest) (*ListTagsResponse, error) {
	h.logger.WithFields(logrus.Fields{
		"search": req.Search,
		"limit":  req.Limit,
		"offset": req.Offset,
	}).Debug("Listing tags")

	// Set default limit
	if req.Limit <= 0 {
		req.Limit = 50
	}

	// Build filters
	filters := repository.TagListFilters{
		Search:     req.Search,
		IsTrending: req.IsTrending,
		Limit:      req.Limit,
		Offset:     req.Offset,
	}

	// Get tags from repository
	tags, err := h.tagRepo.ListTags(ctx, filters)
	if err != nil {
		h.logger.WithError(err).Error("Failed to list tags")
		return nil, status.Error(codes.Internal, "Failed to list tags")
	}

	// Convert to response
	responses := make([]*TagResponse, len(tags))
	for i, tag := range tags {
		responses[i] = h.tagToResponse(tag)
	}

	return &ListTagsResponse{
		Tags:  responses,
		Total: len(responses),
	}, nil
}

// UpdateTag updates an existing tag
func (h *LibraryTagsHandler) UpdateTag(ctx context.Context, req *UpdateTagRequest) (*TagResponse, error) {
	h.logger.WithField("tag_id", req.TagID).Info("Updating tag")

	// Validate input
	if req.TagID == "" {
		return nil, status.Error(codes.InvalidArgument, "Tag ID is required")
	}

	// Get existing tag
	existingTag, err := h.tagRepo.GetTag(ctx, req.TagID)
	if err != nil {
		h.logger.WithError(err).WithField("tag_id", req.TagID).Error("Tag not found")
		return nil, status.Error(codes.NotFound, "Tag not found")
	}

	// Update fields
	if req.Name != "" {
		existingTag.Name = req.Name
	}
	if req.Description != "" {
		existingTag.Description = req.Description
	}
	if req.Color != "" {
		existingTag.Color = req.Color
	}
	existingTag.IsTrending = req.IsTrending

	// Save to database
	err = h.tagRepo.UpdateTag(ctx, existingTag)
	if err != nil {
		h.logger.WithError(err).Error("Failed to update tag")
		return nil, status.Error(codes.Internal, "Failed to update tag")
	}

	h.logger.WithField("tag_id", req.TagID).Info("Tag updated successfully")

	return h.tagToResponse(existingTag), nil
}

// DeleteTag deletes a tag
func (h *LibraryTagsHandler) DeleteTag(ctx context.Context, tagID string) error {
	h.logger.WithField("tag_id", tagID).Info("Deleting tag")

	if tagID == "" {
		return status.Error(codes.InvalidArgument, "Tag ID is required")
	}

	err := h.tagRepo.DeleteTag(ctx, tagID)
	if err != nil {
		h.logger.WithError(err).WithField("tag_id", tagID).Error("Failed to delete tag")
		return status.Error(codes.Internal, "Failed to delete tag")
	}

	h.logger.WithField("tag_id", tagID).Info("Tag deleted successfully")
	return nil
}

// GetPopularTags retrieves popular tags
func (h *LibraryTagsHandler) GetPopularTags(ctx context.Context, limit int) (*ListTagsResponse, error) {
	h.logger.WithField("limit", limit).Debug("Getting popular tags")

	if limit <= 0 {
		limit = 20
	}

	tags, err := h.tagRepo.GetPopularTags(ctx, limit)
	if err != nil {
		h.logger.WithError(err).Error("Failed to get popular tags")
		return nil, status.Error(codes.Internal, "Failed to get popular tags")
	}

	// Convert to response
	responses := make([]*TagResponse, len(tags))
	for i, tag := range tags {
		responses[i] = h.tagToResponse(tag)
	}

	return &ListTagsResponse{
		Tags:  responses,
		Total: len(responses),
	}, nil
}

// ToggleTrending toggles the trending status of a tag
func (h *LibraryTagsHandler) ToggleTrending(ctx context.Context, tagID string, isTrending bool) error {
	h.logger.WithFields(logrus.Fields{
		"tag_id":      tagID,
		"is_trending": isTrending,
	}).Info("Toggling tag trending status")

	if tagID == "" {
		return status.Error(codes.InvalidArgument, "Tag ID is required")
	}

	// Get existing tag
	tag, err := h.tagRepo.GetTag(ctx, tagID)
	if err != nil {
		h.logger.WithError(err).WithField("tag_id", tagID).Error("Tag not found")
		return status.Error(codes.NotFound, "Tag not found")
	}

	// Update trending status
	tag.IsTrending = isTrending

	// Save to database
	err = h.tagRepo.UpdateTag(ctx, tag)
	if err != nil {
		h.logger.WithError(err).Error("Failed to toggle trending status")
		return status.Error(codes.Internal, "Failed to update tag")
	}

	h.logger.WithField("tag_id", tagID).Info("Tag trending status updated")
	return nil
}

// Helper function to convert entity to response
func (h *LibraryTagsHandler) tagToResponse(tag *entity.Tag) *TagResponse {
	return &TagResponse{
		ID:          tag.ID,
		Name:        tag.Name,
		Description: tag.Description,
		Color:       tag.Color,
		IsTrending:  tag.IsTrending,
		UsageCount:  tag.UsageCount,
		CreatedAt:   tag.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   tag.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

// NOTE: gRPC endpoint integration example:
// func (s *LibraryService) CreateTag(ctx context.Context, req *pb.CreateTagRequest) (*pb.TagResponse, error) {
//     createReq := &grpc.CreateTagRequest{
//         Name:        req.Name,
//         Description: req.Description,
//         Color:       req.Color,
//         IsTrending:  req.IsTrending,
//     }
//     return s.tagsHandler.CreateTag(ctx, createReq)
// }

