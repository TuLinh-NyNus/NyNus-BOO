# 🐳 Docker - NyNus Exam Bank System

> **Hướng dẫn đơn giản để khởi động toàn bộ hệ thống bằng Docker**

---

## ⚡ Khởi Động Nhanh (3 Bước)

### 1️⃣ Cài Đặt Docker Desktop

Download và cài đặt:
- **Windows/Mac**: [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Linux**: [Docker Engine](https://docs.docker.com/engine/install/)

Kiểm tra cài đặt:
```bash
docker --version
docker-compose --version
```

### 2️⃣ Khởi Động Services

```bash
# Từ thư mục gốc của project
cd docker/compose
docker-compose up -d
```

### 3️⃣ Truy Cập Ứng Dụng

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Backend gRPC**: http://localhost:50051
- **Database**: localhost:5432

✅ **Hoàn thành!** Hệ thống đã sẵn sàng.

---

## 📋 Services

| Service | Port | Mô Tả |
|---------|------|-------|
| **Frontend** | 3000 | Next.js 14 Web App |
| **Backend** | 8080, 50051 | Go gRPC API Server |
| **PostgreSQL** | 5432 | Database |
| **Redis** | 6379 | Cache (dev only) |
| **OpenSearch** | 9200 | Search Engine (dev only) |

---

## 🛠️ Quản Lý Services

### Các Lệnh Cơ Bản

```bash
# Khởi động
docker-compose up -d

# Dừng
docker-compose down

# Xem logs
docker-compose logs -f

# Xem trạng thái
docker-compose ps

# Rebuild service
docker-compose up -d --build [service-name]

# Dừng và xóa data
docker-compose down -v
```

### Logs Theo Service

```bash
# Frontend logs
docker-compose logs -f frontend

# Backend logs
docker-compose logs -f backend

# Database logs
docker-compose logs -f postgres
```

### Rebuild Services

```bash
# Rebuild tất cả
docker-compose up -d --build

# Rebuild chỉ frontend
docker-compose up -d --build frontend

# Rebuild chỉ backend
docker-compose up -d --build backend
```

---

## 🔥 Hot-Reload (Development)

**Frontend** tự động reload khi bạn sửa code:

1. Sửa file React/TypeScript trong `apps/frontend/`
2. Save file
3. Browser tự động refresh trong 1-2 giây ✨

**Backend** cần rebuild để apply changes:
```bash
docker-compose up -d --build backend
```

---

## 🗂️ Cấu Trúc Thư Mục

```
docker/
├── README.md              # ← Bạn đang ở đây
├── compose/               # Docker Compose configs
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   ├── docker-compose.prod.yml
│   └── QUICK_START.md
├── build/                 # Dockerfiles
│   ├── backend.dev.Dockerfile
│   ├── backend.prod.Dockerfile
│   ├── frontend.dev.Dockerfile
│   └── README.md
├── scripts/               # PowerShell scripts
│   ├── docker-dev.ps1
│   ├── docker-prod.ps1
│   └── README.md
├── init/                  # Database initialization
│   └── init.sql
├── opensearch/            # OpenSearch config
└── docs/                  # Advanced documentation
    ├── FAQ.md
    └── CI_CD_OPTIMIZATION.md
```

---

## 🐛 Troubleshooting

### Services không khởi động?

```bash
# Xem logs để tìm lỗi
docker-compose logs

# Kiểm tra Docker Desktop đã chạy chưa
docker info
```

### Port đã được sử dụng?

```bash
# Kiểm tra port
netstat -ano | findstr :3000
netstat -ano | findstr :8080

# Sửa port trong .env file hoặc docker-compose.yml
```

### Database connection failed?

```bash
# Kiểm tra database đã healthy
docker-compose ps postgres

# Xem logs database
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Frontend compile lỗi?

```bash
# Rebuild frontend với clean cache
docker-compose down
docker-compose up -d --build frontend
```

### Muốn reset toàn bộ?

```bash
# Xóa tất cả containers, volumes, và rebuild
docker-compose down -v
docker-compose up -d --build
```

---

## 📚 Tài Liệu Chi Tiết

### Cho Developers
- **[Quick Start](./compose/QUICK_START.md)** - 3 bước khởi động nhanh
- **[Compose Guide](./compose/README.md)** - Docker Compose chi tiết
- **[Dockerfile Guide](./build/README.md)** - Dockerfiles chi tiết
- **[Scripts Guide](./scripts/README.md)** - PowerShell scripts

### Cho DevOps
- **[FAQ](./docs/FAQ.md)** - Câu hỏi thường gặp
- **[CI/CD Optimization](./docs/CI_CD_OPTIMIZATION.md)** - Tối ưu build times
- **[Production Deploy](./compose/docker-compose.prod.yml)** - Production setup

---

## 🔒 Production Deployment

Để deploy production:

```bash
# 1. Set environment variables
export DB_PASSWORD="your-secure-password"
export JWT_SECRET="your-jwt-secret"
export NEXTAUTH_SECRET="your-nextauth-secret"

# 2. Start production services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 3. Monitor
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f
```

⚠️ **Lưu ý**: Đừng commit secrets vào git!

---

## 💡 Tips

- **Lần đầu khởi động**: Frontend build có thể mất 3-5 phút
- **Hot-reload**: Chỉ hoạt động cho frontend trong dev mode
- **Cleanup**: Chạy `docker system prune` định kỳ để dọn dẹp
- **Performance**: Docker Desktop nên có ít nhất 4GB RAM (khuyến nghị 8GB)

---

## 📞 Cần Giúp Đỡ?

1. **Lỗi phổ biến**: Xem [FAQ](./docs/FAQ.md)
2. **Chi tiết kỹ thuật**: Xem [Compose Guide](./compose/README.md)
3. **Vấn đề build**: Xem [Dockerfile Guide](./build/README.md)

---

**Last Updated**: 2025-01-29  
**Docker Version**: 24.0+  
**Docker Compose Version**: 2.0+
