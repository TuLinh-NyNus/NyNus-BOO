package grpc

import (
	"context"
	"fmt"

	mapcode "exam-bank-system/apps/backend/internal/service/content/mapcode"
	"exam-bank-system/apps/backend/pkg/proto/common"
	pb "exam-bank-system/apps/backend/pkg/proto/v1"
	"google.golang.org/protobuf/types/known/timestamppb"
)

// MapCodeServiceServer implements the MapCode gRPC service
type MapCodeServiceServer struct {
	pb.UnimplementedMapCodeServiceServer
	mapCodeMgmt *mapcode.MapCodeMgmt
}

// NewMapCodeServiceServer creates a new MapCode service server
func NewMapCodeServiceServer(mapCodeMgmt *mapcode.MapCodeMgmt) *MapCodeServiceServer {
	return &MapCodeServiceServer{
		mapCodeMgmt: mapCodeMgmt,
	}
}

// CreateVersion creates a new MapCode version
func (s *MapCodeServiceServer) CreateVersion(ctx context.Context, req *pb.CreateVersionRequest) (*pb.CreateVersionResponse, error) {
	// Validate request
	if req.Version == "" {
		return &pb.CreateVersionResponse{
			Status: &common.Response{
				Success: false,
				Message: "Version identifier is required",
			},
		}, nil
	}

	if req.Name == "" {
		return &pb.CreateVersionResponse{
			Status: &common.Response{
				Success: false,
				Message: "Version name is required",
			},
		}, nil
	}

	// Create version
	version, err := s.mapCodeMgmt.CreateVersion(ctx, req.Version, req.Name, req.Description, req.CreatedBy)
	if err != nil {
		return &pb.CreateVersionResponse{
			Status: &common.Response{
				Success: false,
				Message: fmt.Sprintf("Failed to create version: %v", err),
			},
		}, nil
	}

	// Convert to proto
	protoVersion := &pb.MapCodeVersion{
		Id:          version.ID.String,
		Version:     version.Version.String,
		Name:        version.Name.String,
		Description: version.Description.String,
		FilePath:    version.FilePath.String,
		IsActive:    version.IsActive.Bool,
		CreatedBy:   version.CreatedBy.String,
		CreatedAt:   timestamppb.New(version.CreatedAt.Time),
		UpdatedAt:   timestamppb.New(version.UpdatedAt.Time),
	}

	return &pb.CreateVersionResponse{
		Status: &common.Response{
			Success: true,
			Message: "Version created successfully",
		},
		Version: protoVersion,
	}, nil
}

// GetVersions retrieves all versions with pagination
func (s *MapCodeServiceServer) GetVersions(ctx context.Context, req *pb.GetVersionsRequest) (*pb.GetVersionsResponse, error) {
	// Set default pagination
	page := req.Page
	if page <= 0 {
		page = 1
	}
	pageSize := req.PageSize
	if pageSize <= 0 {
		pageSize = 10
	}

	offset := (page - 1) * pageSize

	// Get versions
	versions, err := s.mapCodeMgmt.GetAllVersions(ctx, int(offset), int(pageSize))
	if err != nil {
		return &pb.GetVersionsResponse{
			Status: &common.Response{
				Success: false,
				Message: fmt.Sprintf("Failed to get versions: %v", err),
			},
		}, nil
	}

	// Convert to proto
	var protoVersions []*pb.MapCodeVersion
	for _, version := range versions {
		protoVersions = append(protoVersions, &pb.MapCodeVersion{
			Id:          version.ID.String,
			Version:     version.Version.String,
			Name:        version.Name.String,
			Description: version.Description.String,
			FilePath:    version.FilePath.String,
			IsActive:    version.IsActive.Bool,
			CreatedBy:   version.CreatedBy.String,
			CreatedAt:   timestamppb.New(version.CreatedAt.Time),
			UpdatedAt:   timestamppb.New(version.UpdatedAt.Time),
		})
	}

	// TODO: Implement proper pagination count
	pagination := &common.PaginationResponse{
		Page:       page,
		Limit:      pageSize,
		TotalPages: 1, // Calculate based on total count
		TotalCount: int32(len(protoVersions)),
	}

	return &pb.GetVersionsResponse{
		Status: &common.Response{
			Success: true,
			Message: "Versions retrieved successfully",
		},
		Versions:   protoVersions,
		Pagination: pagination,
	}, nil
}

// GetActiveVersion retrieves the currently active version
func (s *MapCodeServiceServer) GetActiveVersion(ctx context.Context, req *pb.GetActiveVersionRequest) (*pb.GetActiveVersionResponse, error) {
	version, err := s.mapCodeMgmt.GetActiveVersion(ctx)
	if err != nil {
		return &pb.GetActiveVersionResponse{
			Status: &common.Response{
				Success: false,
				Message: fmt.Sprintf("No active version found: %v", err),
			},
		}, nil
	}

	protoVersion := &pb.MapCodeVersion{
		Id:          version.ID.String,
		Version:     version.Version.String,
		Name:        version.Name.String,
		Description: version.Description.String,
		FilePath:    version.FilePath.String,
		IsActive:    version.IsActive.Bool,
		CreatedBy:   version.CreatedBy.String,
		CreatedAt:   timestamppb.New(version.CreatedAt.Time),
		UpdatedAt:   timestamppb.New(version.UpdatedAt.Time),
	}

	return &pb.GetActiveVersionResponse{
		Status: &common.Response{
			Success: true,
			Message: "Active version retrieved successfully",
		},
		Version: protoVersion,
	}, nil
}

// SetActiveVersion sets a version as active
func (s *MapCodeServiceServer) SetActiveVersion(ctx context.Context, req *pb.SetActiveVersionRequest) (*pb.SetActiveVersionResponse, error) {
	if req.VersionId == "" {
		return &pb.SetActiveVersionResponse{
			Status: &common.Response{
				Success: false,
				Message: "Version ID is required",
			},
		}, nil
	}

	err := s.mapCodeMgmt.SetActiveVersion(ctx, req.VersionId)
	if err != nil {
		return &pb.SetActiveVersionResponse{
			Status: &common.Response{
				Success: false,
				Message: fmt.Sprintf("Failed to set active version: %v", err),
			},
		}, nil
	}

	// Clear cache after version switch
	s.mapCodeMgmt.ClearCache()

	return &pb.SetActiveVersionResponse{
		Status: &common.Response{
			Success: true,
			Message: "Active version updated successfully",
		},
		Message: "Version activated and cache cleared",
	}, nil
}

// DeleteVersion deletes a version (only if not active)
func (s *MapCodeServiceServer) DeleteVersion(ctx context.Context, req *pb.DeleteVersionRequest) (*pb.DeleteVersionResponse, error) {
	if req.VersionId == "" {
		return &pb.DeleteVersionResponse{
			Status: &common.Response{
				Success: false,
				Message: "Version ID is required",
			},
		}, nil
	}

	err := s.mapCodeMgmt.DeleteVersion(ctx, req.VersionId)
	if err != nil {
		return &pb.DeleteVersionResponse{
			Status: &common.Response{
				Success: false,
				Message: fmt.Sprintf("Failed to delete version: %v", err),
			},
		}, nil
	}

	return &pb.DeleteVersionResponse{
		Status: &common.Response{
			Success: true,
			Message: "Version deleted successfully",
		},
		Message: "Version and associated files removed",
	}, nil
}

// TranslateCode translates a single question code
func (s *MapCodeServiceServer) TranslateCode(ctx context.Context, req *pb.TranslateCodeRequest) (*pb.TranslateCodeResponse, error) {
	if req.QuestionCode == "" {
		return &pb.TranslateCodeResponse{
			Status: &common.Response{
				Success: false,
				Message: "Question code is required",
			},
		}, nil
	}

	translation, err := s.mapCodeMgmt.TranslateQuestionCode(ctx, req.QuestionCode)
	if err != nil {
		return &pb.TranslateCodeResponse{
			Status: &common.Response{
				Success: false,
				Message: fmt.Sprintf("Translation failed: %v", err),
			},
		}, nil
	}

	return &pb.TranslateCodeResponse{
		Status: &common.Response{
			Success: true,
			Message: "Translation completed successfully",
		},
		Translation: &pb.MapCodeTranslation{
			QuestionCode: req.QuestionCode,
			Translation:  translation,
			// TODO: Add individual parsed components
		},
	}, nil
}

// TranslateCodes translates multiple question codes
func (s *MapCodeServiceServer) TranslateCodes(ctx context.Context, req *pb.TranslateCodesRequest) (*pb.TranslateCodesResponse, error) {
	if len(req.QuestionCodes) == 0 {
		return &pb.TranslateCodesResponse{
			Status: &common.Response{
				Success: false,
				Message: "At least one question code is required",
			},
		}, nil
	}

	translations, err := s.mapCodeMgmt.TranslateQuestionCodes(ctx, req.QuestionCodes)
	if err != nil {
		return &pb.TranslateCodesResponse{
			Status: &common.Response{
				Success: false,
				Message: fmt.Sprintf("Batch translation failed: %v", err),
			},
		}, nil
	}

	return &pb.TranslateCodesResponse{
		Status: &common.Response{
			Success: true,
			Message: fmt.Sprintf("Translated %d question codes", len(translations)),
		},
		Translations: translations,
	}, nil
}

// GetHierarchyNavigation returns navigation structure for a question code
func (s *MapCodeServiceServer) GetHierarchyNavigation(ctx context.Context, req *pb.GetHierarchyNavigationRequest) (*pb.GetHierarchyNavigationResponse, error) {
	if req.QuestionCode == "" {
		return &pb.GetHierarchyNavigationResponse{
			Status: &common.Response{
				Success: false,
				Message: "Question code is required",
			},
		}, nil
	}

	navigation, err := s.mapCodeMgmt.GetHierarchyNavigation(ctx, req.QuestionCode)
	if err != nil {
		return &pb.GetHierarchyNavigationResponse{
			Status: &common.Response{
				Success: false,
				Message: fmt.Sprintf("Failed to get hierarchy navigation: %v", err),
			},
		}, nil
	}

	// Convert to proto
	protoNavigation := &pb.HierarchyNavigation{
		QuestionCode: navigation.QuestionCode,
		Breadcrumbs:  navigation.Breadcrumbs,
	}

	if navigation.Grade != nil {
		protoNavigation.Grade = &pb.HierarchyLevel{
			Code:        navigation.Grade.Code,
			Name:        navigation.Grade.Name,
			Description: navigation.Grade.Description,
		}
	}

	if navigation.Subject != nil {
		protoNavigation.Subject = &pb.HierarchyLevel{
			Code:        navigation.Subject.Code,
			Name:        navigation.Subject.Name,
			Description: navigation.Subject.Description,
		}
	}

	if navigation.Chapter != nil {
		protoNavigation.Chapter = &pb.HierarchyLevel{
			Code:        navigation.Chapter.Code,
			Name:        navigation.Chapter.Name,
			Description: navigation.Chapter.Description,
		}
	}

	if navigation.Level != nil {
		protoNavigation.Level = &pb.HierarchyLevel{
			Code:        navigation.Level.Code,
			Name:        navigation.Level.Name,
			Description: navigation.Level.Description,
		}
	}

	if navigation.Lesson != nil {
		protoNavigation.Lesson = &pb.HierarchyLevel{
			Code:        navigation.Lesson.Code,
			Name:        navigation.Lesson.Name,
			Description: navigation.Lesson.Description,
		}
	}

	if navigation.Form != nil {
		protoNavigation.Form = &pb.HierarchyLevel{
			Code:        navigation.Form.Code,
			Name:        navigation.Form.Name,
			Description: navigation.Form.Description,
		}
	}

	return &pb.GetHierarchyNavigationResponse{
		Status: &common.Response{
			Success: true,
			Message: "Hierarchy navigation retrieved successfully",
		},
		Navigation: protoNavigation,
	}, nil
}

// GetStorageInfo returns storage information
func (s *MapCodeServiceServer) GetStorageInfo(ctx context.Context, req *pb.GetStorageInfoRequest) (*pb.GetStorageInfoResponse, error) {
	storageInfo, err := s.mapCodeMgmt.GetStorageInfo(ctx)
	if err != nil {
		return &pb.GetStorageInfoResponse{
			Status: &common.Response{
				Success: false,
				Message: fmt.Sprintf("Failed to get storage info: %v", err),
			},
		}, nil
	}

	protoStorage := &pb.StorageInfo{
		TotalVersions:  int32(storageInfo.TotalVersions),
		MaxVersions:    int32(storageInfo.MaxVersions),
		AvailableSlots: int32(storageInfo.AvailableSlots),
		WarningLevel:   int32(storageInfo.WarningLevel),
		IsNearLimit:    storageInfo.IsNearLimit,
		IsAtLimit:      storageInfo.IsAtLimit,
		WarningMessage: storageInfo.GetWarningMessage(),
	}

	return &pb.GetStorageInfoResponse{
		Status: &common.Response{
			Success: true,
			Message: "Storage information retrieved successfully",
		},
		Storage: protoStorage,
	}, nil
}

// GetMapCodeConfig returns the full MapCode configuration
func (s *MapCodeServiceServer) GetMapCodeConfig(ctx context.Context, req *pb.GetMapCodeConfigRequest) (*pb.GetMapCodeConfigResponse, error) {
	config, err := s.mapCodeMgmt.GetMapCodeConfig(ctx, req.VersionId)
	if err != nil {
		return &pb.GetMapCodeConfigResponse{
			Status: &common.Response{
				Success: false,
				Message: fmt.Sprintf("Failed to get MapCode config: %v", err),
			},
		}, nil
	}

	// Convert config maps to proto format
	protoConfig := &pb.MapCodeConfig{
		Version:  config.Version,
		Grades:   config.Grades,
		Subjects: config.Subjects,
		Chapters: config.Chapters,
		Levels:   config.Levels,
		Lessons:  config.Lessons,
		Forms:    config.Forms,
	}

	return &pb.GetMapCodeConfigResponse{
		Status: &common.Response{
			Success: true,
			Message: "MapCode configuration retrieved successfully",
		},
		Config: protoConfig,
	}, nil
}

