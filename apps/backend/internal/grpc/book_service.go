package grpc

import (
	"context"
	"database/sql"
	"strconv"
	"strings"
	"time"

	"exam-bank-system/apps/backend/internal/entity"
	"exam-bank-system/apps/backend/internal/middleware"
	"exam-bank-system/apps/backend/internal/repository"
	booksvc "exam-bank-system/apps/backend/internal/service/content/book"
	"exam-bank-system/apps/backend/pkg/proto/common"
	v1 "exam-bank-system/apps/backend/pkg/proto/v1"
	"github.com/sirupsen/logrus"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
)

// BookServiceServer wires the book domain service to gRPC.
type BookServiceServer struct {
	v1.UnimplementedBookServiceServer
	bookService *booksvc.BookService
	logger      *logrus.Entry
}

// NewBookServiceServer creates a new server instance.
func NewBookServiceServer(service *booksvc.BookService) *BookServiceServer {
	return &BookServiceServer{
		bookService: service,
		logger:      logrus.WithField("component", "BookServiceServer"),
	}
}

// ListBooks handles pagination and filtering.
func (s *BookServiceServer) ListBooks(ctx context.Context, req *v1.ListBooksRequest) (*v1.ListBooksResponse, error) {
	pagination := req.GetPagination()
	limit := int(pagination.GetLimit())
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	page := int(pagination.GetPage())
	if page <= 0 {
		page = 1
	}
	offset := (page - 1) * limit

	filters := buildRepositoryFilters(req, limit, offset)

	books, total, err := s.bookService.ListBooks(ctx, filters)
	if err != nil {
		s.logger.WithError(err).Error("list books")
		return nil, status.Errorf(codes.Internal, "failed to list books: %v", err)
	}

	totalActive, err := s.bookService.CountActiveBooks(ctx)
	if err != nil {
		s.logger.WithError(err).Warn("count active books")
	}

	resp := &v1.ListBooksResponse{
		Response: &common.Response{
			Success: true,
			Message: "Books loaded successfully",
		},
		Books:       make([]*v1.Book, 0, len(books)),
		Pagination:  &common.PaginationResponse{},
		TotalActive: int32(totalActive),
	}

	resp.Pagination.Page = int32(page)
	resp.Pagination.Limit = int32(limit)
	resp.Pagination.TotalCount = int32(total)
	if limit > 0 {
		resp.Pagination.TotalPages = int32((total + limit - 1) / limit)
	}

	for _, b := range books {
		resp.Books = append(resp.Books, toProtoBook(b))
	}

	return resp, nil
}

// GetBook returns book detail by ID.
func (s *BookServiceServer) GetBook(ctx context.Context, req *v1.GetBookRequest) (*v1.GetBookResponse, error) {
	book, err := s.bookService.GetBook(ctx, strings.TrimSpace(req.GetId()))
	if err != nil {
		if err == repository.ErrNotFound {
			return nil, status.Error(codes.NotFound, "book not found")
		}
		s.logger.WithError(err).Error("get book")
		return nil, status.Errorf(codes.Internal, "failed to get book: %v", err)
	}

	return &v1.GetBookResponse{
		Response: &common.Response{
			Success: true,
			Message: "Book retrieved successfully",
		},
		Book: toProtoBook(book),
	}, nil
}

// CreateBook creates a new book entry.
func (s *BookServiceServer) CreateBook(ctx context.Context, req *v1.CreateBookRequest) (*v1.CreateBookResponse, error) {
	userID, _ := middleware.GetUserIDFromContext(ctx)

	publishedAt := req.GetPublishedDate()
	var published *time.Time
	if publishedAt != nil {
		t := publishedAt.AsTime()
		published = &t
	}

	var fileSize *int64
	if sizeStr := strings.TrimSpace(req.GetFileSize()); sizeStr != "" {
		parsed, err := strconv.ParseInt(sizeStr, 10, 64)
		if err != nil {
			return nil, status.Error(codes.InvalidArgument, "file_size must be numeric")
		}
		fileSize = &parsed
	}

	input := booksvc.CreateBookInput{
		Title:           req.GetTitle(),
		Description:     req.GetDescription(),
		Category:        req.GetCategory(),
		Author:          req.GetAuthor(),
		Publisher:       req.GetPublisher(),
		PublicationDate: published,
		ISBN:            req.GetIsbn(),
		Tags:            req.GetTags(),
		CoverImage:      req.GetCoverImage(),
		FileURL:         req.GetFileUrl(),
		FileType:        req.GetFileType(),
		FileSize:        fileSize,
		IsActive:        req.GetIsActive(),
		UploadStatus:    statusForActive(req.GetIsActive()),
		UploadedBy:      userID,
		ApprovedBy:      userID,
	}

	book, err := s.bookService.CreateBook(ctx, input)
	if err != nil {
		s.logger.WithError(err).Error("create book")
		return nil, status.Errorf(codes.Internal, "failed to create book: %v", err)
	}

	return &v1.CreateBookResponse{
		Response: &common.Response{
			Success: true,
			Message: "Book created successfully",
		},
		Book: toProtoBook(book),
	}, nil
}

// UpdateBook updates book metadata.
func (s *BookServiceServer) UpdateBook(ctx context.Context, req *v1.UpdateBookRequest) (*v1.UpdateBookResponse, error) {
	userID, _ := middleware.GetUserIDFromContext(ctx)

	publishedAt := req.GetPublishedDate()
	var published *time.Time
	if publishedAt != nil {
		t := publishedAt.AsTime()
		published = &t
	}

	var fileSize *int64
	if sizeStr := strings.TrimSpace(req.GetFileSize()); sizeStr != "" {
		parsed, err := strconv.ParseInt(sizeStr, 10, 64)
		if err != nil {
			return nil, status.Error(codes.InvalidArgument, "file_size must be numeric")
		}
		fileSize = &parsed
	}

	input := booksvc.UpdateBookInput{
		Title:           req.GetTitle(),
		Description:     req.GetDescription(),
		Category:        req.GetCategory(),
		Author:          req.GetAuthor(),
		Publisher:       req.GetPublisher(),
		PublicationDate: published,
		ISBN:            req.GetIsbn(),
		Tags:            req.GetTags(),
		CoverImage:      req.GetCoverImage(),
		FileURL:         req.GetFileUrl(),
		FileType:        req.GetFileType(),
		FileSize:        fileSize,
		IsActive:        req.GetIsActive(),
		UploadStatus:    statusForActive(req.GetIsActive()),
		ApprovedBy:      userID,
	}

	if err := s.populateMissingFields(ctx, req.GetId(), &input); err != nil {
		if err == repository.ErrNotFound {
			return nil, status.Error(codes.NotFound, "book not found")
		}
		s.logger.WithError(err).Error("populate existing book state")
		return nil, status.Errorf(codes.Internal, "failed to prepare update: %v", err)
	}

	book, err := s.bookService.UpdateBook(ctx, req.GetId(), input)
	if err != nil {
		if err == repository.ErrNotFound {
			return nil, status.Error(codes.NotFound, "book not found")
		}
		s.logger.WithError(err).Error("update book")
		return nil, status.Errorf(codes.Internal, "failed to update book: %v", err)
	}

	return &v1.UpdateBookResponse{
		Response: &common.Response{
			Success: true,
			Message: "Book updated successfully",
		},
		Book: toProtoBook(book),
	}, nil
}

// DeleteBook performs a soft delete.
func (s *BookServiceServer) DeleteBook(ctx context.Context, req *v1.DeleteBookRequest) (*v1.DeleteBookResponse, error) {
	userID, _ := middleware.GetUserIDFromContext(ctx)

	if err := s.bookService.DeleteBook(ctx, req.GetId(), userID); err != nil {
		if err == repository.ErrNotFound {
			return nil, status.Error(codes.NotFound, "book not found")
		}
		s.logger.WithError(err).Error("delete book")
		return nil, status.Errorf(codes.Internal, "failed to delete book: %v", err)
	}

	return &v1.DeleteBookResponse{
		Response: &common.Response{
			Success: true,
			Message: "Book archived successfully",
		},
	}, nil
}

// IncrementDownloadCount increases download counter and logs history.
func (s *BookServiceServer) IncrementDownloadCount(ctx context.Context, req *v1.IncrementDownloadCountRequest) (*v1.IncrementDownloadCountResponse, error) {
	userID, _ := middleware.GetUserIDFromContext(ctx)
	var ptr *string
	if userID != "" {
		ptr = &userID
	}

	count, err := s.bookService.IncrementDownload(ctx, req.GetId(), booksvc.DownloadAudit{
		UserID: ptr,
	})
	if err != nil {
		if err == repository.ErrNotFound {
			return nil, status.Error(codes.NotFound, "book not found")
		}
		s.logger.WithError(err).Error("increment download count")
		return nil, status.Errorf(codes.Internal, "failed to update download count: %v", err)
	}

	return &v1.IncrementDownloadCountResponse{
		Response: &common.Response{
			Success: true,
			Message: "Download count updated",
		},
		DownloadCount: int32(count),
	}, nil
}

func (s *BookServiceServer) populateMissingFields(ctx context.Context, id string, input *booksvc.UpdateBookInput) error {
	book, err := s.bookService.GetBook(ctx, id)
	if err != nil {
		return err
	}

	input.PageCount = nullInt32Ptr(book.PageCount)
	input.PublicationYear = nullInt32Ptr(book.PublicationYear)
	input.RequiredLevel = nullInt32Ptr(book.RequiredLevel)
	input.TargetRoles = book.TargetRoles
	input.FileID = nullStringValue(book.FileID)
	input.ThumbnailURL = nullStringValue(book.ThumbnailURL)

	if input.CoverImage == "" {
		input.CoverImage = chooseCover(book)
	}
	if input.FileURL == "" {
		input.FileURL = nullString(book.FileURL)
	}
	if input.FileType == "" {
		input.FileType = nullString(book.FileType)
	}
	if input.Description == "" {
		input.Description = nullString(book.Description)
	}
	if input.Category == "" {
		input.Category = nullString(book.Category)
	}
	if input.Author == "" {
		input.Author = nullString(book.Author)
	}
	if input.Publisher == "" {
		input.Publisher = nullString(book.Publisher)
	}
	if input.ISBN == "" {
		input.ISBN = nullString(book.ISBN)
	}

	if input.FileSize == nil && book.FileSize.Valid {
		size := book.FileSize.Int64
		input.FileSize = &size
	}

	return nil
}

func toProtoBook(book *entity.Book) *v1.Book {
	result := &v1.Book{
		Id:            book.ID,
		Title:         book.Title,
		Description:   nullString(book.Description),
		Author:        nullString(book.Author),
		Isbn:          nullString(book.ISBN),
		Publisher:     nullString(book.Publisher),
		Category:      nullString(book.Category),
		Tags:          append([]string(nil), book.Tags...),
		CoverImage:    chooseCover(book),
		FileUrl:       nullString(book.FileURL),
		FileType:      nullString(book.FileType),
		FileSize:      fileSizeAsString(book.FileSize),
		IsActive:      book.IsActive,
		DownloadCount: int32(book.DownloadCount),
		Rating:        float32(book.AverageRating),
		Reviews:       int32(book.ReviewCount),
		CreatedAt:     timestamppb.New(book.CreatedAt),
		UpdatedAt:     timestamppb.New(book.UpdatedAt),
	}

	if ts := publishedTimestamp(book); ts != nil {
		result.PublishedDate = ts
	}

	return result
}

func publishedTimestamp(book *entity.Book) *timestamppb.Timestamp {
	if book.PublicationDate.Valid {
		return timestamppb.New(book.PublicationDate.Time)
	}
	if book.PublicationYear.Valid {
		t := time.Date(int(book.PublicationYear.Int32), time.January, 1, 0, 0, 0, 0, time.UTC)
		return timestamppb.New(t)
	}
	return nil
}

func fileSizeAsString(value sql.NullInt64) string {
	if value.Valid {
		return strconv.FormatInt(value.Int64, 10)
	}
	return ""
}

func nullString(value sql.NullString) string {
	if value.Valid {
		return value.String
	}
	return ""
}

func nullStringValue(value sql.NullString) string {
	if value.Valid {
		return value.String
	}
	return ""
}

func chooseCover(book *entity.Book) string {
	if book.CoverImage.Valid {
		return book.CoverImage.String
	}
	if book.ThumbnailURL.Valid {
		return book.ThumbnailURL.String
	}
	return ""
}

func statusForActive(active bool) string {
	if active {
		return "approved"
	}
	return "pending"
}

func nullInt32Ptr(value sql.NullInt32) *int32 {
	if value.Valid {
		v := value.Int32
		return &v
	}
	return nil
}

func buildRepositoryFilters(req *v1.ListBooksRequest, limit, offset int) repository.BookListFilters {
	filters := repository.BookListFilters{
		Limit:     limit,
		Offset:    offset,
		Category:  strings.TrimSpace(req.GetCategory()),
		Author:    strings.TrimSpace(req.GetAuthor()),
		FileType:  strings.TrimSpace(req.GetFileType()),
		Search:    strings.TrimSpace(req.GetSearch()),
		SortBy:    strings.TrimSpace(req.GetSortBy()),
		SortOrder: strings.TrimSpace(req.GetSortOrder()),
	}

	if req.GetIsActive() {
		active := true
		filters.IsActive = &active
	}

	return filters
}
