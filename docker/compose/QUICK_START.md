# 🚀 Docker Quick Start - NyNus Exam Bank System

## ⚡ 3 Bước để khởi động

### 1. Tạo file `.env`

```bash
cd docker/compose
cp .env.example .env
```

**Hoặc tạo nhanh:**
```bash
cat > docker/compose/.env << 'EOF'
# Environment
APP_ENV=development

# Database
POSTGRES_DB=exam_bank_db
POSTGRES_USER=exam_bank_user
POSTGRES_PASSWORD=exam_bank_password

# Backend
JWT_SECRET=your-secret-key-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Frontend
NEXTAUTH_SECRET=your-nextauth-secret-change-in-production
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_GRPC_URL=http://localhost:8080
NEXTAUTH_URL=http://localhost:3000
EOF
```

### 2. Khởi động services

```bash
cd docker/compose
docker-compose up -d
```

### 3. Kiểm tra services

```bash
docker-compose ps
```

**Mong đợi thấy:**
```
NAME                    STATUS              PORTS
exam_bank_postgres      Up (healthy)        0.0.0.0:5432->5432/tcp
exam_bank_backend       Up                  0.0.0.0:8080->8080/tcp, 0.0.0.0:50051->50051/tcp
exam_bank_frontend      Up (healthy)        0.0.0.0:3000->3000/tcp
```

---

## 🌐 Truy cập ứng dụng

- **Frontend:** http://localhost:3000
- **Backend HTTP:** http://localhost:8080
- **Backend gRPC:** http://localhost:50051
- **Database:** localhost:5432

---

## 🔥 Test Hot-Reload

1. Mở browser: http://localhost:3000
2. Sửa file: `apps/frontend/src/app/page.tsx`
3. Save file
4. Browser tự động refresh trong 1-2 giây ✨

---

## 📋 Các lệnh thường dùng

```bash
# Xem logs
docker-compose logs -f frontend

# Restart service
docker-compose restart frontend

# Rebuild service
docker-compose up -d --build frontend

# Dừng tất cả
docker-compose down

# Dừng và xóa data
docker-compose down -v
```

---

## 🛠️ Troubleshooting nhanh

### Hot-reload không hoạt động?
```bash
docker-compose restart frontend
docker-compose logs -f frontend
```

### Database connection failed?
```bash
docker-compose ps postgres
docker-compose logs postgres
```

### Port conflict?
```bash
# Sửa port trong .env
FRONTEND_PORT=3001
BACKEND_HTTP_PORT=8081
```

---

## 📚 Tài liệu chi tiết

Xem [DEVELOPMENT_GUIDE.md](../DEVELOPMENT_GUIDE.md) để biết thêm chi tiết về:
- Hot-reload configuration
- Troubleshooting chi tiết
- Advanced commands
- Performance metrics

---

**Version:** 1.0.0  
**Last Updated:** 2025-01-19

