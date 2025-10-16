# Backend-Only Docker Setup Guide
## NyNus Exam Bank System - Backend API + PostgreSQL in Docker

## 📋 Tổng quan

Setup này containerize **Backend API (Go gRPC)** và **PostgreSQL Database** trong Docker, trong khi **Frontend Web (Next.js)** chạy ở local.

### Kiến trúc

```
┌─────────────────────────────────────────────────────────────┐
│                    LOCAL MACHINE                             │
│                                                              │
│  ┌──────────────────┐         ┌─────────────────────────┐  │
│  │  Frontend (Local)│────────▶│  Docker Containers      │  │
│  │  Next.js:3000    │  gRPC   │                         │  │
│  │                  │  Web    │  ┌──────────────────┐   │  │
│  │  Admin Dashboard │◀────────│  │ Backend API      │   │  │
│  │  /3141592654/    │         │  │ Go gRPC:50051    │   │  │
│  │  admin           │         │  │ HTTP:8080        │   │  │
│  └──────────────────┘         │  └────────┬─────────┘   │  │
│                                │           │             │  │
│                                │  ┌────────▼─────────┐   │  │
│                                │  │ PostgreSQL:5433  │   │  │
│                                │  │ (mapped from     │   │  │
│                                │  │  5432 in         │   │  │
│                                │  │  container)      │   │  │
│                                │  └──────────────────┘   │  │
│                                └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Services

| Service | Location | Port | Description | Resource Limits |
|---------|----------|------|-------------|-----------------|
| **Frontend** | Local | 3000 | Next.js 14 web app + Admin Dashboard | N/A (local) |
| **Backend API** | Docker | 50051 (gRPC)<br>8080 (HTTP) | Go gRPC server with HTTP gateway<br>**Security**: Runs as non-root user `nynus` (UID 1001) | CPU: 0.5 cores<br>RAM: 256MB |
| **PostgreSQL** | Docker | 5433 (mapped) | Database (port 5432 in container) | CPU: 0.5 cores<br>RAM: 512MB |
| **Redis** | Disabled | - | Caching service (disabled in development) | N/A |
| **OpenSearch** | Disabled | - | Full-text search (disabled, uses PostgreSQL fallback) | N/A |

## 🚀 Quick Start

### 1. Khởi động Backend Services trong Docker

```bash
# Navigate to docker/compose directory
cd docker/compose

# Start PostgreSQL and Backend API
docker-compose -f docker-compose.backend-only.yml up -d

# Check services status
docker-compose -f docker-compose.backend-only.yml ps

# View logs
docker-compose -f docker-compose.backend-only.yml logs -f
```

### 2. Khởi động Frontend ở Local

```bash
# Navigate to workspace root
cd ../..

# Install dependencies (if not done)
pnpm install

# Start frontend development server
pnpm dev

# Or start frontend only
pnpm --filter @nynus/web dev
```

### 3. Truy cập ứng dụng

- **Frontend**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/3141592654/admin
- **Backend API (HTTP)**: http://localhost:8080
- **Backend gRPC**: localhost:50051
- **PostgreSQL**: localhost:5433

## 📦 Docker Commands

### Quản lý Services

```bash
# Start services
docker-compose -f docker-compose.backend-only.yml up -d

# Stop services
docker-compose -f docker-compose.backend-only.yml down

# Restart services
docker-compose -f docker-compose.backend-only.yml restart

# Stop and remove volumes (WARNING: deletes database data)
docker-compose -f docker-compose.backend-only.yml down -v
```

### Rebuild Services

```bash
# Rebuild backend after code changes
docker-compose -f docker-compose.backend-only.yml build backend

# Rebuild and restart
docker-compose -f docker-compose.backend-only.yml up -d --build backend
```

### View Logs

```bash
# All services
docker-compose -f docker-compose.backend-only.yml logs -f

# Backend only
docker-compose -f docker-compose.backend-only.yml logs -f backend

# PostgreSQL only
docker-compose -f docker-compose.backend-only.yml logs -f postgres
```

### Database Management

```bash
# Connect to PostgreSQL container
docker exec -it nynus_postgres psql -U exam_bank_user -d exam_bank_db

# Backup database
docker exec nynus_postgres pg_dump -U exam_bank_user exam_bank_db > backup.sql

# Restore database
docker exec -i nynus_postgres psql -U exam_bank_user exam_bank_db < backup.sql
```

## 🔧 Configuration

### Environment Variables

File `.env` trong `docker/compose/` chứa configuration cho Docker services:

```env
# Container Names
POSTGRES_CONTAINER_NAME=nynus_postgres
BACKEND_CONTAINER_NAME=nynus_backend

# Database Configuration
POSTGRES_DB=exam_bank_db
POSTGRES_USER=exam_bank_user
POSTGRES_PASSWORD=exam_bank_password
DB_PORT=5433  # Port 5432 is used by local PostgreSQL

# Backend Configuration
BACKEND_GRPC_PORT=50051
BACKEND_HTTP_PORT=8080
JWT_SECRET=nynus-secret-key-change-in-production
```

### Frontend Configuration

File `apps/frontend/.env.local` chứa configuration cho Frontend local:

```env
# Backend API URL (Docker container)
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_GRPC_URL=http://localhost:8080

# Database URL (PostgreSQL in Docker)
DATABASE_URL=postgresql://exam_bank_user:exam_bank_password@localhost:5433/exam_bank_db?schema=public&sslmode=disable

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
```

## 🐛 Troubleshooting

### Port Conflicts

**Problem**: Port 5432 already in use

**Solution**: 
- Docker PostgreSQL uses port 5433 (mapped from 5432)
- Local PostgreSQL uses port 5432
- Update `DB_PORT=5433` in `.env` if needed

### Backend Cannot Connect to Database

**Problem**: Backend shows database connection errors

**Solution**:
```bash
# Check PostgreSQL is healthy
docker-compose -f docker-compose.backend-only.yml ps

# Check PostgreSQL logs
docker-compose -f docker-compose.backend-only.yml logs postgres

# Restart services
docker-compose -f docker-compose.backend-only.yml restart
```

### Frontend Cannot Connect to Backend

**Problem**: Frontend shows gRPC connection errors

**Solution**:
1. Verify Backend is running: `curl http://localhost:8080/health`
2. Check `NEXT_PUBLIC_GRPC_URL=http://localhost:8080` in `apps/frontend/.env.local`
3. Restart Frontend: `pnpm dev`

### Database Migrations Not Running

**Problem**: Tables not created in database

**Solution**:
```bash
# Backend automatically runs migrations on startup
# Check backend logs for migration status
docker-compose -f docker-compose.backend-only.yml logs backend | grep migration

# If migrations failed, restart backend
docker-compose -f docker-compose.backend-only.yml restart backend
```

## 📊 Health Checks & Monitoring

### Backend Health Check

```bash
# HTTP Gateway health endpoint
curl http://localhost:8080/health

# Expected response: 200 OK
# {"status":"healthy","service":"exam-bank-backend","timestamp":"..."}
```

### PostgreSQL Health Check

```bash
# Check PostgreSQL is ready
docker exec nynus_postgres pg_isready -U exam_bank_user -d exam_bank_db

# Expected output: accepting connections
```

### Resource Usage Monitoring

```bash
# Check container resource usage
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

# Expected output (typical development usage):
# CONTAINER      CPU %     MEM USAGE / LIMIT     MEM %
# nynus_backend  0.00%     8-16MiB / 256MiB      3-6%
# nynus_postgres 4-5%      16-32MiB / 512MiB     3-6%
```

### Security Verification

```bash
# Verify Backend runs as non-root user
docker exec nynus_backend whoami
# Expected output: nynus

docker exec nynus_backend id
# Expected output: uid=1001(nynus) gid=1001(nynus) groups=1001(nynus)
```

### Frontend Health Check

```bash
# Check Frontend is running
curl http://localhost:3000

# Expected response: 200 OK (HTML page)
```

## 🔐 Security Notes

### Development Environment

- JWT secrets are development-only values
- Database password is weak (for development)
- CORS is enabled for local development

### Production Deployment

**DO NOT use this setup for production!**

For production:
1. Use `docker-compose.prod.yml` instead
2. Generate strong secrets: `openssl rand -base64 64`
3. Disable HTTP Gateway (`HTTP_GATEWAY_ENABLED=false`)
4. Enable SSL/TLS for database connections
5. Use environment secrets management (not .env files)

## 🔧 Optional Services Configuration

### Redis (Caching)

Redis is **disabled by default** in development. To enable:

1. Edit `docker/compose/.env`:
   ```env
   REDIS_ENABLED=true
   ```

2. Add Redis service to `docker-compose.backend-only.yml` or use full stack:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d
   ```

**Note**: Backend works perfectly without Redis. Caching is disabled when Redis is unavailable.

### OpenSearch (Full-Text Search)

OpenSearch is **disabled by default** in development. Backend uses PostgreSQL full-text search as fallback.

To enable OpenSearch:

1. Edit `docker/compose/.env`:
   ```env
   OPENSEARCH_ENABLED=true
   ```

2. Add OpenSearch service to docker-compose or use full stack:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d
   ```

**Note**: PostgreSQL full-text search works well for Vietnamese content. OpenSearch is optional for advanced search features.

## 🔒 Security Best Practices

### Non-Root User Implementation

Backend container runs as non-root user `nynus` (UID/GID 1001) for enhanced security:

- **Why**: Running as root inside containers is a security risk. If container is compromised, attacker has root privileges.
- **Implementation**: Alpine Linux `adduser`/`addgroup` commands create dedicated user
- **Verification**: `docker exec nynus_backend whoami` should return `nynus`

### Resource Limits

Resource limits prevent containers from consuming excessive system resources:

```yaml
# PostgreSQL limits
deploy:
  resources:
    limits:
      cpus: '0.5'        # Max 50% of one CPU core
      memory: 512M       # Max 512MB RAM
    reservations:
      cpus: '0.1'        # Reserve 10% of one CPU core
      memory: 128M       # Reserve 128MB RAM

# Backend limits
deploy:
  resources:
    limits:
      cpus: '0.5'        # Max 50% of one CPU core
      memory: 256M       # Max 256MB RAM
    reservations:
      cpus: '0.1'        # Reserve 10% of one CPU core
      memory: 64M        # Reserve 64MB RAM
```

**Benefits**:
- Prevents resource exhaustion attacks
- Ensures fair resource allocation
- Improves system stability
- Enables better capacity planning

### Network Security

- **Internal Network**: Containers communicate via isolated `exam_bank_network` bridge network
- **Port Exposure**: Only necessary ports exposed to host (5433, 50051, 8080)
- **Database Access**: PostgreSQL only accessible from Backend container and host (not public)

### Environment Variables

- **Sensitive Data**: Store in `.env` file (never commit to git)
- **JWT Secrets**: Use strong, randomly generated secrets in production
- **Database Passwords**: Change default passwords in production

## 📝 Additional Resources

- **Full Docker Setup**: See `docker/compose/docker-compose.yml` for full stack
- **Production Setup**: See `docker/compose/docker-compose.prod.yml`
- **Database Management**: Use pgAdmin at http://localhost:5050 (if started)
- **API Documentation**: gRPC reflection enabled at localhost:50051

## 🆘 Support

If you encounter issues:

1. Check logs: `docker-compose -f docker-compose.backend-only.yml logs -f`
2. Verify ports: `netstat -ano | findstr ":5433 :50051 :8080 :3000"`
3. Restart services: `docker-compose -f docker-compose.backend-only.yml restart`
4. Clean rebuild: `docker-compose -f docker-compose.backend-only.yml down -v && docker-compose -f docker-compose.backend-only.yml up -d --build`

---

**Last Updated**: 2025-01-19
**Version**: 2.0.0
**Status**: Production Ready - Enhanced Security & Resource Management

