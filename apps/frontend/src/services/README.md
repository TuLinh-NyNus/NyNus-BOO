# Backend Integration - Questions Service

## 🎯 Tổng quan

Frontend đã được tích hợp hoàn toàn với Backend API theo tài liệu thiết kế và swagger specification.

## 🔧 Cấu hình

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_USE_MOCK=false  # true để dùng mock data
```

### Feature Flag

- **`NEXT_PUBLIC_USE_MOCK=true`**: Sử dụng mock data (development)
- **`NEXT_PUBLIC_USE_MOCK=false`**: Sử dụng real backend API (production)

## 🔐 Authentication

- Backend yêu cầu JWT token cho tất cả endpoints questions
- Frontend tự động gắn `Authorization: Bearer {token}` header
- Token được lưu trong localStorage với key `'nynus-auth-token'`

## 📡 API Integration

### Endpoints Supported

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/questions/filter` | Lọc câu hỏi với filters |
| POST | `/api/v1/questions/search` | Tìm kiếm full-text |  
| POST | `/api/v1/questions/by-code` | Lấy câu hỏi theo QuestionCode |
| POST | `/api/v1/auth/login` | Đăng nhập và lấy JWT token |

### Data Format

- **Request/Response**: camelCase (theo swagger)
- **Mapping**: Automatic conversion giữa FE và BE formats
- **Error Handling**: Graceful fallback to mock với proper UX

## 🏗 Architecture

### Service Layer

```
PublicQuestionService (công khai)
├── shouldUseRealAPI() → Check auth + mock flag
├── Real API (QuestionsAPI) → Backend endpoints  
└── Mock API → Static test data
```

### Data Flow

1. **Client Request** → PublicQuestionService
2. **Auth Check** → JWT token exists?
3. **Route Decision** → Real API vs Mock
4. **Data Mapping** → Backend ↔ Frontend formats
5. **Error Handling** → Fallback + UX notifications

## 🛠 Development

### Testing Real API

```bash
# 1. Start backend server
cd apps/backend && go run cmd/main.go

# 2. Set environment
echo "NEXT_PUBLIC_USE_MOCK=false" >> .env.local

# 3. Login to get JWT token
# Use login form or API directly

# 4. Test questions endpoints
# Browse questions page should show real data
```

### Debugging

Development mode automatically logs:
```javascript
[PublicQuestionService] Config: {
  useMock: false,
  isAuthenticated: true, 
  shouldUseRealAPI: true,
  apiBaseUrl: 'http://localhost:8080'
}
```

### Error Scenarios

| Scenario | Behavior |
|----------|----------|
| No auth token | Falls back to mock + shows auth prompt |
| Network error | Falls back to mock + shows network error |
| 401/403 error | Falls back to mock + shows login prompt |
| API error | Falls back to mock + shows error message |

## 📦 Files Modified

### Core Integration
- `types/api/backend.ts` - Backend types (camelCase)
- `services/api/questions.api.ts` - API client calls
- `services/public/questions.service.ts` - Service orchestration

### Data Mapping  
- `mappers/question-filter.mapper.ts` - Filter FE→BE mapping
- `mappers/question.mapper.ts` - Question BE→FE mapping
- `constants/taxonomy.ts` - Subject/Grade/Level mapping

### HTTP Client
- `api/client.ts` - HTTP wrapper with auth headers
- `services/api/auth.api.ts` - Login API calls

## 🚀 Production Ready

- ✅ **Type Safety**: Full TypeScript coverage
- ✅ **Error Handling**: Graceful degradation  
- ✅ **Authentication**: JWT integration
- ✅ **Performance**: Efficient data mapping
- ✅ **Fallback**: Mock data when API unavailable
- ✅ **Logging**: Development debugging support

## 🔄 Rollback Plan

Nếu có vấn đề với real API:

```bash
# Quick rollback to mock mode
echo "NEXT_PUBLIC_USE_MOCK=true" >> .env.local
# Restart Next.js dev server
```
