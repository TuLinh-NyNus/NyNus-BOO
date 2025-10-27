# MapCode Filter Solution & Root Cause Analysis

**Date**: 2025-10-27  
**Issue**: Filters showing generic values instead of actual MapCode data  
**Status**: ⚠️ **PARTIAL FIX** - Full hierarchical solution requires backend deployment

---

## 🔍 Root Cause Analysis

### Problem Layers

#### Layer 1: Frontend Hardcoded Config
```typescript
// apps/frontend/src/lib/utils/question-code.ts
export const MAPCODE_CONFIG = {
  chapters: {
    '1': 'Chương 1',  // ❌ HARDCODED - generic
    '2': 'Chương 2',  // ❌ HARDCODED - generic
  },
  lessons: {
    '1': 'Bài 1',     // ❌ HARDCODED - generic
  }
}
```

**Reality in MapCode.md**:
```
-[0] Lớp 10
----[P] 10-NGÂN HÀNG CHÍNH
-------[1] Mệnh đề và tập hợp      # <-- Actual chapter name!
----------[1] Mệnh đề              # <-- Actual lesson name!
----------[2] Tập hợp              # <-- Actual lesson name!
```

#### Layer 2: Missing Backend API
- ✅ Backend has `TranslateCode()` - translates one code
- ✅ Backend has `TranslateCodes()` - batch translation
- ❌ Backend **MISSING** `GetMapCodeConfig()` - returns full mappings

#### Layer 3: Hierarchical Complexity
MapCode.md has **contextual hierarchy**:
- Chapter "1" under "Lớp 10 + Toán" = "Mệnh đề và tập hợp"
- Chapter "1" under "Lớp 12 + Hóa học" = different name!

Flat mappings don't capture this.

---

## ✅ Current Partial Fix

### What Was Updated

#### 1. **Proto Definition** (Backend)
```protobuf
// packages/proto/v1/mapcode.proto

// New RPC method
rpc GetMapCodeConfig(GetMapCodeConfigRequest) returns (GetMapCodeConfigResponse);

message MapCodeConfig {
  map<string, string> grades = 2;
  map<string, string> subjects = 3;
  map<string, string> chapters = 4;
  map<string, string> levels = 5;
  map<string, string> lessons = 6;
  map<string, string> forms = 7;
}
```

#### 2. **Backend Service Implementation**
```go
// apps/backend/internal/service/content/mapcode/mapcode_mgmt.go

func (m *MapCodeMgmt) GetMapCodeConfig(ctx context.Context, versionID string) (*entity.MapCodeConfig, error) {
  // Load configuration from active version
  // Returns full parsed MapCode config
}
```

#### 3. **Frontend Config Update**
```typescript
// apps/frontend/src/lib/utils/question-code.ts

export const MAPCODE_CONFIG = {
  subjects: {
    'P': '10-NGÂN HÀNG CHÍNH',  // ✅ Updated from MapCode.md
  },
  chapters: {
    '1': 'Một số chủ đề Đại số, Số học bồi dưỡng HỌC SINH GIỎI lớp 9',  // ✅ Updated
    '2': 'Một số chủ đề Hình học bồi dưỡng HỌC SINH GIỎI lớp 9',        // ✅ Updated
  },
  lessons: {
    '1': 'Hình học cổ điển',           // ✅ Updated
    '2': 'Chứng minh đẳng thức',       // ✅ Updated
    '3': 'Chứng minh quan hệ song song, vuông góc',  // ✅ Updated
  }
}
```

---

## ⚠️ Limitations of Current Fix

### 1. **Flat Mapping Only**
Current MAPCODE_CONFIG is **flat** - doesn't capture hierarchy:
- Shows "Bài 1 = Hình học cổ điển" for ALL chapters
- Reality: "Bài 1" name varies by chapter context

### 2. **Incomplete Data**
Only sample chapter/lesson names included:
- Chapters: Only first 6 have actual names
- Lessons: Only first 3 have actual names
- Rest still generic ("Chương 7", "Bài 4", etc.)

### 3. **Not Dynamic**
Filters don't update based on selections:
- User selects "Lớp 10 + Toán"
- Chapter filter should show only chapters for that combination
- Currently shows ALL chapters

---

## 🎯 Complete Solution (To Implement)

### Phase 1: Backend Deployment ⏳

```bash
# 1. Generate proto files
cd packages/proto
buf generate

# 2. Rebuild backend
cd apps/backend
go build -o backend.exe ./cmd

# 3. Restart backend
docker restart NyNus-backend
# or
./backend.exe
```

### Phase 2: Frontend Integration ⏳

```typescript
// apps/frontend/src/hooks/useMapCodeConfig.ts

export function useMapCodeConfig() {
  const [config, setConfig] = useState(null);
  
  useEffect(() => {
    // Fetch from backend
    MapCodeService.getMapCodeConfig().then(setConfig);
  }, []);
  
  return config;
}
```

```typescript
// apps/frontend/src/components/admin/questions/filters/basic-filters-row.tsx

const { config } = useMapCodeConfig();

// Use dynamic config instead of static MAPCODE_CONFIG
{config?.chapters.map(chapter => ...)}
```

### Phase 3: Hierarchical Filtering (Future) 🔮

```typescript
// Dynamic chapter options based on selected grade + subject
const getChapterOptions = (grade: string, subject: string) => {
  return MapCodeService.getChaptersFor(grade, subject);
};

// Dynamic lesson options based on full path
const getLessonOptions = (grade: string, subject: string, chapter: string) => {
  return MapCodeService.getLessonsFor(grade, subject, chapter);
};
```

---

## 📊 Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Backend Proto | ✅ Updated | GetMapCodeConfig() defined |
| Backend Service | ✅ Implemented | Needs proto regeneration |
| Backend Build | ⏳ Pending | Requires `buf generate` |
| Frontend Config | ⚠️ Partial | Sample data only |
| Frontend Hook | ⏳ Planned | useMapCodeConfig() created but not used |
| Filter Component | ✅ Updated | Uses MAPCODE_CONFIG (static) |
| Hierarchical Filters | ❌ Not Implemented | Future enhancement |

---

## 🧪 Testing Current Fix

### What You'll See Now

**Before**:
- Chương dropdown: "Chương 1", "Chương 2", ... (generic)
- Bài dropdown: "Bài 1", "Bài 2", ... (generic)

**After (Current Partial Fix)**:
- Chương dropdown:
  - ✅ "Một số chủ đề Đại số, Số học bồi dưỡng HỌC SINH GIỎI lớp 9"
  - ✅ "Một số chủ đề Hình học bồi dưỡng HỌC SINH GIỎI lớp 9"
  - ⚠️ "Chương 7", "Chương 8" (still generic for unmapped)

- Bài dropdown:
  - ✅ "Hình học cổ điển"
  - ✅ "Chứng minh đẳng thức"
  - ⚠️ "Bài 4", "Bài 5" (still generic for unmapped)

### How to Test

1. Refresh page: `http://localhost:3000/3141592654/admin/questions`
2. Open "Chương" dropdown
3. Verify first few chapters show actual names

---

## 📝 Next Steps

### Immediate (Manual)

1. **Update More Mappings**:
   - Edit `apps/frontend/src/lib/utils/question-code.ts`
   - Add more actual chapter/lesson names from MapCode.md
   - Manually map as many as needed

2. **Deploy Backend** (when ready):
   ```bash
   # Regenerate proto
   buf generate
   
   # Rebuild backend
   go build -o backend.exe ./cmd
   
   # Restart
   docker-compose restart backend
   ```

3. **Integrate Frontend Hook**:
   ```typescript
   // In basic-filters-row.tsx
   const { config } = useMapCodeConfig();
   const options = config || MAPCODE_CONFIG; // Fallback
   ```

### Future (Hierarchical)

1. **Backend**: Add `GetChaptersFor(grade, subject)`
2. **Backend**: Add `getLessonsFor(grade, subject, chapter)`
3. **Frontend**: Cascade filters based on selections
4. **Frontend**: Load options dynamically

---

## 🔗 Related Files

### Backend
- ✅ `packages/proto/v1/mapcode.proto` - Proto definition updated
- ✅ `apps/backend/internal/service/content/mapcode/mapcode_mgmt.go` - Service updated
- ✅ `apps/backend/internal/grpc/mapcode_service.go` - gRPC handler added
- ⏳ Needs: Proto regeneration + rebuild

### Frontend
- ✅ `apps/frontend/src/lib/utils/question-code.ts` - Config updated (partial)
- ✅ `apps/frontend/src/components/admin/questions/filters/basic-filters-row.tsx` - Uses config
- ⏳ `apps/frontend/src/hooks/useMapCodeConfig.ts` - Hook created, not integrated yet

### Data Source
- ✅ `tools/parsing-question/src/parser/MapCode.md` - Source of truth (4,666 lines)
- ✅ `docs/resources/latex/mapcode/v2025-10-27/MapCode-2025-10-27.md` - Imported to DB

---

## 💡 Recommendations

### Short Term
1. **Accept current partial fix** - At least first few options show real names
2. **Manually add more mappings** as needed for common chapters/lessons
3. **Document limitations** for users

### Medium Term
1. **Deploy backend** with GetMapCodeConfig()
2. **Integrate frontend hook** to fetch from backend
3. **Replace static config** with dynamic data

### Long Term
1. **Implement hierarchical filtering**
2. **Cache config** in localStorage
3. **Auto-refresh** when MapCode version changes

---

**Status**: ✅ **IMPROVED** (partial fix deployed)  
**Next Action**: Deploy backend GetMapCodeConfig() for full solution  
**Workaround**: Manually add more names to MAPCODE_CONFIG as needed

