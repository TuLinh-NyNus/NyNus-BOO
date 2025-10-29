# 🐳 Docker Build Files - NyNus Exam Bank System

## 📁 Dockerfiles Location

All Dockerfiles are centralized in this directory for easy management.

## 📋 Available Dockerfiles

### **Backend Services**

#### `backend.dev.Dockerfile` (Development)
- **Base Image:** `golang:1.23.0-alpine` → `alpine:latest`
- **Purpose:** Local development, hot-reload support
- **Build Context:** Workspace root (.)
- **Image Size:** ~80MB
- **Usage:**
  ```bash
  docker build -f docker/build/backend.dev.Dockerfile -t exam-bank-backend:dev .
  ```

#### `backend.prod.Dockerfile` (Production)
- **Base Image:** `golang:1.23.0-alpine` → `scratch` or `alpine`
- **Purpose:** Production deployment, optimized size
- **Build Context:** Workspace root (.)
- **Image Size:** ~50MB (scratch), ~80MB (alpine)
- **Targets:**
  - `production` - Minimal scratch image (no shell)
  - `production-alpine` - Alpine with shell & tools
- **Usage:**
  ```bash
  # Scratch (minimal, recommended for production)
  docker build -f docker/build/backend.prod.Dockerfile --target production -t exam-bank-backend:prod .
  
  # Alpine (with shell access)
  docker build -f docker/build/backend.prod.Dockerfile --target production-alpine -t exam-bank-backend:prod-alpine .
  ```

### **Frontend Services**

#### `frontend.dev.Dockerfile` (Development)
- **Base Image:** `node:20-alpine`
- **Purpose:** Local development with hot-reload
- **Build Context:** Workspace root (.)
- **Package Manager:** pnpm
- **Features:** Hot Module Replacement (HMR) with Turbopack
- **Image Size:** ~1.2GB (includes devDependencies)
- **Usage:**
  ```bash
  docker build -f docker/build/frontend.dev.Dockerfile -t exam-bank-frontend:dev .
  ```

#### `frontend.prod.Dockerfile` (Production)
- **Base Image:** `node:20-alpine` (multi-stage)
- **Purpose:** Production deployment, optimized for size and performance
- **Build Context:** Workspace root (.)
- **Package Manager:** npm (for production)
- **Features:** Multi-stage build, standalone output
- **Image Size:** ~200MB
- **Usage:**
  ```bash
  docker build -f docker/build/frontend.prod.Dockerfile -t exam-bank-frontend:prod .
  ```

### **Utility Services**

#### `prisma-studio.Dockerfile` (Database UI)
- **Base Image:** `node:20-alpine`
- **Purpose:** ⚠️ Deprecated - Use pgAdmin 4 instead
- **Note:** Kept for backward compatibility
- **Migration:** See `docs/database/PGADMIN_SETUP.md`

---

## 🛠️ Docker Compose Integration

Dockerfiles are referenced in docker-compose files:

### Development
```yaml
# docker-compose.yml
backend:
  build:
    context: .
    dockerfile: docker/build/backend.dev.Dockerfile

frontend:
  build:
    context: .
    dockerfile: docker/build/frontend.dev.Dockerfile
```

### Production
```yaml
# docker-compose.prod.yml
backend:
  build:
    context: .
    dockerfile: docker/build/backend.prod.Dockerfile
    target: production

frontend:
  build:
    context: .
    dockerfile: docker/build/frontend.prod.Dockerfile
```

---

## 📊 Build Performance

| Service | Mode | Time | Size |
|---------|------|------|------|
| Backend | Dev | ~30s | 80MB |
| Backend | Prod | ~45s | 50MB |
| Frontend | Dev | ~5m 38s | 1.2GB |
| Frontend | Prod | ~8-10m | 200MB |

---

## ✅ Best Practices

1. **Build Context:** Always from workspace root (.)
2. **Relative Paths:** Use paths relative to workspace root
3. **Security:** Run as non-root user (already configured)
4. **Caching:** Layer-order optimized for better cache hits
5. **Size:** Use multi-stage builds for production

---

## 🔍 Troubleshooting

### **Build fails with "COPY apps/backend not found"**
- Ensure build context is workspace root (.)
- Check working directory from terminal: `pwd`

### **Docker image too large**
- Use production Dockerfiles instead of dev
- Production: ~50-200MB vs Dev: ~80MB-1.2GB

### **Hot-reload not working**
- Verify using dev Dockerfile
- Check volume mount in docker-compose

---

## 📚 Related Documentation

- [Docker Development Guide](../DEVELOPMENT_GUIDE.md)
- [Docker Compose Configuration](../compose/README.md)
- [Production Deployment Guide](../docs/PRODUCTION_GUIDE.md)

---

**Last Updated:** 2025-01-19
