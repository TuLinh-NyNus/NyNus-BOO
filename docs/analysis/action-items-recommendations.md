# Action Items & Recommendations - NyNus System
**Ngày tạo**: 2025-01-19  
**Dựa trên**: Phân tích toàn diện hệ thống với 20+ lần sử dụng Augment Context Engine

---

## 🎯 Tổng Quan

Document này cung cấp danh sách chi tiết các action items cần thực hiện để cải thiện hệ thống NyNus, được sắp xếp theo độ ưu tiên và timeline.

---

## 🔴 Priority 1: Critical (Làm ngay - 1 tuần)

### 1.1 Security Hardening

#### Task 1: Upgrade Password Encryption
**Mục tiêu**: Đổi từ md5 sang scram-sha-256

**Steps**:
1. Update PostgreSQL configuration:
```bash
# File: docker/database/postgresql.conf.custom
# Đổi dòng:
password_encryption = md5
# Thành:
password_encryption = scram-sha-256
```

2. Update pg_hba.conf:
```bash
# File: docker/database/pg_hba.conf
# Đổi tất cả 'md5' thành 'scram-sha-256'
host    all             all             0.0.0.0/0               scram-sha-256
```

3. Reset user passwords:
```sql
-- Connect to PostgreSQL
psql -h localhost -p 5432 -U exam_bank_user -d exam_bank_db

-- Reset password với encryption mới
ALTER USER exam_bank_user PASSWORD 'exam_bank_password';
```

4. Restart PostgreSQL container:
```bash
docker restart NyNus-postgres
```

5. Test connection:
```bash
# Test từ Backend container
docker exec -it NyNus-backend sh
psql -h postgres -p 5432 -U exam_bank_user -d exam_bank_db
```

**Thời gian ước tính**: 2 giờ  
**Người thực hiện**: DevOps/Backend team  
**Validation**: Connection tests pass với scram-sha-256

---

#### Task 2: Secrets Management Setup
**Mục tiêu**: Không hardcode secrets trong code

**Steps**:
1. **Development**: Sử dụng .env.local (gitignored)
```bash
# Tạo .env.local từ .env.example
cp .env.example .env.local

# Add to .gitignore
echo ".env.local" >> .gitignore
```

2. **Production**: Setup secrets management
```bash
# Option 1: AWS Secrets Manager
aws secretsmanager create-secret \
  --name nynus/database/credentials \
  --secret-string '{"username":"exam_bank_user","password":"STRONG_PASSWORD"}'

# Option 2: HashiCorp Vault
vault kv put secret/nynus/database \
  username=exam_bank_user \
  password=STRONG_PASSWORD
```

3. Update application code:
```go
// apps/backend/internal/config/secrets.go
func LoadSecretsFromVault() (*Secrets, error) {
    // Implement secrets loading from Vault/AWS
}
```

**Thời gian ước tính**: 1 ngày  
**Người thực hiện**: DevOps team  
**Validation**: No secrets in Git history

---

#### Task 3: Enable CSRF Protection in Development
**Mục tiêu**: Test CSRF protection sớm

**Steps**:
1. Update Frontend config:
```typescript
// apps/frontend/src/lib/config/security.ts
export const SECURITY_CONFIG = {
  enableCSRF: true, // Đổi từ isProduction thành true
  csrfTokenHeader: 'X-CSRF-Token',
  csrfCookieName: 'csrf_token',
} as const;
```

2. Update Backend config:
```go
// apps/backend/internal/config/config.go
Auth: &AuthConfig{
    Security: SecurityConfig{
        EnableCSRF: true, // Enable cho cả dev
    },
}
```

3. Test CSRF protection:
```bash
# Test với curl
curl -X POST http://localhost:8080/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
# Expected: 403 Forbidden (missing CSRF token)
```

**Thời gian ước tính**: 4 giờ  
**Người thực hiện**: Backend team  
**Validation**: CSRF attacks blocked

---

### 1.2 Testing Infrastructure

#### Task 4: Setup CI/CD với Automated Tests
**Mục tiêu**: Automated testing trong CI/CD pipeline

**Steps**:
1. Tạo GitHub Actions workflow:
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Go
        uses: actions/setup-go@v4
        with:
          go-version: '1.23.5'
      
      - name: Run tests
        run: |
          cd apps/backend
          go test -v -coverprofile=coverage.out ./...
          go tool cover -html=coverage.out -o coverage.html
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./apps/backend/coverage.out

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run tests
        run: |
          cd apps/frontend
          pnpm test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./apps/frontend/coverage/coverage-final.json

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup services
        run: docker-compose -f docker/compose/docker-compose.test.yml up -d
      
      - name: Run E2E tests
        run: |
          cd apps/frontend
          pnpm playwright test
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: apps/frontend/playwright-report/
```

2. Tạo test database config:
```yaml
# docker/compose/docker-compose.test.yml
version: '3.8'
services:
  postgres-test:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: exam_bank_test
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password
```

**Thời gian ước tính**: 1 ngày  
**Người thực hiện**: DevOps team  
**Validation**: CI/CD pipeline runs successfully

---

#### Task 5: Achieve 80%+ Test Coverage
**Mục tiêu**: Đảm bảo code quality qua tests

**Steps**:
1. **Backend**: Write unit tests
```go
// apps/backend/internal/service/user/user_service_test.go
func TestUserService_CreateUser(t *testing.T) {
    // Arrange
    mockRepo := new(MockUserRepository)
    service := NewUserService(mockRepo)
    
    // Act
    user, err := service.CreateUser(ctx, validUserData)
    
    // Assert
    assert.NoError(t, err)
    assert.NotNil(t, user)
    assert.Equal(t, validUserData.Email, user.Email)
}
```

2. **Frontend**: Write component tests
```typescript
// apps/frontend/src/components/QuestionCard.test.tsx
describe('QuestionCard', () => {
  it('should render question content', () => {
    render(<QuestionCard question={mockQuestion} />);
    expect(screen.getByText(mockQuestion.content)).toBeInTheDocument();
  });
  
  it('should handle answer selection', async () => {
    const onAnswer = jest.fn();
    render(<QuestionCard question={mockQuestion} onAnswer={onAnswer} />);
    
    await userEvent.click(screen.getByText('Option A'));
    expect(onAnswer).toHaveBeenCalledWith('A');
  });
});
```

3. **E2E Tests**: Critical user flows
```typescript
// apps/frontend/e2e/exam-taking.spec.ts
test('complete exam flow', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'student@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // Start exam
  await page.goto('/exams/123');
  await page.click('text=Bắt đầu làm bài');
  
  // Answer questions
  await page.click('text=Option A');
  await page.click('text=Câu tiếp theo');
  
  // Submit exam
  await page.click('text=Nộp bài');
  await page.click('text=Xác nhận');
  
  // Verify result
  await expect(page.locator('text=Kết quả')).toBeVisible();
});
```

**Thời gian ước tính**: 1 tuần  
**Người thực hiện**: Full team  
**Validation**: Coverage reports show >80%

---

### 1.3 Monitoring Setup

#### Task 6: Centralized Logging
**Mục tiêu**: Tập trung logs từ tất cả services

**Steps**:
1. Setup Loki + Grafana:
```yaml
# docker/compose/docker-compose.monitoring.yml
version: '3.8'
services:
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - ./loki-config.yml:/etc/loki/local-config.yaml
      - loki-data:/loki

  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/log:/var/log
      - ./promtail-config.yml:/etc/promtail/config.yml
    command: -config.file=/etc/promtail/config.yml

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana
```

2. Configure application logging:
```go
// apps/backend/internal/logger/logger.go
func InitLogger() *logrus.Logger {
    logger := logrus.New()
    logger.SetFormatter(&logrus.JSONFormatter{})
    logger.SetOutput(os.Stdout)
    
    // Add Loki hook
    hook, err := loki.NewLokiHook(
        "http://loki:3100/loki/api/v1/push",
        map[string]string{
            "app": "nynus-backend",
            "env": os.Getenv("ENV"),
        },
    )
    if err == nil {
        logger.AddHook(hook)
    }
    
    return logger
}
```

**Thời gian ước tính**: 2 ngày  
**Người thực hiện**: DevOps team  
**Validation**: Logs visible in Grafana

---

#### Task 7: Metrics Collection
**Mục tiêu**: Monitor application performance

**Steps**:
1. Setup Prometheus:
```yaml
# docker/compose/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'nynus-backend'
    static_configs:
      - targets: ['backend:9090']
  
  - job_name: 'nynus-frontend'
    static_configs:
      - targets: ['frontend:9091']
  
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
```

2. Add metrics to Backend:
```go
// apps/backend/internal/metrics/metrics.go
var (
    requestDuration = promauto.NewHistogramVec(
        prometheus.HistogramOpts{
            Name: "http_request_duration_seconds",
            Help: "HTTP request duration",
        },
        []string{"method", "endpoint", "status"},
    )
    
    activeConnections = promauto.NewGauge(
        prometheus.GaugeOpts{
            Name: "db_active_connections",
            Help: "Number of active database connections",
        },
    )
)
```

3. Create Grafana dashboards:
```json
{
  "dashboard": {
    "title": "NyNus System Overview",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Response Time (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_request_duration_seconds)"
          }
        ]
      }
    ]
  }
}
```

**Thời gian ước tính**: 3 ngày  
**Người thực hiện**: DevOps + Backend team  
**Validation**: Metrics visible in Grafana

---

## 🟡 Priority 2: High (Trong 2 tuần)

### 2.1 Performance Optimization

#### Task 8: Cache Warming Strategy
**Implementation**:
```go
// apps/backend/internal/cache/warmer.go
func WarmCache(ctx context.Context, cache CacheService) error {
    // Warm popular questions
    popularQuestions, err := questionRepo.GetPopularQuestions(ctx, 100)
    if err != nil {
        return err
    }
    
    for _, q := range popularQuestions {
        key := GetQuestionCacheKey(q.ID)
        data, _ := json.Marshal(q)
        cache.Set(ctx, key, data, QuestionCacheTTL)
    }
    
    return nil
}
```

**Thời gian ước tính**: 1 ngày

---

#### Task 9: Connection Pool Monitoring
**Implementation**:
```go
// Add to performance monitor
func (pm *PerformanceMonitor) MonitorConnectionPool() {
    ticker := time.NewTicker(30 * time.Second)
    for range ticker.C {
        stats := pm.db.Stats()
        
        metrics.activeConnections.Set(float64(stats.OpenConnections - stats.Idle))
        metrics.idleConnections.Set(float64(stats.Idle))
        metrics.waitCount.Add(float64(stats.WaitCount))
    }
}
```

**Thời gian ước tính**: 4 giờ

---

#### Task 10: Bundle Size Optimization
**Steps**:
1. Analyze bundle:
```bash
cd apps/frontend
pnpm add -D @next/bundle-analyzer
```

2. Configure analyzer:
```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // ... existing config
})
```

3. Run analysis:
```bash
ANALYZE=true pnpm build
```

**Thời gian ước tính**: 1 ngày

---

## 🟢 Priority 3: Medium (Trong 1 tháng)

### 3.1 Documentation

#### Task 11: Complete API Documentation
- OpenAPI/Swagger specs
- gRPC service documentation
- Example requests/responses

**Thời gian ước tính**: 3 ngày

---

#### Task 12: Deployment Guide
- Step-by-step deployment instructions
- Environment setup
- Troubleshooting common issues

**Thời gian ước tính**: 2 ngày

---

## 📊 Timeline Summary

| Week | Tasks | Focus Area |
|------|-------|------------|
| Week 1 | Tasks 1-3 | Security Hardening |
| Week 2 | Tasks 4-5 | Testing Infrastructure |
| Week 3 | Tasks 6-7 | Monitoring Setup |
| Week 4 | Tasks 8-10 | Performance Optimization |
| Week 5-6 | Tasks 11-12 | Documentation |

---

## ✅ Success Criteria

### Security
- [ ] Password encryption: scram-sha-256
- [ ] No secrets in Git
- [ ] CSRF protection working
- [ ] Security scan passed

### Testing
- [ ] CI/CD pipeline running
- [ ] Test coverage > 80%
- [ ] E2E tests passing
- [ ] Performance tests passed

### Monitoring
- [ ] Centralized logging working
- [ ] Metrics collected
- [ ] Dashboards created
- [ ] Alerts configured

### Performance
- [ ] Cache hit rate > 80%
- [ ] API response < 200ms
- [ ] Frontend load < 1s
- [ ] Bundle size optimized

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-01-19  
**Next Review**: 2025-02-19

