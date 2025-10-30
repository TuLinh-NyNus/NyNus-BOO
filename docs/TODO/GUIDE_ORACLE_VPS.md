# 🚀 Hướng Dẫn Triển Khai Database trên Oracle Cloud Free Tier với Docker

**Dành cho:** Exam Bank System  
**Mục tiêu:** Triển khai PostgreSQL trên VPS Oracle Cloud miễn phí, kết nối Backend + Frontend  
**Thời gian:** ~30-45 phút  
**Độ khó:** Intermediate

---

## 📋 Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Oracle Cloud Free Tier Setup](#oracle-cloud-free-tier-setup)
3. [Cài Đặt Docker trên VPS](#cài-đặt-docker-trên-vps)
4. [Triển Khai PostgreSQL + Backend trong Docker](#triển-khai-postgresql--backend-trong-docker)
5. [Cấu Hình Frontend để Kết Nối](#cấu-hình-frontend-để-kết-nối)
6. [Kiểm Thử Kết Nối](#kiểm-thử-kết-nối)
7. [Sao Lưu & Phục Hồi Dữ Liệu](#sao-lưu--phục-hồi-dữ-liệu)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Tổng Quan

### Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────┐
│         Oracle Cloud Free Tier VPS              │
├─────────────────────────────────────────────────┤
│  Public IP: xxx.xxx.xxx.xxx                     │
│                                                 │
│  ┌──────────────────────────────────────────┐   │
│  │         Docker Network                   │   │
│  │  (exam_bank_network)                     │   │
│  │                                          │   │
│  │  ┌─────────────────┐   ┌──────────────┐ │   │
│  │  │  PostgreSQL     │   │   Backend    │ │   │
│  │  │  :5432          │   │   :50051     │ │   │
│  │  │  Container      │   │   :8080      │ │   │
│  │  └─────────────────┘   └──────────────┘ │   │
│  │         ↑                     ↑          │   │
│  │    Internal Network (bridge)             │   │
│  └──────────────────────────────────────────┘   │
│         ↑                    ↑                   │
└─────────────────────────────────────────────────┘
         │                    │
         │ Public IP:5432     │ Public IP:8080
         │                    │
    ┌────┴─────────────┐  ┌───┴──────────────┐
    │   Local Dev      │  │   Local Dev      │
    │   (psql/DBeaver) │  │   (Frontend)     │
    └──────────────────┘  └──────────────────┘
```

### Free Tier Specs

| Thành Phần | Chi Tiết |
|-----------|---------|
| **Máy chủ** | VM.Standard.A1.Flex (ARM Ampere) |
| **CPU** | 4 OCPU |
| **RAM** | 24 GB |
| **Storage** | 200 GB |
| **Bandwidth** | Giới hạn (đủ cho dev) |
| **Chi phí** | **Miễn phí VĨNH VIỄN** |

---

## 🔧 Oracle Cloud Free Tier Setup

### Bước 1: Tạo Oracle Cloud Account

1. Truy cập [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/)
2. Nhấn **"Start for Free"**
3. Điền thông tin:
   - Email address
   - Tên của bạn
   - Quốc gia/Vùng
4. Chọn **Credit Card** để xác minh (sẽ charge $0)
5. Hoàn thành setup

**Lưu ý:** Sau khi setup, bạn sẽ có $300 credit cho 30 ngày đầu + miễn phí vĩnh viễn cho các dịch vụ Free Tier

---

### Bước 2: Tạo Virtual Machine (Compute Instance)

#### 2.1 Truy Cập Oracle Cloud Console

```
Oracle Cloud Console → Compute → Instances
```

#### 2.2 Tạo Instance Mới

**Click: "Create Instance"**

**Điền thông tin:**

```yaml
Name: exam-bank-database
Compartment: [Default - root]
Operating System: Ubuntu 22.04
Image: Ubuntu 22.04 LTS (Free tier eligible)
Shape: VM.Standard.A1.Flex (Free tier)
OCPU Count: 2 (để lại RAM chia sẻ)
RAM: 12 GB
```

**Networking:**

```yaml
VCN: Create new VCN
  - VCN Name: exam-bank-vcn
  - Subnet Name: exam-bank-public-subnet
Public IP: Assign public IPv4 address (✅ REQUIRED)
```

**SSH Keys:**

```
☑ Upload SSH Public Key (.pub file)
  - Nếu không có: Tạo key pair bằng PuTTYgen hoặc OpenSSL
```

**Click: "Create"**

⏳ Chờ ~2 phút instance được tạo

#### 2.3 Lấy Public IP Address

- Trong **Oracle Cloud Console → Instances**
- Tìm instance vừa tạo
- Copy **Public IPv4 Address** (ví dụ: `123.45.67.89`)

---

### Bước 3: Cấu Hình Security (Mở Cổng)

#### 3.1 Tạo Ingress Rule cho PostgreSQL

**Trong Oracle Cloud Console:**

```
Virtual Cloud Networks → [exam-bank-vcn] 
  → Security Lists → Default Security List for exam-bank-vcn
    → Add Ingress Rule
```

**Rule 1: PostgreSQL Port**

```
Stateless: ☐ (unchecked)
Source Type: CIDR
Source CIDR: 0.0.0.0/0
IP Protocol: TCP
Source Port Range: [leave empty]
Destination Port Range: 5432
```

**Rule 2: Backend gRPC Port**

```
Stateless: ☐ (unchecked)
Source Type: CIDR
Source CIDR: 0.0.0.0/0
IP Protocol: TCP
Source Port Range: [leave empty]
Destination Port Range: 50051
```

**Rule 3: Backend HTTP Gateway Port**

```
Stateless: ☐ (unchecked)
Source Type: CIDR
Source CIDR: 0.0.0.0/0
IP Protocol: TCP
Source Port Range: [leave empty]
Destination Port Range: 8080
```

**Rule 4: SSH (để truy cập VM)**

```
Stateless: ☐ (unchecked)
Source Type: CIDR
Source CIDR: 0.0.0.0/0  (hoặc IP của bạn để an toàn hơn)
IP Protocol: TCP
Source Port Range: [leave empty]
Destination Port Range: 22
```

#### 3.2 Cấu Hình Firewall của OS (Ubuntu)

Bạn sẽ cấu hình này ở bước sau khi SSH vào VM

---

## 🐳 Cài Đặt Docker trên VPS

### Bước 4: SSH vào VPS

**Trên Local Machine:**

```bash
# Sử dụng Private Key (PuTTY hoặc SSH client)
ssh -i /path/to/private/key.pem ubuntu@123.45.67.89

# Hoặc sử dụng PuTTY trên Windows
# Session → Host Name: ubuntu@123.45.67.89
# Connection → SSH → Auth → Private Key File: [select .ppk file]
```

**Kiểm thử kết nối:**

```bash
ubuntu@exam-bank-database:~$ whoami
ubuntu
```

### Bước 5: Cài Đặt Docker & Docker Compose

**5.1 Update System**

```bash
sudo apt update && sudo apt upgrade -y
```

**5.2 Cài Docker Official Repository**

```bash
# Add Docker repository
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Verify Docker
docker --version
# Output: Docker version 26.x.x, build xxxxxxx
```

**5.3 Cài Docker Compose (V2)**

```bash
sudo apt install -y docker-compose-plugin

# Verify
docker compose version
# Output: Docker Compose version vx.xx.x
```

**5.4 Cho phép Ubuntu user chạy Docker mà không cần sudo**

```bash
sudo usermod -aG docker ubuntu
newgrp docker

# Test
docker ps
# Output: CONTAINER ID   IMAGE   COMMAND   CREATED   STATUS   PORTS   NAMES
```

**5.5 Bật Docker Service tự động chạy khi reboot**

```bash
sudo systemctl enable docker
```

---

## 🗄️ Triển Khai PostgreSQL + Backend trong Docker

### Bước 6: Clone Exam Bank System Repository

```bash
# SSH vào VPS
ssh -i /path/to/private/key.pem ubuntu@123.45.67.89

# Clone repo
cd ~
git clone https://github.com/[YOUR-USERNAME]/exam-bank-system.git
cd exam-bank-system
```

### Bước 7: Tạo Environment File

**Tạo `.env` file cho Docker Compose:**

```bash
cat > .env << 'EOF'
# ======== DATABASE ========
DB_HOST=postgres
DB_PORT=5432
DB_NAME=exam_bank_db
DB_USER=exam_bank_user
DB_PASSWORD=your-secure-password-here-123
DB_SSLMODE=disable

# ======== BACKEND ========
GRPC_PORT=50051
HTTP_PORT=8080
ENV=production
JWT_SECRET=your-jwt-secret-key-here-change-this

# ======== REDIS ========
REDIS_PASSWORD=your-redis-password-here
REDIS_PORT=6379

# ======== POSTGRES CONTAINER ========
POSTGRES_CONTAINER_NAME=exam_bank_postgres
POSTGRES_DB=exam_bank_db
POSTGRES_USER=exam_bank_user
POSTGRES_PASSWORD=your-secure-password-here-123
POSTGRES_VOLUME=postgres_data
EOF
```

**⚠️ IMPORTANT: Thay đổi các password:**

```bash
# Generate secure password
openssl rand -base64 32

# Ví dụ output
# j7F9kL2mN5pQ8rT3uV1wX6yZ4aB9cD2eF5gH8iJ0kL
```

**Cập nhật `.env` file:**

```bash
nano .env  # hoặc vi .env

# Thay:
# DB_PASSWORD=your-secure-password-here-123
# Thành:
# DB_PASSWORD=j7F9kL2mN5pQ8rT3uV1wX6yZ4aB9cD2eF5gH8iJ0kL
```

### Bước 8: Cấu Hình Docker Compose cho Production

**Tạo/Update file `docker-compose.oracle.yml`:**

```bash
cat > docker-compose.oracle.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: ${POSTGRES_CONTAINER_NAME}
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/init/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - exam_bank_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 2G

  backend:
    build:
      context: .
      dockerfile: docker/build/backend.prod.Dockerfile
    container_name: exam_bank_backend
    restart: unless-stopped
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=${POSTGRES_DB}
      - DB_USER=${POSTGRES_USER}
      - DB_PASSWORD=${POSTGRES_PASSWORD}
      - DB_SSLMODE=disable
      - GRPC_PORT=50051
      - HTTP_PORT=8080
      - ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - LOG_LEVEL=info
    ports:
      - "50051:50051"
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - exam_bank_network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G

networks:
  exam_bank_network:
    driver: bridge

volumes:
  postgres_data:
    driver: local
EOF
```

### Bước 9: Khởi động Docker Services

**Start PostgreSQL + Backend:**

```bash
# Từ ~/exam-bank-system
docker compose -f docker-compose.oracle.yml up -d

# Kiểm tra logs
docker compose -f docker-compose.oracle.yml logs -f

# Kiểm tra containers
docker ps
```

**Output mong đợi:**

```
CONTAINER ID   IMAGE                    STATUS              PORTS
xxx...         postgres:15-alpine       Up (healthy)        5432/tcp
yyy...         backend:latest           Up (healthy)        50051/tcp, 8080/tcp
```

**Kiểm tra PostgreSQL sẵn sàng:**

```bash
docker exec exam_bank_postgres pg_isready -U exam_bank_user
# Output: accepting connections
```

**Kiểm tra Backend logs:**

```bash
docker logs exam_bank_backend

# Tìm dòng như:
# [OK] Connected to PostgreSQL: exam_bank_user@postgres:5432/exam_bank_db
```

---

## 🔗 Cấu Hình Frontend để Kết Nối

### Bước 10: Cập Nhật Frontend Environment Variables

**Ở máy local của bạn (không phải VPS):**

**File: `apps/frontend/.env.local`**

```bash
# ======== NextAuth ========
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# ======== BACKEND API URLs ========
# Thay VPS_PUBLIC_IP bằng IP thực (ví dụ: 123.45.67.89)
NEXT_PUBLIC_API_URL=http://123.45.67.89:8080
NEXT_PUBLIC_GRPC_URL=http://123.45.67.89:8080
NEXT_PUBLIC_GRPC_WEB_URL=http://123.45.67.89:8080
NEXT_PUBLIC_USE_GRPC_PROXY=true

# ======== Database (for local Prisma) ========
DATABASE_URL=postgresql://exam_bank_user:your-secure-password-here-123@123.45.67.89:5432/exam_bank_db

# ======== Other Settings ========
NODE_ENV=development
NEXT_PUBLIC_ENABLE_DEBUG=false
```

### Bước 11: Cập Nhật Backend gRPC Client Configuration

**File: `apps/frontend/src/lib/config/endpoints.ts`**

```typescript
/**
 * Update gRPC URL configuration
 * 
 * Thay:
 * export const API_ENDPOINTS = {
 *   GRPC_URL: process.env.NEXT_PUBLIC_GRPC_URL || 'http://localhost:8080',
 * };
 * 
 * Thành (nếu cần hardcode):
 * export const API_ENDPOINTS = {
 *   GRPC_URL: 'http://123.45.67.89:8080',  // VPS Public IP
 * };
 */
```

### Bước 12: Backend Configuration ở VPS

**Backend tự động load environment variables từ `.env`**

File: `apps/backend/internal/config/config.go`

```go
// Các variables này được load tự động:
// - DB_HOST=postgres (Docker container name)
// - DB_PORT=5432
// - DB_NAME=exam_bank_db
// - DB_USER=exam_bank_user
// - DB_PASSWORD=***
// - GRPC_PORT=50051
// - HTTP_PORT=8080
```

Không cần thay đổi code, chỉ cần `.env` file đúng

---

## ✅ Kiểm Thử Kết Nối

### Bước 13: Test PostgreSQL Connection

**Từ Local Machine:**

```bash
# Sử dụng psql
psql -h 123.45.67.89 -U exam_bank_user -d exam_bank_db

# Hoặc sử dụng DBeaver (GUI)
# New Connection → PostgreSQL
# Host: 123.45.67.89
# Port: 5432
# Username: exam_bank_user
# Password: [your-password]
# Database: exam_bank_db
```

**Nếu kết nối thành công:**

```sql
postgres=# \c exam_bank_db
exam_bank_db=# SELECT * FROM users LIMIT 1;
```

### Bước 14: Test Backend gRPC Connection

**Health Check:**

```bash
curl -i http://123.45.67.89:8080/health

# Output:
# HTTP/1.1 200 OK
# Content-Type: application/json
# 
# {"status":"ok"}
```

**Test gRPC Connection (từ Frontend):**

```bash
# Chạy Frontend local development
cd apps/frontend
pnpm install
pnpm dev

# Mở http://localhost:3000
# Thử đăng nhập
# Kiểm tra Network tab → tìm grpc calls
```

### Bước 15: Test End-to-End

**Trên Frontend:**

1. Mở http://localhost:3000
2. Thử đăng nhập với test account
3. Kiểm tra browser console (F12) → Network tab
4. Tìm requests tới `123.45.67.89:8080` hoặc `/api/grpc`

**Nếu thành công:**

- ✅ Login page loads
- ✅ Dashboard hiển thị
- ✅ Không có console errors
- ✅ Dữ liệu được fetch từ backend

---

## 💾 Sao Lưu & Phục Hồi Dữ Liệu

### Bước 16: Backup Database

**SSH vào VPS:**

```bash
ssh -i /path/to/key.pem ubuntu@123.45.67.89

# Backup toàn bộ database
docker exec exam_bank_postgres pg_dump -U exam_bank_user exam_bank_db > backup_$(date +%Y-%m-%d-%H%M%S).sql

# Backup compressed
docker exec exam_bank_postgres pg_dump -U exam_bank_user exam_bank_db | gzip > backup_$(date +%Y-%m-%d).sql.gz
```

**Download backup về local:**

```bash
# Từ Local Machine
scp -i /path/to/key.pem ubuntu@123.45.67.89:~/backup_*.sql ~/backups/
```

### Bước 17: Restore Database

**Upload backup file:**

```bash
# Từ Local Machine
scp -i /path/to/key.pem ~/backups/backup_2025-01-20.sql ubuntu@123.45.67.89:~/
```

**Restore:**

```bash
# SSH vào VPS
ssh -i /path/to/key.pem ubuntu@123.45.67.89

# Restore
cat backup_2025-01-20.sql | docker exec -i exam_bank_postgres psql -U exam_bank_user -d exam_bank_db
```

### Bước 18: Automated Backup (Cron Job)

**SSH vào VPS:**

```bash
# Tạo backup script
cat > ~/backup-db.sh << 'EOF'
#!/bin/bash

BACKUP_DIR=~/db-backups
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker exec exam_bank_postgres pg_dump -U exam_bank_user exam_bank_db | \
  gzip > $BACKUP_DIR/backup_$(date +\%Y-\%m-\%d-\%H\%M\%S).sql.gz

# Xóa backups cũ hơn 30 ngày
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed at $(date)" >> ~/backup-db.log
EOF

chmod +x ~/backup-db.sh

# Chạy mỗi ngày lúc 2 sáng
crontab -e

# Thêm dòng:
# 0 2 * * * /home/ubuntu/backup-db.sh
```

---

## 🔍 Troubleshooting

### Problem 1: Can't connect to database

**Error:**

```
Error: connect ECONNREFUSED 123.45.67.89:5432
```

**Solutions:**

```bash
# 1. Kiểm tra container running
docker ps | grep postgres

# 2. Kiểm tra logs
docker logs exam_bank_postgres

# 3. Kiểm tra port mapping
docker port exam_bank_postgres

# 4. Kiểm tra firewall rules (VPS)
sudo ufw status
```

### Problem 2: Backend can't connect to database

**Error:**

```
failed to ping database: connection refused
```

**Solutions:**

```bash
# 1. Kiểm tra DB_HOST (phải là "postgres" trong container, không phải localhost)
docker exec exam_bank_backend env | grep DB_

# 2. Test connection từ backend container
docker exec exam_bank_backend psql -h postgres -U exam_bank_user -d exam_bank_db -c "SELECT 1"

# 3. Kiểm tra network connectivity
docker network ls
docker network inspect exam_bank_network
```

### Problem 3: Frontend can't reach backend

**Error:**

```
Error: Failed to fetch gRPC service
```

**Solutions:**

```bash
# 1. Test backend health check
curl -i http://123.45.67.89:8080/health

# 2. Kiểm tra firewall (VPS)
sudo ufw status
sudo ufw allow 8080/tcp
sudo ufw allow 50051/tcp

# 3. Kiểm tra CORS settings
# Backend phải có CORS enabled

# 4. Kiểm tra frontend env vars
# NEXT_PUBLIC_GRPC_URL phải point tới VPS IP
```

### Problem 4: SSL/Certificate Error

**Issue:** Browser warning about HTTPS

**Solution:** (Production - không cần cho dev)

```bash
# Cài Let's Encrypt SSL
sudo apt install certbot python3-certbot-nginx -y

# Tạo certificate
sudo certbot certonly --standalone -d your-domain.com

# Update Docker Compose để expose HTTPS
# Port: 443:8080 (HTTPS)
```

### Problem 5: VPS ran out of storage

**Check disk usage:**

```bash
df -h

# Xóa unused Docker images
docker image prune -a

# Xóa unused volumes
docker volume prune

# Xóa logs cũ
docker system prune
```

---

## 📝 Checklist Deployment

- [ ] Oracle Cloud account tạo thành công
- [ ] VM instance được tạo và có public IP
- [ ] SSH kết nối được tới VPS
- [ ] Docker installed và running
- [ ] `.env` file tạo với secure passwords
- [ ] PostgreSQL container running
- [ ] Backend container running (healthy)
- [ ] Database migrations chạy thành công
- [ ] Frontend `.env.local` cập nhật với VPS IP
- [ ] Test connection từ psql thành công
- [ ] Test gRPC health endpoint thành công
- [ ] Frontend login thành công
- [ ] Backup script setup

---

## 🎓 Tài Liệu Tham Khảo

### Official Documentation

- [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/)
- [PostgreSQL Official Docker Image](https://hub.docker.com/_/postgres)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

### Related Files in Exam Bank System

- `docker-compose.yml` - Base configuration
- `docker-compose.dev.yml` - Development overrides
- `docker-compose.prod.yml` - Production overrides
- `apps/backend/internal/config/config.go` - Backend configuration
- `apps/frontend/src/lib/config/endpoints.ts` - Frontend endpoints

### Useful Commands

```bash
# Docker commands
docker ps                                    # List running containers
docker logs -f [container-name]             # View logs in real-time
docker exec -it [container] bash            # SSH vào container
docker-compose -f [file] up -d              # Start services
docker-compose -f [file] down               # Stop services

# PostgreSQL commands
psql -h [host] -U [user] -d [database]     # Connect to DB
\dt                                         # List tables
\du                                         # List users
SELECT VERSION();                           # Check version
```

---

## 📞 Support

Nếu gặp vấn đề:

1. Kiểm tra logs: `docker logs [container-name]`
2. Kiểm tra connectivity: `curl -i http://[ip]:8080/health`
3. Kiểm tra firewall: `sudo ufw status`
4. Kiểm tra environment variables: `docker exec [container] env`

---

**Cập nhật lần cuối:** 2025-01-20  
**Version:** 1.0.0  
**Status:** ✅ Production Ready


