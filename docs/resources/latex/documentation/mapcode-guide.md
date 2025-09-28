# MapCode Management Guide
**Version**: 1.0.0  
**Created**: 22/09/2025  
**For**: NyNus Question System

## Tổng quan

MapCode Management System quản lý việc mapping giữa question codes và ý nghĩa của chúng. Hệ thống hỗ trợ version control và translation cho các mã câu hỏi.

## Cấu trúc MapCode

### ID5 Format: `[XXXXX]`
- **Position 1**: Grade (Lớp) - 0,1,2,A,B,C
- **Position 2**: Subject (Môn) - P,L,H,S,V,A,U,D,G
- **Position 3**: Chapter (Chương) - 1,2,3,4,5,6,7,8,9
- **Position 4**: Level (Mức độ) - N,H,V,C,T,M
- **Position 5**: Lesson (Bài) - 1,2,3,4,5,6,7,8,9,A,B,C

**Ví dụ**: `0P1N1` → "Lớp 10 - Toán học - Chương 1 - Nhận biết - Bài 1"

### ID6 Format: `[XXXXX-X]`
- **Positions 1-5**: Giống ID5
- **Position 6**: Form (Dạng) - 1,2,3,4,5

**Ví dụ**: `2H5V3-2` → "Lớp 12 - Hóa học - Chương 5 - Vận dụng - Bài 3 - Dạng 2"

## Version Management

### Folder Structure
```
docs/resources/latex/mapcode/
├── current/
│   └── active-mapcode.md     # Active version
├── v2025-09-22/
│   ├── MapCode-2025-09-22.md
│   └── changelog.md
└── v2025-08-15/
    ├── MapCode-2025-08-15.md
    └── changelog.md
```

### Version Limits
- **Maximum versions**: 20
- **Storage warning**: Khi đạt 18 versions
- **Auto-cleanup**: Admin có thể xóa versions cũ

### Active Version Selection
- Admin chọn version nào làm system-wide default
- Symlink `current/active-mapcode.md` trỏ đến active version
- Tất cả translation sử dụng active version

## API Usage

### Backend Service
```go
// Get translation for question code
translation, err := mapCodeService.TranslateCode("0P1N1")
// Result: "Lớp 10 - Toán học - Chương 1 - Nhận biết - Bài 1"

// Get all versions
versions, err := mapCodeService.GetVersions()

// Set active version
err := mapCodeService.SetActiveVersion("v2025-09-22")
```

### Frontend Usage
```typescript
// Get translation
const translation = await MapCodeService.translateCode("0P1N1");

// Get version info
const versions = await MapCodeService.getVersions();
const activeVersion = await MapCodeService.getActiveVersion();
```

## Admin Management

### Version Creation
1. Tạo folder mới: `v{YYYY-MM-DD}/`
2. Copy từ active version hoặc tạo mới
3. Chỉnh sửa mapping
4. Tạo changelog.md
5. Set làm active version (optional)

### Version Switching
1. Vào Admin → MapCode Management
2. Chọn version từ dropdown
3. Click "Set as Active"
4. Confirm changes

### Storage Management
- Monitor storage usage
- Warning khi đạt 18/20 versions
- Bulk delete old versions
- Export/Import versions

## Best Practices

### Naming Convention
- Version folders: `v{YYYY-MM-DD}`
- MapCode files: `MapCode-{YYYY-MM-DD}.md`
- Changelog files: `changelog.md`

### Change Management
1. **Never modify active version directly**
2. **Always create new version for changes**
3. **Document changes in changelog**
4. **Test thoroughly before activation**
5. **Keep backup of previous active version**

### Performance
- MapCode translations được cache
- Cache invalidation khi switch version
- Batch translation cho multiple codes
- Lazy loading cho admin interface

## Troubleshooting

### Common Issues
1. **Translation not found**: Check active version có mapping không
2. **Version switch failed**: Verify file permissions và format
3. **Cache issues**: Clear cache sau khi switch version
4. **Storage full**: Delete old versions hoặc increase limit

### Error Codes
- `MAPCODE_001`: Version not found
- `MAPCODE_002`: Invalid format
- `MAPCODE_003`: Storage limit exceeded
- `MAPCODE_004`: Translation not found
