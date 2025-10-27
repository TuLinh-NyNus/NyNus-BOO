package grpc

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"path"
	"sort"
	"strings"
	"time"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/middleware"
	"exam-bank-system/apps/backend/internal/repository"
	booksvc "exam-bank-system/apps/backend/internal/service/content/book"
	bookmarksvc "exam-bank-system/apps/backend/internal/service/library/bookmark"
	ratingsvc "exam-bank-system/apps/backend/internal/service/library/rating"
	videosvc "exam-bank-system/apps/backend/internal/service/library/video"
	"exam-bank-system/apps/backend/pkg/proto/common"
	v1 "exam-bank-system/apps/backend/pkg/proto/v1"

	"github.com/sirupsen/logrus"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
	"google.golang.org/protobuf/types/known/wrapperspb"
)

const defaultPageLimit = 20

var roleHierarchy = map[string]int{
	"GUEST":   0,
	"STUDENT": 1,
	"TUTOR":   2,
	"TEACHER": 3,
	"ADMIN":   4,
}

type aggregatedItem struct {
	proto     *v1.LibraryItem
	createdAt time.Time
	download  int64
	rating    float64
	title     string
	required  accessRequirement
	itemID    string
}

type accessRequirement struct {
	requiredRole  string
	requiredLevel sql.NullInt32
	targetRoles   []string
}

// LibraryServiceServer exposes library operations via gRPC.
type LibraryServiceServer struct {
	v1.UnimplementedLibraryServiceServer
	bookService     *booksvc.BookService
	examRepo        repository.LibraryExamRepository
	videoService    *videosvc.Service
	ratingService   *ratingsvc.Service
	bookmarkService *bookmarksvc.Service
	itemRepo        repository.LibraryItemRepository
	logger          *logrus.Entry
}

// NewLibraryServiceServer creates a new library service handler.
func NewLibraryServiceServer(
	bookSvc *booksvc.BookService,
	examRepo repository.LibraryExamRepository,
	videoService *videosvc.Service,
	ratingService *ratingsvc.Service,
	bookmarkService *bookmarksvc.Service,
	itemRepo repository.LibraryItemRepository,
) *LibraryServiceServer {
	return &LibraryServiceServer{
		bookService:     bookSvc,
		examRepo:        examRepo,
		videoService:    videoService,
		ratingService:   ratingService,
		bookmarkService: bookmarkService,
		itemRepo:        itemRepo,
		logger:          logrus.WithField("component", "LibraryServiceServer"),
	}
}

// ListItems returns library items (books/exams/videos) with RBAC filtering.
func (s *LibraryServiceServer) ListItems(ctx context.Context, req *v1.ListLibraryItemsRequest) (*v1.ListLibraryItemsResponse, error) {
	types, err := resolveLibraryItemTypes(req.GetFilter())
	if err != nil {
		return nil, err
	}

	limit := int(req.GetPagination().GetLimit())
	if limit <= 0 || limit > 100 {
		limit = defaultPageLimit
	}
	page := int(req.GetPagination().GetPage())
	if page <= 0 {
		page = 1
	}

	userRole, userLevel := userRoleLevelFromContext(ctx)

	items, err := s.fetchAndFilterItems(ctx, req, types, userRole, userLevel, page, limit)
	if err != nil {
		return nil, err
	}

	totalCount := len(items)
	start := (page - 1) * limit
	if start >= totalCount {
		return &v1.ListLibraryItemsResponse{
			Response: &common.Response{Success: true, Message: "Items loaded successfully"},
			Items:    []*v1.LibraryItem{},
			Pagination: &common.PaginationResponse{
				Page:       int32(page),
				Limit:      int32(limit),
				TotalPages: int32((totalCount + limit - 1) / limit),
				TotalCount: int32(totalCount),
			},
		}, nil
	}

	end := start + limit
	if end > totalCount {
		end = totalCount
	}

	pageItems := make([]*v1.LibraryItem, 0, end-start)
	for _, item := range items[start:end] {
		pageItems = append(pageItems, item.proto)
	}

	return &v1.ListLibraryItemsResponse{
		Response: &common.Response{
			Success: true,
			Message: "Items loaded successfully",
		},
		Items: pageItems,
		Pagination: &common.PaginationResponse{
			Page:       int32(page),
			Limit:      int32(limit),
			TotalPages: int32((totalCount + limit - 1) / limit),
			TotalCount: int32(totalCount),
		},
	}, nil
}

// GetItem returns a single library item by ID.
func (s *LibraryServiceServer) GetItem(ctx context.Context, req *v1.GetLibraryItemRequest) (*v1.GetLibraryItemResponse, error) {
	id := strings.TrimSpace(req.GetId())
	if id == "" {
		return nil, status.Error(codes.InvalidArgument, "item id is required")
	}

	userRole, userLevel := userRoleLevelFromContext(ctx)

	// Try book domain first.
	if book, err := s.bookService.GetBook(ctx, id); err == nil {
		item := toProtoLibraryItemFromBook(book)
		if !hasAccess(userRole, userLevel, accessRequirement{
			requiredRole:  defaultRole(item.GetRequiredRole()),
			requiredLevel: nullInt32ToSQL(item.GetRequiredLevel()),
			targetRoles:   item.GetTargetRoles(),
		}) {
			return nil, status.Error(codes.PermissionDenied, "access denied")
		}
		return &v1.GetLibraryItemResponse{
			Response: &common.Response{Success: true, Message: "Item fetched successfully"},
			Item:     item,
		}, nil
	} else if !errors.Is(err, repository.ErrNotFound) {
		s.logger.WithError(err).Error("get library item (book)")
		return nil, status.Errorf(codes.Internal, "failed to get item: %v", err)
	}

	// Try exam repository.
	if exam, err := s.examRepo.GetByID(ctx, id); err == nil {
		item := toProtoLibraryItemFromExam(exam)
		if !hasAccess(userRole, userLevel, accessRequirement{
			requiredRole:  defaultRole(item.GetRequiredRole()),
			requiredLevel: nullInt32ToSQL(item.GetRequiredLevel()),
			targetRoles:   item.GetTargetRoles(),
		}) {
			return nil, status.Error(codes.PermissionDenied, "access denied")
		}
		return &v1.GetLibraryItemResponse{
			Response: &common.Response{Success: true, Message: "Item fetched successfully"},
			Item:     item,
		}, nil
	} else if !errors.Is(err, repository.ErrNotFound) {
		s.logger.WithError(err).Error("get library item (exam)")
		return nil, status.Errorf(codes.Internal, "failed to get item: %v", err)
	}

	// Try video repository.
	if video, err := s.videoService.Get(ctx, id); err == nil {
		item := toProtoLibraryItemFromVideo(video)
		if !hasAccess(userRole, userLevel, accessRequirement{
			requiredRole:  defaultRole(item.GetRequiredRole()),
			requiredLevel: nullInt32ToSQL(item.GetRequiredLevel()),
			targetRoles:   item.GetTargetRoles(),
		}) {
			return nil, status.Error(codes.PermissionDenied, "access denied")
		}
		return &v1.GetLibraryItemResponse{
			Response: &common.Response{Success: true, Message: "Item fetched successfully"},
			Item:     item,
		}, nil
	} else if !errors.Is(err, repository.ErrNotFound) {
		s.logger.WithError(err).Error("get library item (video)")
		return nil, status.Errorf(codes.Internal, "failed to get item: %v", err)
	}

	return nil, status.Error(codes.NotFound, "item not found")
}

// CreateItem creates a new library item (books only for now).
func (s *LibraryServiceServer) CreateItem(ctx context.Context, req *v1.CreateLibraryItemRequest) (*v1.CreateLibraryItemResponse, error) {
	userRole, _ := userRoleLevelFromContext(ctx)
	if roleHierarchy[userRole] < roleHierarchy["TEACHER"] {
		return nil, status.Error(codes.PermissionDenied, "teacher role required to create items")
	}

	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil || strings.TrimSpace(userID) == "" {
		return nil, status.Error(codes.Unauthenticated, "user authentication required")
	}

	if req.GetItem().GetType() != v1.LibraryItemType_LIBRARY_ITEM_TYPE_BOOK {
		return nil, status.Error(codes.InvalidArgument, "only book items are currently supported")
	}

	input, err := toCreateBookInput(req.GetItem(), userID)
	if err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "invalid payload: %v", err)
	}

	book, err := s.bookService.CreateBook(ctx, input)
	if err != nil {
		s.logger.WithError(err).Error("create library book item")
		return nil, status.Errorf(codes.Internal, "failed to create item: %v", err)
	}

	return &v1.CreateLibraryItemResponse{
		Response: &common.Response{
			Success: true,
			Message: "Item created successfully",
		},
		Item: toProtoLibraryItemFromBook(book),
	}, nil
}

// UpdateItem updates a library item (books only for now).
func (s *LibraryServiceServer) UpdateItem(ctx context.Context, req *v1.UpdateLibraryItemRequest) (*v1.UpdateLibraryItemResponse, error) {
	userRole, _ := userRoleLevelFromContext(ctx)
	if roleHierarchy[userRole] < roleHierarchy["TEACHER"] {
		return nil, status.Error(codes.PermissionDenied, "teacher role required to update items")
	}

	bookID := strings.TrimSpace(req.GetId())
	if bookID == "" {
		return nil, status.Error(codes.InvalidArgument, "item id is required")
	}

	item := req.GetItem()
	if item.GetType() != v1.LibraryItemType_LIBRARY_ITEM_TYPE_BOOK && item.GetType() != v1.LibraryItemType_LIBRARY_ITEM_TYPE_UNSPECIFIED {
		return nil, status.Error(codes.InvalidArgument, "only book items are currently supported")
	}

	existing, err := s.bookService.GetBook(ctx, bookID)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return nil, status.Error(codes.NotFound, "item not found")
		}
		return nil, status.Errorf(codes.Internal, "failed to load existing item: %v", err)
	}

	input, err := toUpdateBookInput(req.GetItem(), existing)
	if err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "invalid payload: %v", err)
	}

	book, err := s.bookService.UpdateBook(ctx, bookID, input)
	if err != nil {
		s.logger.WithError(err).Error("update library book item")
		return nil, status.Errorf(codes.Internal, "failed to update item: %v", err)
	}

	return &v1.UpdateLibraryItemResponse{
		Response: &common.Response{
			Success: true,
			Message: "Item updated successfully",
		},
		Item: toProtoLibraryItemFromBook(book),
	}, nil
}

// ApproveItem updates approval status.
func (s *LibraryServiceServer) ApproveItem(ctx context.Context, req *v1.ApproveLibraryItemRequest) (*v1.ApproveLibraryItemResponse, error) {
	userRole, _ := userRoleLevelFromContext(ctx)
	if roleHierarchy[userRole] < roleHierarchy["ADMIN"] {
		return nil, status.Error(codes.PermissionDenied, "admin role required to approve items")
	}

	var newStatus string
	switch req.GetStatus() {
	case v1.LibraryUploadStatus_LIBRARY_UPLOAD_STATUS_APPROVED:
		newStatus = "approved"
	case v1.LibraryUploadStatus_LIBRARY_UPLOAD_STATUS_REJECTED:
		newStatus = "rejected"
	case v1.LibraryUploadStatus_LIBRARY_UPLOAD_STATUS_ARCHIVED:
		newStatus = "archived"
	case v1.LibraryUploadStatus_LIBRARY_UPLOAD_STATUS_PENDING:
		newStatus = "pending"
	default:
		newStatus = "approved"
	}

	var reviewer *string
	if reviewerID, err := middleware.GetUserIDFromContext(ctx); err == nil && strings.TrimSpace(reviewerID) != "" {
		reviewer = pointerFromString(reviewerID)
	}

	if err := s.itemRepo.UpdateApproval(ctx, req.GetId(), newStatus, reviewer); err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return nil, status.Error(codes.NotFound, "item not found")
		}
		return nil, status.Errorf(codes.Internal, "failed to update approval: %v", err)
	}

	itemResp, err := s.GetItem(ctx, &v1.GetLibraryItemRequest{Id: req.GetId()})
	if err != nil {
		return nil, err
	}

	return &v1.ApproveLibraryItemResponse{
		Response: &common.Response{
			Success: true,
			Message: "Approval updated successfully",
		},
		Item: itemResp.GetItem(),
	}, nil
}

// RateItem allows a user to rate/review a library item.
func (s *LibraryServiceServer) RateItem(ctx context.Context, req *v1.RateLibraryItemRequest) (*v1.RateLibraryItemResponse, error) {
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil || strings.TrimSpace(userID) == "" {
		return nil, status.Error(codes.Unauthenticated, "user authentication required")
	}

	itemID := strings.TrimSpace(req.GetId())
	if itemID == "" {
		return nil, status.Error(codes.InvalidArgument, "item id is required")
	}

	agg, err := s.ratingService.Submit(ctx, itemID, userID, int(req.GetRating()), req.GetReview())
	if err != nil {
		if errors.Is(err, repository.ErrInvalidInput) {
			return nil, status.Error(codes.InvalidArgument, "invalid rating payload")
		}
		return nil, status.Errorf(codes.Internal, "failed to submit rating: %v", err)
	}

	return &v1.RateLibraryItemResponse{
		Response: &common.Response{
			Success: true,
			Message: "Rating submitted successfully",
		},
		AverageRating: agg.Average,
		ReviewCount:   int32(agg.Count),
	}, nil
}

// BookmarkItem toggles bookmark for current user.
func (s *LibraryServiceServer) BookmarkItem(ctx context.Context, req *v1.BookmarkLibraryItemRequest) (*v1.BookmarkLibraryItemResponse, error) {
	userID, err := middleware.GetUserIDFromContext(ctx)
	if err != nil || strings.TrimSpace(userID) == "" {
		return nil, status.Error(codes.Unauthenticated, "user authentication required")
	}

	itemID := strings.TrimSpace(req.GetId())
	if itemID == "" {
		return nil, status.Error(codes.InvalidArgument, "item id is required")
	}

	bookmarked, err := s.bookmarkService.Set(ctx, itemID, userID, req.GetBookmark())
	if err != nil {
		if errors.Is(err, repository.ErrInvalidInput) {
			return nil, status.Error(codes.InvalidArgument, "invalid bookmark payload")
		}
		return nil, status.Errorf(codes.Internal, "failed to update bookmark: %v", err)
	}

	return &v1.BookmarkLibraryItemResponse{
		Response: &common.Response{
			Success: true,
			Message: "Bookmark updated successfully",
		},
		Bookmarked: bookmarked,
	}, nil
}

// DownloadItem increments download count and returns download URL.
func (s *LibraryServiceServer) DownloadItem(ctx context.Context, req *v1.DownloadLibraryItemRequest) (*v1.DownloadLibraryItemResponse, error) {
	itemID := strings.TrimSpace(req.GetId())
	if itemID == "" {
		return nil, status.Error(codes.InvalidArgument, "item id is required")
	}

	userRole, userLevel := userRoleLevelFromContext(ctx)
	access, err := s.itemRepo.GetAccessMetadata(ctx, itemID)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return nil, status.Error(codes.NotFound, "item not found")
		}
		return nil, status.Errorf(codes.Internal, "failed to load item metadata: %v", err)
	}

	if !hasAccess(userRole, userLevel, accessRequirement{
		requiredRole:  defaultRole(access.RequiredRole),
		requiredLevel: access.RequiredLevel,
		targetRoles:   access.TargetRoles,
	}) {
		return nil, status.Error(codes.PermissionDenied, "access denied")
	}

	var downloadURL string
	switch strings.ToLower(access.ItemType) {
	case "book":
		if _, err := s.bookService.IncrementDownload(ctx, itemID, booksvc.DownloadAudit{}); err != nil {
			return nil, status.Errorf(codes.Internal, "failed to record download: %v", err)
		}
		book, err := s.bookService.GetBook(ctx, itemID)
		if err != nil {
			return nil, status.Errorf(codes.Internal, "failed to load item: %v", err)
		}
		downloadURL = stringFromNull(book.FileURL)
	case "exam":
		if _, err := s.examRepo.IncrementDownloadCount(ctx, itemID, nil, "", ""); err != nil {
			return nil, status.Errorf(codes.Internal, "failed to record download: %v", err)
		}
		exam, err := s.examRepo.GetByID(ctx, itemID)
		if err != nil {
			return nil, status.Errorf(codes.Internal, "failed to load item: %v", err)
		}
		downloadURL = stringFromNull(exam.FileURL)
	case "video":
		if _, err := s.videoService.IncrementDownload(ctx, itemID, videosvc.DownloadAudit{}); err != nil {
			return nil, status.Errorf(codes.Internal, "failed to record download: %v", err)
		}
		video, err := s.videoService.Get(ctx, itemID)
		if err != nil {
			return nil, status.Errorf(codes.Internal, "failed to load item: %v", err)
		}
		downloadURL = video.YoutubeURL
	default:
		return nil, status.Error(codes.InvalidArgument, "unsupported item type")
	}

	return &v1.DownloadLibraryItemResponse{
		Response: &common.Response{
			Success: true,
			Message: "Download recorded successfully",
		},
		DownloadUrl: downloadURL,
	}, nil
}

// SearchItems reuses ListItems behavior with search query.
func (s *LibraryServiceServer) SearchItems(ctx context.Context, req *v1.SearchLibraryItemsRequest) (*v1.SearchLibraryItemsResponse, error) {
	listReq := &v1.ListLibraryItemsRequest{
		Pagination: req.GetPagination(),
		Filter:     req.GetFilter(),
		Search:     req.GetQuery(),
	}

	resp, err := s.ListItems(ctx, listReq)
	if err != nil {
		return nil, err
	}

	return &v1.SearchLibraryItemsResponse{
		Response:   resp.GetResponse(),
		Items:      resp.GetItems(),
		Pagination: resp.GetPagination(),
	}, nil
}

// ---- helper logic ----

func (s *LibraryServiceServer) fetchAndFilterItems(
	ctx context.Context,
	req *v1.ListLibraryItemsRequest,
	types []v1.LibraryItemType,
	userRole string,
	userLevel int,
	page int,
	limit int,
) ([]aggregatedItem, error) {
	fetchLimit := limit * page
	if fetchLimit < limit {
		fetchLimit = limit
	}

	var results []aggregatedItem
	for _, t := range types {
		switch t {
		case v1.LibraryItemType_LIBRARY_ITEM_TYPE_BOOK:
			items, err := s.fetchBooks(ctx, req, fetchLimit)
			if err != nil {
				return nil, err
			}
			results = append(results, items...)
		case v1.LibraryItemType_LIBRARY_ITEM_TYPE_EXAM:
			items, err := s.fetchExams(ctx, req, fetchLimit)
			if err != nil {
				return nil, err
			}
			results = append(results, items...)
		case v1.LibraryItemType_LIBRARY_ITEM_TYPE_VIDEO:
			items, err := s.fetchVideos(ctx, req, fetchLimit)
			if err != nil {
				return nil, err
			}
			results = append(results, items...)
		}
	}

	filtered := make([]aggregatedItem, 0, len(results))
	for _, item := range results {
		if hasAccess(strings.ToUpper(userRole), userLevel, item.required) {
			filtered = append(filtered, item)
		}
	}

	sortAggregatedItems(filtered, strings.TrimSpace(req.GetSortBy()), strings.TrimSpace(req.GetSortOrder()))

	return filtered, nil
}

func (s *LibraryServiceServer) fetchBooks(ctx context.Context, req *v1.ListLibraryItemsRequest, fetchLimit int) ([]aggregatedItem, error) {
	filter := req.GetFilter()
	if filter == nil {
		filter = &v1.LibraryFilter{}
	}

	bookFilters := repository.BookListFilters{
		Limit:     fetchLimit,
		Offset:    0,
		Search:    strings.TrimSpace(req.GetSearch()),
		SortBy:    strings.TrimSpace(req.GetSortBy()),
		SortOrder: strings.TrimSpace(req.GetSortOrder()),
	}
	if filter.GetOnlyActive() {
		active := true
		bookFilters.IsActive = &active
	}

	books, _, err := s.bookService.ListBooks(ctx, bookFilters)
	if err != nil {
		s.logger.WithError(err).Error("list library items (books)")
		return nil, status.Errorf(codes.Internal, "failed to list items: %v", err)
	}

	items := make([]aggregatedItem, 0, len(books))
	for _, book := range books {
		proto := toProtoLibraryItemFromBook(book)
		items = append(items, aggregatedItem{
			proto:     proto,
			createdAt: proto.GetCreatedAt().AsTime(),
			download:  int64(book.DownloadCount),
			rating:    book.AverageRating,
			title:     proto.GetName(),
			itemID:    proto.GetId(),
			required: accessRequirement{
				requiredRole:  defaultRole(proto.GetRequiredRole()),
				requiredLevel: nullInt32ToSQL(proto.GetRequiredLevel()),
				targetRoles:   proto.GetTargetRoles(),
			},
		})
	}
	return items, nil
}

func (s *LibraryServiceServer) fetchExams(ctx context.Context, req *v1.ListLibraryItemsRequest, fetchLimit int) ([]aggregatedItem, error) {
	filter := req.GetFilter()
	if filter == nil {
		filter = &v1.LibraryFilter{}
	}

	examFilters := repository.LibraryExamListFilters{
		Limit:        fetchLimit,
		Offset:       0,
		Subjects:     filter.GetSubjects(),
		Grades:       filter.GetGrades(),
		Province:     strings.TrimSpace(filter.GetProvince()),
		AcademicYear: strings.TrimSpace(filter.GetAcademicYear()),
		Semester:     strings.TrimSpace(filter.GetSemester()),
		Difficulty:   strings.TrimSpace(filter.GetDifficultyLevel()),
		ExamType:     strings.TrimSpace(filter.GetExamType()),
		Search:       strings.TrimSpace(req.GetSearch()),
		SortBy:       strings.TrimSpace(req.GetSortBy()),
		SortOrder:    strings.TrimSpace(req.GetSortOrder()),
	}
	if filter.GetOnlyActive() {
		active := true
		examFilters.OnlyActive = &active
	}

	exams, _, err := s.examRepo.List(ctx, examFilters)
	if err != nil {
		s.logger.WithError(err).Error("list library items (exams)")
		return nil, status.Errorf(codes.Internal, "failed to list items: %v", err)
	}

	items := make([]aggregatedItem, 0, len(exams))
	for _, exam := range exams {
		proto := toProtoLibraryItemFromExam(exam)
		items = append(items, aggregatedItem{
			proto:     proto,
			createdAt: proto.GetCreatedAt().AsTime(),
			download:  int64(exam.DownloadCount),
			rating:    exam.AverageRating,
			title:     proto.GetName(),
			itemID:    proto.GetId(),
			required: accessRequirement{
				requiredRole:  defaultRole(proto.GetRequiredRole()),
				requiredLevel: nullInt32ToSQL(proto.GetRequiredLevel()),
				targetRoles:   proto.GetTargetRoles(),
			},
		})
	}
	return items, nil
}

func (s *LibraryServiceServer) fetchVideos(ctx context.Context, req *v1.ListLibraryItemsRequest, fetchLimit int) ([]aggregatedItem, error) {
	filter := req.GetFilter()
	if filter == nil {
		filter = &v1.LibraryFilter{}
	}

	videoFilters := repository.LibraryVideoListFilters{
		Limit:     fetchLimit,
		Offset:    0,
		Subjects:  filter.GetSubjects(),
		Grades:    filter.GetGrades(),
		Quality:   strings.TrimSpace(filter.GetVideoQuality()),
		Search:    strings.TrimSpace(req.GetSearch()),
		SortBy:    strings.TrimSpace(req.GetSortBy()),
		SortOrder: strings.TrimSpace(req.GetSortOrder()),
	}
	if filter.GetOnlyActive() {
		active := true
		videoFilters.OnlyActive = &active
	}

	videos, _, err := s.videoService.List(ctx, videoFilters)
	if err != nil {
		s.logger.WithError(err).Error("list library items (videos)")
		return nil, status.Errorf(codes.Internal, "failed to list items: %v", err)
	}

	items := make([]aggregatedItem, 0, len(videos))
	for _, video := range videos {
		proto := toProtoLibraryItemFromVideo(video)
		items = append(items, aggregatedItem{
			proto:     proto,
			createdAt: proto.GetCreatedAt().AsTime(),
			download:  int64(video.DownloadCount),
			rating:    video.AverageRating,
			title:     proto.GetName(),
			itemID:    proto.GetId(),
			required: accessRequirement{
				requiredRole:  defaultRole(proto.GetRequiredRole()),
				requiredLevel: nullInt32ToSQL(proto.GetRequiredLevel()),
				targetRoles:   proto.GetTargetRoles(),
			},
		})
	}
	return items, nil
}

func sortAggregatedItems(items []aggregatedItem, sortBy, sortOrder string) {
	orderDesc := !strings.EqualFold(sortOrder, "asc")
	switch strings.ToLower(sortBy) {
	case "download_count":
		sort.SliceStable(items, func(i, j int) bool {
			if orderDesc {
				return items[i].download > items[j].download
			}
			return items[i].download < items[j].download
		})
	case "rating":
		sort.SliceStable(items, func(i, j int) bool {
			if orderDesc {
				return items[i].rating > items[j].rating
			}
			return items[i].rating < items[j].rating
		})
	case "title":
		sort.SliceStable(items, func(i, j int) bool {
			if orderDesc {
				return strings.ToLower(items[i].title) > strings.ToLower(items[j].title)
			}
			return strings.ToLower(items[i].title) < strings.ToLower(items[j].title)
		})
	default: // created_at
		sort.SliceStable(items, func(i, j int) bool {
			if orderDesc {
				return items[i].createdAt.After(items[j].createdAt)
			}
			return items[i].createdAt.Before(items[j].createdAt)
		})
	}
}

func resolveLibraryItemTypes(filter *v1.LibraryFilter) ([]v1.LibraryItemType, error) {
	if filter == nil || len(filter.Types) == 0 {
		return []v1.LibraryItemType{
			v1.LibraryItemType_LIBRARY_ITEM_TYPE_BOOK,
			v1.LibraryItemType_LIBRARY_ITEM_TYPE_EXAM,
			v1.LibraryItemType_LIBRARY_ITEM_TYPE_VIDEO,
		}, nil
	}

	typeSet := make(map[v1.LibraryItemType]struct{}, len(filter.Types))
	for _, t := range filter.Types {
		if t == v1.LibraryItemType_LIBRARY_ITEM_TYPE_UNSPECIFIED {
			continue
		}
		switch t {
		case v1.LibraryItemType_LIBRARY_ITEM_TYPE_BOOK,
			v1.LibraryItemType_LIBRARY_ITEM_TYPE_EXAM,
			v1.LibraryItemType_LIBRARY_ITEM_TYPE_VIDEO:
			typeSet[t] = struct{}{}
		default:
			return nil, status.Error(codes.InvalidArgument, "unsupported library item type requested")
		}
	}

	if len(typeSet) == 0 {
		return []v1.LibraryItemType{
			v1.LibraryItemType_LIBRARY_ITEM_TYPE_BOOK,
			v1.LibraryItemType_LIBRARY_ITEM_TYPE_EXAM,
			v1.LibraryItemType_LIBRARY_ITEM_TYPE_VIDEO,
		}, nil
	}

	types := make([]v1.LibraryItemType, 0, len(typeSet))
	for t := range typeSet {
		types = append(types, t)
	}
	return types, nil
}

func hasAccess(userRole string, userLevel int, requirement accessRequirement) bool {
	requiredRole := defaultRole(requirement.requiredRole)
	userValue := roleHierarchy[userRole]
	requiredValue := roleHierarchy[requiredRole]

	if userValue < requiredValue {
		return false
	}

	if requirement.requiredLevel.Valid && userLevel < int(requirement.requiredLevel.Int32) {
		return false
	}

	targetRoles := normalizeRoles(requirement.targetRoles)
	if len(targetRoles) == 0 {
		return true
	}

	if containsRole(targetRoles, userRole) {
		return true
	}

	return userRole == "ADMIN"
}

func normalizeRoles(roles []string) []string {
	norm := make([]string, 0, len(roles))
	for _, r := range roles {
		r = strings.TrimSpace(strings.ToUpper(r))
		if r != "" {
			norm = append(norm, r)
		}
	}
	return norm
}

func containsRole(roles []string, role string) bool {
	for _, r := range roles {
		if r == role || r == "ALL" {
			return true
		}
	}
	return false
}

func userRoleLevelFromContext(ctx context.Context) (string, int) {
	role, err := middleware.GetUserRoleFromContext(ctx)
	if err != nil || role == "" {
		role = "GUEST"
	}
	level, err := middleware.GetUserLevelFromContext(ctx)
	if err != nil {
		level = 0
	}
	return strings.ToUpper(role), level
}

func defaultRole(role string) string {
	role = strings.ToUpper(strings.TrimSpace(role))
	if role == "" {
		return "GUEST"
	}
	if _, ok := roleHierarchy[role]; !ok {
		return "GUEST"
	}
	return role
}

func toCreateBookInput(payload *v1.LibraryItemPayload, uploadedBy string) (booksvc.CreateBookInput, error) {
	if payload == nil {
		return booksvc.CreateBookInput{}, fmt.Errorf("item payload is required")
	}

	title := strings.TrimSpace(payload.GetName())
	if title == "" {
		return booksvc.CreateBookInput{}, fmt.Errorf("name is required")
	}

	meta := payload.GetBook()
	if meta == nil {
		return booksvc.CreateBookInput{}, fmt.Errorf("book metadata is required")
	}

	bookType := strings.TrimSpace(meta.GetBookType())
	if bookType == "" {
		return booksvc.CreateBookInput{}, fmt.Errorf("book_type is required")
	}

	fileURL := strings.TrimSpace(payload.GetFileUrl())
	if fileURL == "" {
		return booksvc.CreateBookInput{}, fmt.Errorf("file_url is required for book items")
	}

	fileID := strings.TrimSpace(payload.GetFileId())
	input := booksvc.CreateBookInput{
		Title:           title,
		Description:     strings.TrimSpace(payload.GetDescription()),
		Category:        strings.TrimSpace(payload.GetCategory()),
		Subject:         strings.TrimSpace(meta.GetSubject()),
		Grade:           strings.TrimSpace(meta.GetGrade()),
		BookType:        bookType,
		Author:          strings.TrimSpace(meta.GetAuthor()),
		Publisher:       strings.TrimSpace(meta.GetPublisher()),
		PublicationYear: int32PointerFromWrapper(meta.GetPublicationYear()),
		ISBN:            strings.TrimSpace(meta.GetIsbn()),
		PageCount:       int32PointerFromWrapper(meta.GetPageCount()),
		CoverImage:      strings.TrimSpace(meta.GetCoverImage()),
		FileURL:         fileURL,
		FileID:          fileID,
		ThumbnailURL:    strings.TrimSpace(payload.GetThumbnailUrl()),
		FileSize:        int64PointerFromWrapper(payload.GetFileSize()),
		FileType:        "",
		Tags:            copyStringSlice(payload.GetTags()),
		UploadedBy:      strings.TrimSpace(uploadedBy),
		ApprovedBy:      "",
		IsActive:        false,
		UploadStatus:    "pending",
		RequiredRole:    strings.TrimSpace(payload.GetRequiredRole()),
		RequiredLevel:   int32PointerFromWrapper(payload.GetRequiredLevel()),
		TargetRoles:     copyStringSlice(payload.GetTargetRoles()),
	}

	if guessed := guessFileType(fileURL, fileID); guessed != "" {
		input.FileType = guessed
	}

	return input, nil
}

func toUpdateBookInput(payload *v1.LibraryItemPayload, existing *entity.Book) (booksvc.UpdateBookInput, error) {
	if existing == nil {
		return booksvc.UpdateBookInput{}, fmt.Errorf("existing book is required")
	}

	if payload == nil {
		return booksvc.UpdateBookInput{
			Title:           existing.Title,
			Description:     stringFromNull(existing.Description),
			Category:        stringFromNull(existing.Category),
			Subject:         stringFromNull(existing.Subject),
			Grade:           stringFromNull(existing.Grade),
			BookType:        stringFromNull(existing.BookType),
			Author:          stringFromNull(existing.Author),
			Publisher:       stringFromNull(existing.Publisher),
			PublicationYear: int32PointerFromNull(existing.PublicationYear),
			ISBN:            stringFromNull(existing.ISBN),
			PageCount:       int32PointerFromNull(existing.PageCount),
			CoverImage:      stringFromNull(existing.CoverImage),
			FileURL:         stringFromNull(existing.FileURL),
			FileID:          stringFromNull(existing.FileID),
			ThumbnailURL:    stringFromNull(existing.ThumbnailURL),
			FileSize:        int64PointerFromNull(existing.FileSize),
			FileType:        stringFromNull(existing.FileType),
			Tags:            copyStringSlice(existing.Tags),
			IsActive:        existing.IsActive,
			UploadStatus:    existing.UploadStatus,
			RequiredRole:    existing.RequiredRole,
			RequiredLevel:   int32PointerFromNull(existing.RequiredLevel),
			TargetRoles:     copyStringSlice(existing.TargetRoles),
			ApprovedBy:      stringFromNull(existing.ApprovedBy),
		}, nil
	}

	meta := payload.GetBook()
	title := strings.TrimSpace(payload.GetName())
	if title == "" {
		title = existing.Title
	}

	description := strings.TrimSpace(payload.GetDescription())
	if description == "" && existing.Description.Valid {
		description = existing.Description.String
	}

	category := strings.TrimSpace(payload.GetCategory())
	if category == "" {
		category = stringFromNull(existing.Category)
	}

	subject := ""
	grade := ""
	bookType := ""
	author := ""
	publisher := ""
	isbn := ""
	coverImage := ""
	var publicationYear *int32
	var pageCount *int32

	if meta != nil {
		subject = strings.TrimSpace(meta.GetSubject())
		grade = strings.TrimSpace(meta.GetGrade())
		bookType = strings.TrimSpace(meta.GetBookType())
		author = strings.TrimSpace(meta.GetAuthor())
		publisher = strings.TrimSpace(meta.GetPublisher())
		isbn = strings.TrimSpace(meta.GetIsbn())
		coverImage = strings.TrimSpace(meta.GetCoverImage())
		publicationYear = int32PointerFromWrapper(meta.GetPublicationYear())
		pageCount = int32PointerFromWrapper(meta.GetPageCount())
	}

	if subject == "" {
		subject = stringFromNull(existing.Subject)
	}
	if grade == "" {
		grade = stringFromNull(existing.Grade)
	}
	if bookType == "" {
		bookType = stringFromNull(existing.BookType)
	}
	if author == "" {
		author = stringFromNull(existing.Author)
	}
	if publisher == "" {
		publisher = stringFromNull(existing.Publisher)
	}
	if isbn == "" {
		isbn = stringFromNull(existing.ISBN)
	}
	if coverImage == "" {
		coverImage = stringFromNull(existing.CoverImage)
	}
	if publicationYear == nil {
		publicationYear = int32PointerFromNull(existing.PublicationYear)
	}
	if pageCount == nil {
		pageCount = int32PointerFromNull(existing.PageCount)
	}

	fileURL := strings.TrimSpace(payload.GetFileUrl())
	if fileURL == "" {
		fileURL = stringFromNull(existing.FileURL)
	}

	fileID := strings.TrimSpace(payload.GetFileId())
	if fileID == "" {
		fileID = stringFromNull(existing.FileID)
	}

	thumbnail := strings.TrimSpace(payload.GetThumbnailUrl())
	if thumbnail == "" {
		thumbnail = stringFromNull(existing.ThumbnailURL)
	}

	fileSize := int64PointerFromWrapper(payload.GetFileSize())
	if fileSize == nil {
		fileSize = int64PointerFromNull(existing.FileSize)
	}

	fileType := stringFromNull(existing.FileType)
	if guessed := guessFileType(fileURL, fileID); guessed != "" {
		fileType = guessed
	}

	requiredRole := strings.TrimSpace(payload.GetRequiredRole())
	if requiredRole == "" {
		requiredRole = defaultRole(existing.RequiredRole)
	}

	requiredLevel := int32PointerFromWrapper(payload.GetRequiredLevel())
	if requiredLevel == nil {
		requiredLevel = int32PointerFromNull(existing.RequiredLevel)
	}

	var targetRoles []string
	if payload.TargetRoles != nil {
		targetRoles = copyStringSlice(payload.GetTargetRoles())
	} else {
		targetRoles = copyStringSlice(existing.TargetRoles)
	}

	var tags []string
	if payload.Tags != nil {
		tags = copyStringSlice(payload.GetTags())
	} else {
		tags = copyStringSlice(existing.Tags)
	}

	input := booksvc.UpdateBookInput{
		Title:           title,
		Description:     description,
		Category:        category,
		Subject:         subject,
		Grade:           grade,
		BookType:        bookType,
		Author:          author,
		Publisher:       publisher,
		PublicationYear: publicationYear,
		ISBN:            isbn,
		PageCount:       pageCount,
		CoverImage:      coverImage,
		FileURL:         fileURL,
		FileID:          fileID,
		ThumbnailURL:    thumbnail,
		FileSize:        fileSize,
		FileType:        fileType,
		Tags:            tags,
		IsActive:        existing.IsActive,
		UploadStatus:    existing.UploadStatus,
		RequiredRole:    requiredRole,
		RequiredLevel:   requiredLevel,
		TargetRoles:     targetRoles,
		ApprovedBy:      stringFromNull(existing.ApprovedBy),
	}

	return input, nil
}

func int32PointerFromWrapper(value *wrapperspb.Int32Value) *int32 {
	if value == nil {
		return nil
	}
	v := value.Value
	return &v
}

func int64PointerFromWrapper(value *wrapperspb.Int64Value) *int64 {
	if value == nil {
		return nil
	}
	v := value.Value
	return &v
}

func int32PointerFromNull(value sql.NullInt32) *int32 {
	if !value.Valid {
		return nil
	}
	v := value.Int32
	return &v
}

func int64PointerFromNull(value sql.NullInt64) *int64 {
	if !value.Valid {
		return nil
	}
	v := value.Int64
	return &v
}

func copyStringSlice(values []string) []string {
	if len(values) == 0 {
		return []string{}
	}
	out := make([]string, len(values))
	copy(out, values)
	return out
}

func guessFileType(fileURL, fileID string) string {
	for _, candidate := range []string{fileURL, fileID} {
		candidate = strings.TrimSpace(candidate)
		if candidate == "" {
			continue
		}
		if ext := strings.ToLower(strings.TrimPrefix(path.Ext(candidate), ".")); ext != "" {
			return ext
		}
	}
	return ""
}

func nullInt32ToSQL(value *wrapperspb.Int32Value) sql.NullInt32 {
	if value == nil {
		return sql.NullInt32{Valid: false}
	}
	return sql.NullInt32{Int32: value.Value, Valid: true}
}

func toProtoLibraryItemFromBook(book *entity.Book) *v1.LibraryItem {
	return &v1.LibraryItem{
		Id:            book.ID,
		Name:          book.Title,
		Type:          v1.LibraryItemType_LIBRARY_ITEM_TYPE_BOOK,
		Description:   stringFromNull(book.Description),
		FileUrl:       stringFromNull(book.FileURL),
		FileId:        stringFromNull(book.FileID),
		ThumbnailUrl:  stringFromNull(book.ThumbnailURL),
		FileSize:      nullInt64(book.FileSize),
		UploadStatus:  toUploadStatus(book.UploadStatus),
		IsActive:      book.IsActive,
		UploadedBy:    stringFromNull(book.UploadedBy),
		ApprovedBy:    stringFromNull(book.ApprovedBy),
		Tags:          append([]string(nil), book.Tags...),
		RequiredRole:  defaultRole(book.RequiredRole),
		RequiredLevel: nullInt32(book.RequiredLevel),
		TargetRoles:   append([]string(nil), book.TargetRoles...),
		DownloadCount: int64(book.DownloadCount),
		AverageRating: book.AverageRating,
		ReviewCount:   int32(book.ReviewCount),
		CreatedAt:     timestamppb.New(book.CreatedAt),
		UpdatedAt:     timestamppb.New(book.UpdatedAt),
		Metadata: &v1.LibraryItem_Book{
			Book: &v1.BookMetadata{
				Subject:         stringFromNull(book.Subject),
				Grade:           stringFromNull(book.Grade),
				BookType:        stringFromNull(book.BookType),
				Author:          stringFromNull(book.Author),
				Publisher:       stringFromNull(book.Publisher),
				Isbn:            stringFromNull(book.ISBN),
				PageCount:       nullInt32(book.PageCount),
				CoverImage:      stringFromNull(book.CoverImage),
				PublicationYear: nullInt32(book.PublicationYear),
				CreatedAt:       timestamppb.New(book.CreatedAt),
				UpdatedAt:       timestamppb.New(book.UpdatedAt),
			},
		},
	}
}

func toProtoLibraryItemFromExam(exam *entity.LibraryExam) *v1.LibraryItem {
	return &v1.LibraryItem{
		Id:            exam.ID,
		Name:          exam.Title,
		Type:          v1.LibraryItemType_LIBRARY_ITEM_TYPE_EXAM,
		Description:   stringFromNull(exam.Description),
		FileUrl:       stringFromNull(exam.FileURL),
		FileId:        stringFromNull(exam.FileID),
		ThumbnailUrl:  stringFromNull(exam.ThumbnailURL),
		FileSize:      nullInt64(exam.FileSize),
		UploadStatus:  toUploadStatus(exam.UploadStatus),
		IsActive:      exam.IsActive,
		UploadedBy:    stringFromNull(exam.UploadedBy),
		ApprovedBy:    stringFromNull(exam.ApprovedBy),
		Tags:          append([]string(nil), exam.Tags...),
		RequiredRole:  defaultRole(exam.RequiredRole),
		RequiredLevel: nullInt32(exam.RequiredLevel),
		TargetRoles:   append([]string(nil), exam.TargetRoles...),
		DownloadCount: int64(exam.DownloadCount),
		AverageRating: exam.AverageRating,
		ReviewCount:   int32(exam.ReviewCount),
		CreatedAt:     timestamppb.New(exam.CreatedAt),
		UpdatedAt:     timestamppb.New(exam.UpdatedAt),
		Metadata: &v1.LibraryItem_Exam{
			Exam: &v1.ExamMetadata{
				Subject:         exam.Subject,
				Grade:           exam.Grade,
				Province:        stringFromNull(exam.Province),
				School:          stringFromNull(exam.School),
				AcademicYear:    exam.AcademicYear,
				Semester:        stringFromNull(exam.Semester),
				ExamDuration:    nullInt32(exam.ExamDuration),
				QuestionCount:   nullInt32(exam.QuestionCount),
				DifficultyLevel: stringFromNull(exam.Difficulty),
				ExamType:        exam.ExamType,
				CreatedAt:       timestamppb.New(exam.CreatedAt),
				UpdatedAt:       timestamppb.New(exam.UpdatedAt),
			},
		},
	}
}

func toProtoLibraryItemFromVideo(video *entity.LibraryVideo) *v1.LibraryItem {
	return &v1.LibraryItem{
		Id:            video.ID,
		Name:          video.Title,
		Type:          v1.LibraryItemType_LIBRARY_ITEM_TYPE_VIDEO,
		Description:   stringFromNull(video.Description),
		FileUrl:       stringFromNull(video.FileURL),
		FileId:        stringFromNull(video.FileID),
		ThumbnailUrl:  stringFromNull(video.ThumbnailURL),
		FileSize:      nullInt64(video.FileSize),
		UploadStatus:  toUploadStatus(video.UploadStatus),
		IsActive:      video.IsActive,
		UploadedBy:    stringFromNull(video.UploadedBy),
		ApprovedBy:    stringFromNull(video.ApprovedBy),
		Tags:          append([]string(nil), video.Tags...),
		RequiredRole:  defaultRole(video.RequiredRole),
		RequiredLevel: nullInt32(video.RequiredLevel),
		TargetRoles:   append([]string(nil), video.TargetRoles...),
		DownloadCount: int64(video.DownloadCount),
		AverageRating: video.AverageRating,
		ReviewCount:   int32(video.ReviewCount),
		CreatedAt:     timestamppb.New(video.CreatedAt),
		UpdatedAt:     timestamppb.New(video.UpdatedAt),
		Metadata: &v1.LibraryItem_Video{
			Video: &v1.VideoMetadata{
				YoutubeUrl:     video.YoutubeURL,
				YoutubeId:      video.YoutubeID,
				Duration:       nullInt32(video.Duration),
				Quality:        stringFromNull(video.Quality),
				InstructorName: stringFromNull(video.InstructorName),
				RelatedExamId:  stringFromNull(video.RelatedExamID),
				Subject:        video.Subject,
				Grade:          video.Grade,
				CreatedAt:      timestamppb.New(video.CreatedAt),
				UpdatedAt:      timestamppb.New(video.UpdatedAt),
			},
		},
	}
}

func toUploadStatus(status string) v1.LibraryUploadStatus {
	switch strings.ToLower(status) {
	case "approved":
		return v1.LibraryUploadStatus_LIBRARY_UPLOAD_STATUS_APPROVED
	case "rejected":
		return v1.LibraryUploadStatus_LIBRARY_UPLOAD_STATUS_REJECTED
	case "archived":
		return v1.LibraryUploadStatus_LIBRARY_UPLOAD_STATUS_ARCHIVED
	default:
		return v1.LibraryUploadStatus_LIBRARY_UPLOAD_STATUS_PENDING
	}
}

func stringFromNull(value sql.NullString) string {
	if value.Valid {
		return value.String
	}
	return ""
}

func nullInt32(value sql.NullInt32) *wrapperspb.Int32Value {
	if value.Valid {
		return wrapperspb.Int32(value.Int32)
	}
	return nil
}

func nullInt64(value sql.NullInt64) *wrapperspb.Int64Value {
	if value.Valid {
		return wrapperspb.Int64(value.Int64)
	}
	return nil
}

func pointerFromString(value string) *string {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return nil
	}
	result := trimmed
	return &result
}
