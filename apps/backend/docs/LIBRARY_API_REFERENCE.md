# Library System Backend API Reference

This document provides comprehensive API reference for the Library system backend handlers.

## Table of Contents

- [Tags API](#tags-api)
- [Analytics API](#analytics-api)
- [Search Suggestions API](#search-suggestions-api)
- [Audit Logging](#audit-logging)
- [Upload Handler](#upload-handler)

---

## Tags API

Handler: `LibraryTagsHandler`

### CreateTag

Creates a new tag.

**Request:**
```go
type CreateTagRequest struct {
    Name        string // Required
    Description string // Optional
    Color       string // Optional (hex format, e.g., "#3b82f6")
    IsTrending  bool   // Optional, default: false
}
```

**Response:**
```go
type TagResponse struct {
    ID          string
    Name        string
    Description string
    Color       string
    IsTrending  bool
    UsageCount  int
    CreatedAt   string // ISO 8601 format
    UpdatedAt   string // ISO 8601 format
}
```

**Validation:**
- `Name` is required
- Color should be in hex format (#RRGGBB)

**Example:**
```go
req := &CreateTagRequest{
    Name:        "Toán học",
    Description: "Môn toán học",
    Color:       "#3b82f6",
    IsTrending:  false,
}
resp, err := handler.CreateTag(ctx, req)
```

### GetTag

Retrieves a tag by ID.

**Parameters:**
- `tagID` (string): Tag identifier

**Response:** `TagResponse`

**Errors:**
- `InvalidArgument`: Tag ID is required
- `NotFound`: Tag not found

### ListTags

Lists tags with filters and pagination.

**Request:**
```go
type ListTagsRequest struct {
    Search     string // Optional: ILIKE search on name
    IsTrending *bool  // Optional: filter by trending status
    Limit      int    // Optional, default: 50, max: 100
    Offset     int    // Optional, default: 0
}
```

**Response:**
```go
type ListTagsResponse struct {
    Tags  []*TagResponse
    Total int
}
```

**Example:**
```go
req := &ListTagsRequest{
    Search:     "toán",
    IsTrending: &trueValue,
    Limit:      20,
    Offset:     0,
}
resp, err := handler.ListTags(ctx, req)
```

### UpdateTag

Updates an existing tag.

**Request:**
```go
type UpdateTagRequest struct {
    TagID       string // Required
    Name        string // Optional
    Description string // Optional
    Color       string // Optional
    IsTrending  bool   // Will be set
}
```

**Response:** `TagResponse`

**Errors:**
- `InvalidArgument`: Tag ID is required
- `NotFound`: Tag not found

### DeleteTag

Deletes a tag.

**Parameters:**
- `tagID` (string): Tag identifier

**Errors:**
- `InvalidArgument`: Tag ID is required
- `Internal`: Database error

### GetPopularTags

Retrieves popular tags sorted by usage count.

**Parameters:**
- `limit` (int): Number of tags to return, default: 20

**Response:** `ListTagsResponse`

**Example:**
```go
resp, err := handler.GetPopularTags(ctx, 10)
// Returns top 10 most used tags
```

### ToggleTrending

Toggles the trending status of a tag (Admin only).

**Parameters:**
- `tagID` (string): Tag identifier
- `isTrending` (bool): New trending status

**Errors:**
- `InvalidArgument`: Tag ID is required
- `NotFound`: Tag not found

---

## Analytics API

Handler: `LibraryAnalyticsHandler`

### GetAnalyticsSummary

Retrieves overall analytics summary.

**Response:**
```go
type AnalyticsSummary struct {
    TotalDownloads int64
    TotalViews     int64
    AverageRating  float64
    ActiveUsers    int64   // Users active in last 30 days
    TrendingGrowth float64 // % growth (last 7 days vs previous 7 days)
    TotalItems     int64
    TotalExams     int64
    TotalBooks     int64
    TotalVideos    int64
}
```

**Calculations:**
- `TotalViews` = TotalDownloads × 3 (estimation)
- `ActiveUsers` = Distinct users who downloaded in last 30 days
- `TrendingGrowth` = ((CurrentWeek - PreviousWeek) / PreviousWeek) × 100

**Example:**
```go
summary, err := handler.GetAnalyticsSummary(ctx)
fmt.Printf("Total Downloads: %d\n", summary.TotalDownloads)
fmt.Printf("Active Users: %d\n", summary.ActiveUsers)
fmt.Printf("Trending Growth: %.2f%%\n", summary.TrendingGrowth)
```

### GetTopDownloaded

Retrieves most downloaded items.

**Parameters:**
- `limit` (int): Number of items to return, default: 10

**Response:**
```go
type TopItemStats struct {
    ItemID        string
    Title         string
    Type          string  // "exam", "book", "video"
    DownloadCount int64
    Rating        float64
    ReviewCount   int32
    Rank          int     // 1-based ranking
}
```

**Example:**
```go
topItems, err := handler.GetTopDownloaded(ctx, 10)
for _, item := range topItems {
    fmt.Printf("#%d: %s (%d downloads)\n", item.Rank, item.Title, item.DownloadCount)
}
```

### GetTopRated

Retrieves highest rated items (minimum 5 reviews).

**Parameters:**
- `limit` (int): Number of items to return, default: 10

**Response:** `[]*TopItemStats`

**Filtering:**
- Only items with `review_count >= 5`
- Sorted by `average_rating DESC, review_count DESC`

### GetRecentlyAdded

Retrieves recently added items.

**Parameters:**
- `limit` (int): Number of items to return, default: 10

**Response:** `[]*TopItemStats`

**Sorting:** By `created_at DESC`

### GetContentDistribution

Retrieves content type distribution.

**Response:**
```go
type ContentDistribution struct {
    Type       string  // "exam", "book", "video"
    Count      int64
    Percentage float64
}
```

**Example:**
```go
dist, err := handler.GetContentDistribution(ctx)
for _, d := range dist {
    fmt.Printf("%s: %d items (%.1f%%)\n", d.Type, d.Count, d.Percentage)
}
```

### GetDownloadTrends

Retrieves daily download trends.

**Parameters:**
- `days` (int): Number of days to analyze, default: 30

**Response:**
```go
map[string]int64 // date -> count
// Example: {"2025-01-15": 125, "2025-01-16": 132, ...}
```

### GetSubjectDistribution

Retrieves distribution by subject (exams only).

**Response:**
```go
map[string]int64 // subject -> count
// Example: {"Toán học": 45, "Vật lý": 32, ...}
```

---

## Search Suggestions API

Handler: `LibrarySearchSuggestionsHandler`

### GetSearchSuggestions

Retrieves search suggestions based on query.

**Parameters:**
- `query` (string): Search query (empty for trending)
- `limit` (int): Maximum suggestions to return, default: 10

**Response:**
```go
type SearchSuggestion struct {
    Text       string
    Type       string // "title", "subject", "tag", "trending"
    Count      int64  // Number of matches or usage count
    IsTrending bool
}
```

**Logic:**
- If query is empty: returns trending suggestions
- If query provided: searches titles, subjects, and tags
- Limit distribution: 1/3 for each source (title, subject, tag)

**Example:**
```go
// Autocomplete search
suggestions, err := handler.GetSearchSuggestions(ctx, "toán", 10)

// Trending suggestions
trending, err := handler.GetSearchSuggestions(ctx, "", 10)
```

### GetTrendingSuggestions

Retrieves trending suggestions (trending tags).

**Parameters:**
- `limit` (int): Number of suggestions, default: 10

**Response:** `[]*SearchSuggestion`

**Filtering:** Only tags with `is_trending = true`

### LogSearch

Logs a search query for trending analysis.

**Parameters:**
- `userID` (string): User performing search
- `query` (string): Search query

**Notes:**
- Query is normalized (lowercase, trimmed)
- Requires `search_history` table

### GetPopularSearches

Retrieves most popular recent searches.

**Parameters:**
- `limit` (int): Number of searches, default: 10

**Status:** Scaffolding (requires `search_history` table)

### GetRecentSearches

Retrieves user's recent searches.

**Parameters:**
- `userID` (string): User identifier
- `limit` (int): Number of searches, default: 10

**Status:** Scaffolding (requires `search_history` table)

---

## Audit Logging

Service: `AuditLogger`

### Actions

```go
const (
    ActionApprove       = "APPROVE"
    ActionReject        = "REJECT"
    ActionArchive       = "ARCHIVE"
    ActionDelete        = "DELETE"
    ActionCreate        = "CREATE"
    ActionUpdate        = "UPDATE"
    ActionUpload        = "UPLOAD"
    ActionDownload      = "DOWNLOAD"
    ActionRoleChange    = "ROLE_CHANGE"
    ActionPermission    = "PERMISSION_CHANGE"
    ActionConfigChange  = "CONFIG_CHANGE"
    ActionBulkOperation = "BULK_OPERATION"
)
```

### Entities

```go
const (
    EntityLibraryItem = "library_item"
    EntityExam        = "exam"
    EntityBook        = "book"
    EntityVideo       = "video"
    EntityTag         = "tag"
    EntityUser        = "user"
    EntitySystem      = "system"
)
```

### LogApproval

Logs an approval action.

```go
err := auditLogger.LogApproval(ctx, userID, itemID, "approved", "Quality content")
```

### LogRejection

Logs a rejection action.

```go
err := auditLogger.LogRejection(ctx, userID, itemID, "Low quality content")
```

### LogDeletion

Logs a deletion action.

```go
err := auditLogger.LogDeletion(ctx, userID, "library_item", itemID, "Duplicate content")
```

### LogUpload

Logs a file upload.

```go
err := auditLogger.LogUpload(ctx, userID, itemID, "exam.pdf", 5242880)
```

### LogBulkOperation

Logs a bulk operation.

```go
entityIDs := []string{"item1", "item2", "item3"}
err := auditLogger.LogBulkOperation(ctx, adminID, "bulk_approve", 3, entityIDs)
```

### Metadata Captured

- User ID, role, email
- IP address
- User agent
- Request ID
- Action timestamp
- Custom metadata (JSON)

---

## Upload Handler

Handler: `LibraryUploadHandler`

### HandleUpload

Processes a file upload.

**Request:**
```go
type UploadFileRequest struct {
    Filename    string
    ContentType string
    Size        int64
    Content     io.Reader
    ItemType    string // "exam", "book", "image"
    UserID      string
}
```

**Response:**
```go
type UploadFileResponse struct {
    FileID       string
    FileURL      string
    ThumbnailURL string
    UploadedAt   time.Time
}
```

**Validation:**
- PDF files: ≤ 50 MB
- Image files: ≤ 10 MB
- Allowed extensions: `.pdf`, `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`
- Filename sanitization (removes dangerous characters)

**Errors:**
- `Unavailable`: Google Drive service not initialized
- `InvalidArgument`: File size exceeds limit or invalid type
- `Internal`: Upload failed

**Example:**
```go
req := &UploadFileRequest{
    Filename:    "exam_math_12.pdf",
    ContentType: "application/pdf",
    Size:        5242880, // 5 MB
    Content:     fileReader,
    ItemType:    "exam",
    UserID:      "user-123",
}
resp, err := handler.HandleUpload(ctx, req)
```

### GetUploadLimits

Returns upload limits for file types.

**Response:**
```go
map[string]int64{
    "pdf":   50 * 1024 * 1024,  // 50 MB
    "image": 10 * 1024 * 1024,  // 10 MB
    "video": 500 * 1024 * 1024, // 500 MB
}
```

---

## Error Handling

All handlers use gRPC status codes:

- `OK`: Success
- `InvalidArgument`: Invalid input parameters
- `NotFound`: Resource not found
- `Unavailable`: Service unavailable (e.g., Google Drive)
- `Internal`: Internal server error
- `ResourceExhausted`: Rate limit exceeded

**Example Error Handling:**
```go
resp, err := handler.CreateTag(ctx, req)
if err != nil {
    st, ok := status.FromError(err)
    if ok {
        switch st.Code() {
        case codes.InvalidArgument:
            // Handle validation error
        case codes.Internal:
            // Handle server error
        }
    }
}
```

---

## Best Practices

1. **Context Usage**: Always pass context for cancellation and deadlines
2. **Error Handling**: Check and handle all error cases
3. **Logging**: Use structured logging with relevant fields
4. **Validation**: Validate input before processing
5. **Rate Limiting**: Apply rate limiting for download operations
6. **Audit Logging**: Log all sensitive operations
7. **Pagination**: Use pagination for list operations
8. **Caching**: Consider caching for frequently accessed data

---

## Database Requirements

### Required Tables:
- ✅ `tags`
- ✅ `library_items`
- ✅ `exam_metadata`, `book_metadata`, `video_metadata`
- ✅ `download_history`
- ⚠️ `audit_logs` (migration provided)
- ⚠️ `search_history` (migration provided)

### Migration Files:
- `021_create_audit_logs_table.sql`
- `022_create_search_history_table.sql`

---

## Integration Example

```go
// Initialize handlers
tagRepo := repository.NewTagRepository(db)
tagsHandler := grpc.NewLibraryTagsHandler(tagRepo, logger)

analyticsHandler := grpc.NewLibraryAnalyticsHandler(db, logger)

searchHandler := grpc.NewLibrarySearchSuggestionsHandler(db, logger)

auditLogger := audit.NewAuditLogger(db, logger)

// Use in gRPC service
func (s *LibraryService) CreateTag(ctx context.Context, req *pb.CreateTagRequest) (*pb.TagResponse, error) {
    createReq := &grpc.CreateTagRequest{
        Name:        req.Name,
        Description: req.Description,
        Color:       req.Color,
        IsTrending:  req.IsTrending,
    }
    
    resp, err := s.tagsHandler.CreateTag(ctx, createReq)
    if err != nil {
        return nil, err
    }
    
    // Log action
    s.auditLogger.LogAction(ctx, &audit.AuditLog{
        UserID:      util.GetUserIDFromContext(ctx),
        Action:      audit.ActionCreate,
        Entity:      audit.EntityTag,
        EntityID:    resp.ID,
        Description: "Tag created",
    })
    
    return convertToProtoTag(resp), nil
}
```

