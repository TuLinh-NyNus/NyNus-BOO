# 🐳 Docker Development Guide - NyNus Exam Bank System

## 📋 Tổng quan

Hướng dẫn sử dụng Docker để phát triển NyNus Exam Bank System với **hot-reload** cho Frontend.

### ✨ Tính năng chính

- ✅ **Hot-reload Frontend**: Code changes tự động cập nhật UI trong <2s
- ✅ **Prisma Database Connection**: Frontend kết nối PostgreSQL qua Prisma ORM
- ✅ **gRPC Communication**: Frontend ↔ Backend qua gRPC-Web
- ✅ **Development Tools**: Redis cache + OpenSearch (auto-loaded)
- ✅ **Resource Management**: CPU/Memory limits để tránh resource exhaustion

---

## 🚀 Quick Start

### 1. Khởi động tất cả services

```bash
cd docker/compose
docker-compose up -d
```

**Services sẽ được khởi động:**
- PostgreSQL (port 5432) - Database chính
- Backend (ports 8080, 50051) - Go gRPC server
- Frontend (port 3000) - Next.js với hot-reload
- Redis (port 6379) - Cache service (development only)
- OpenSearch (port 9200) - Search engine (development only)
- OpenSearch Dashboards (port 5601) - Search UI (development only)

### 2. Kiểm tra trạng thái services

```bash
docker-compose ps
```

**Output mong đợi:**
```
NAME                          STATUS              PORTS
exam_bank_postgres            Up (healthy)        0.0.0.0:5432->5432/tcp
exam_bank_backend             Up                  0.0.0.0:8080->8080/tcp, 0.0.0.0:50051->50051/tcp
exam_bank_frontend            Up (healthy)        0.0.0.0:3000->3000/tcp
exam_bank_redis               Up (healthy)        0.0.0.0:6379->6379/tcp
exam_bank_opensearch          Up (healthy)        0.0.0.0:9200->9200/tcp
```

### 3. Xem logs

```bash
# Tất cả services
docker-compose logs -f

# Chỉ frontend
docker-compose logs -f frontend

# Chỉ backend
docker-compose logs -f backend

# Chỉ database
docker-compose logs -f postgres
```

### 4. Dừng services

```bash
# Dừng nhưng giữ data
docker-compose down

# Dừng và xóa volumes (mất data)
docker-compose down -v
```

---

## 🔥 Hot-Reload Verification

### Test hot-reload hoạt động

1. **Khởi động services:**
   ```bash
   cd docker/compose
   docker-compose up -d
   ```

2. **Mở browser:** http://localhost:3000

3. **Sửa file React component:**
   ```bash
   # Ví dụ: Sửa apps/frontend/src/app/page.tsx
   # Thay đổi text hoặc thêm element mới
   ```

4. **Kiểm tra browser:**
   - Browser sẽ tự động refresh trong 1-2 giây
   - Không cần rebuild Docker image
   - Không cần restart container

### Logs khi hot-reload hoạt động

```bash
docker-compose logs -f frontend
```

**Output mong đợi:**
```
exam_bank_frontend | ⚡ Turbopack (webpack) compiled successfully
exam_bank_frontend | ○ Compiling /page ...
exam_bank_frontend | ✓ Compiled /page in 234ms
```

---

## 📦 Services Details

### Frontend (Next.js 14 + Turbopack)

**URL:** http://localhost:3000

**Features:**
- Hot Module Replacement (HMR) với Turbopack
- Volume mount: `apps/frontend:/app`
- Named volumes: `node_modules`, `.next` cache
- Environment variables: `WATCHPACK_POLLING=true`, `CHOKIDAR_USEPOLLING=true`

**Rebuild khi cần:**
```bash
# Khi thay đổi package.json hoặc dependencies
docker-compose up -d --build frontend
```

### Backend (Go + gRPC)

**URLs:**
- HTTP Gateway: http://localhost:8080
- gRPC Server: http://localhost:50051

**Health Check:**
```bash
curl http://localhost:8080/health
```

### PostgreSQL Database

**Connection String:**
```
postgresql://exam_bank_user:exam_bank_password@localhost:5432/exam_bank_db
```

**Connect từ host machine:**
```bash
psql -h localhost -p 5432 -U exam_bank_user -d exam_bank_db
```

**Connect từ frontend container:**
```bash
docker-compose exec frontend sh
# Inside container:
# DATABASE_URL is already set
```

### Prisma Studio (Database GUI)

```bash
# Run Prisma Studio từ frontend container
docker-compose exec frontend pnpm prisma:studio

# Hoặc từ host machine
cd apps/frontend
pnpm prisma:studio
```

**URL:** http://localhost:5555

---

## 🛠️ Troubleshooting

### 1. Hot-reload không hoạt động

**Triệu chứng:** Code changes không tự động cập nhật UI

**Giải pháp:**
```bash
# Restart frontend service
docker-compose restart frontend

# Kiểm tra volumes được mount đúng
docker-compose exec frontend ls -la /app

# Kiểm tra environment variables
docker-compose exec frontend env | grep WATCH
```

### 2. Database connection failed

**Triệu chứng:** Frontend không kết nối được database

**Giải pháp:**
```bash
# Kiểm tra database đã healthy
docker-compose ps postgres

# Kiểm tra DATABASE_URL environment variable
docker-compose exec frontend env | grep DATABASE_URL

# Test connection từ frontend container
docker-compose exec frontend sh -c "pnpm prisma db pull"
```

### 3. Permission issues với .next cache

**Triệu chứng:** `EACCES: permission denied` khi compile

**Giải pháp:**
```bash
# Fix ownership (Linux/WSL)
docker-compose exec frontend chown -R node:node /app/.next

# Hoặc xóa và rebuild
docker-compose down
docker volume rm nynus_frontend_next_cache
docker-compose up -d --build frontend
```

### 4. Port conflicts

**Triệu chứng:** `port is already allocated`

**Giải pháp:**
```bash
# Kiểm tra port đang được sử dụng
netstat -ano | findstr :3000
netstat -ano | findstr :8080
netstat -ano | findstr :5432

# Thay đổi port trong .env
# Ví dụ: FRONTEND_PORT=3001
```

### 5. Out of memory errors

**Triệu chứng:** Container bị kill hoặc restart liên tục

**Giải pháp:**
```bash
# Tăng Docker Desktop memory limit
# Settings → Resources → Memory → 8GB

# Hoặc giảm resource limits trong docker-compose.override.yml
# limits:
#   memory: 1G  # Giảm từ 2G xuống 1G
```

### 6. Slow compilation

**Triệu chứng:** Next.js compile mất >10 giây

**Giải pháp:**
```bash
# Clear Next.js cache
docker-compose exec frontend pnpm clean:cache

# Rebuild với clean cache
docker-compose down
docker volume rm nynus_frontend_next_cache
docker-compose up -d --build frontend
```

---

## 🔍 Advanced Commands

### Rebuild specific service

```bash
# Rebuild frontend only
docker-compose build frontend

# Rebuild với no cache
docker-compose build --no-cache frontend

# Rebuild và restart
docker-compose up -d --build frontend
```

### Execute commands trong container

```bash
# Shell vào frontend container
docker-compose exec frontend sh

# Run Prisma migrations
docker-compose exec frontend pnpm prisma:migrate

# Generate Prisma Client
docker-compose exec frontend pnpm prisma:generate

# Run tests
docker-compose exec frontend pnpm test
```

### Clean up

```bash
# Stop và remove containers
docker-compose down

# Remove containers + volumes
docker-compose down -v

# Remove containers + volumes + images
docker-compose down -v --rmi all

# Remove unused Docker resources
docker system prune -a --volumes
```

---

## 📊 Performance Metrics

### Expected Startup Times

| Service | Startup Time | Ready Time |
|---------|--------------|------------|
| PostgreSQL | ~5s | ~10s (healthy) |
| Backend | ~10s | ~15s |
| Frontend (first run) | ~60s | ~90s (compile) |
| Frontend (cached) | ~10s | ~20s |
| Redis | ~2s | ~5s |
| OpenSearch | ~30s | ~60s |

### Hot-Reload Performance

| Action | Time |
|--------|------|
| File change detection | <500ms |
| Turbopack recompile | 200-500ms |
| Browser refresh | <1s |
| **Total** | **<2s** |

---

## 🔐 Environment Variables

### Required Variables (in `.env`)

```env
# Database
POSTGRES_DB=exam_bank_db
POSTGRES_USER=exam_bank_user
POSTGRES_PASSWORD=exam_bank_password

# Backend
JWT_SECRET=your-secret-key-change-in-production

# Frontend
NEXTAUTH_SECRET=your-nextauth-secret-change-in-production
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_GRPC_URL=http://localhost:8080
```

### Auto-generated Variables

```env
# Prisma Database URL (auto-generated in docker-compose.yml)
DATABASE_URL=postgresql://exam_bank_user:exam_bank_password@postgres:5432/exam_bank_db?schema=public&sslmode=disable

# Hot-reload settings (auto-set in docker-compose.override.yml)
WATCHPACK_POLLING=true
CHOKIDAR_USEPOLLING=true
```

---

## 📚 Additional Resources

- **Docker Compose Documentation:** https://docs.docker.com/compose/
- **Next.js Docker Guide:** https://nextjs.org/docs/deployment#docker-image
- **Prisma Docker Guide:** https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker
- **Turbopack Documentation:** https://nextjs.org/docs/architecture/turbopack

---

**Version:** 1.0.0  
**Last Updated:** 2025-01-19  
**Status:** Production Ready - Hot-Reload Enabled

