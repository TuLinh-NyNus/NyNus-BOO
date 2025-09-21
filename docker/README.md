# 🐳 Docker Configuration Files

This directory contains all Docker-related configuration files for the Exam Bank System.

## 📁 File Structure

```
docker/
├── README.md                    # This file
├── backend.Dockerfile           # Backend Go service
├── frontend.Dockerfile          # Frontend Next.js (Development)
├── frontend.prod.Dockerfile     # Frontend Next.js (Production)
└── frontend.dockerignore        # Frontend Docker ignore rules
```

## 🔧 Dockerfile Descriptions

### **backend.Dockerfile**
- **Base Image**: golang:1.23-alpine (builder) + alpine:latest (runtime)
- **Build Type**: Multi-stage build for optimized size
- **Ports**: 50051 (gRPC), 8080 (HTTP Gateway)
- **Features**: 
  - Go module caching
  - Migration files included
  - Minimal runtime image (~50MB)

### **frontend.Dockerfile** (Development)
- **Base Image**: node:20-alpine
- **Package Manager**: npm with --legacy-peer-deps
- **Mode**: Development with hot reload
- **Port**: 3000
- **Features**:
  - Fast development builds
  - Source code watching
  - DevDependencies included

### **frontend.prod.Dockerfile** (Production)
- **Base Image**: node:20-alpine (multi-stage)
- **Build Type**: Optimized production build
- **Mode**: Production with standalone output
- **Port**: 3000
- **Features**:
  - Minimal runtime image
  - Static file optimization
  - Non-root user security
  - Standalone Next.js server

### **frontend.dockerignore**
- Excludes: node_modules, .next, logs, env files
- Reduces build context size significantly
- Prevents cache invalidation from temporary files

## 🚀 Usage

### Development Mode
```bash
# Use development frontend
docker-compose up -d

# Or build specific service
docker-compose build frontend
```

### Production Mode
```bash
# Use production configuration
docker-compose -f docker-compose.prod.yml up -d

# Build production frontend
docker-compose -f docker-compose.prod.yml build frontend
```

### Individual Service Builds
```bash
# Backend only
docker build -f docker/backend.Dockerfile -t exam-bank-backend .

# Frontend development
docker build -f docker/frontend.Dockerfile -t exam-bank-frontend-dev .

# Frontend production
docker build -f docker/frontend.prod.Dockerfile -t exam-bank-frontend-prod .
```

## 📊 Build Performance

### **Actual Build Times (Tested 2025-01-19)**

| Service | Mode | Build Time | Image Size |
|---------|------|------------|------------|
| Backend | Production | ~45s | ~50MB |
| Frontend | Development | ~5m 38s | ~1.2GB |
| Frontend | Production | ~8-10m | ~200MB |

### **Build Optimization Notes**
- Frontend dev build includes all devDependencies (~800MB node_modules)
- Production build uses multi-stage to reduce final size
- Backend uses CGO_ENABLED=0 for static binary
- Alpine base images for minimal attack surface

## 🔍 Troubleshooting

### **Common Issues & Solutions**

#### 1. **Frontend npm install fails**
```bash
# Solution: Use --legacy-peer-deps flag (already in Dockerfile)
RUN npm install --legacy-peer-deps
```

#### 2. **Backend migration files not found**
```bash
# Ensure migration path is correct in Dockerfile
COPY --from=builder /app/internal/database/migrations ./internal/database/migrations
```

#### 3. **Docker build context too large**
```bash
# Use .dockerignore to exclude unnecessary files
# Check current context size:
docker build --no-cache --progress=plain -f docker/frontend.Dockerfile .
```

#### 4. **Production build fails**
```bash
# Check Next.js configuration for standalone output
# In next.config.js:
module.exports = {
  output: 'standalone'
}
```

## 🔄 Migration from apps/ Dockerfiles

### **Changes Made**
1. **Moved** `apps/backend/Dockerfile` → `docker/backend.Dockerfile`
2. **Moved** `apps/frontend/Dockerfile` → `docker/frontend.Dockerfile`  
3. **Created** `docker/frontend.prod.Dockerfile` for production
4. **Updated** `docker-compose.yml` to use new paths
5. **Created** `docker-compose.prod.yml` for production deployment

### **Import Path Updates**
- All Dockerfile paths updated in docker-compose files
- Build context remains at root level (.)
- No changes needed in source code imports

## 🎯 Best Practices

1. **Use multi-stage builds** for production images
2. **Leverage Docker layer caching** by copying package files first
3. **Use .dockerignore** to reduce build context
4. **Run as non-root user** in production
5. **Include health checks** in docker-compose
6. **Use environment variables** for configuration
7. **Pin base image versions** for reproducibility

## 📝 Environment Variables

See `docker-compose.yml` and `docker-compose.prod.yml` for complete environment variable lists.

### **Required for Production**
- `DB_PASSWORD`: PostgreSQL password
- `JWT_SECRET`: JWT signing secret
- `NEXTAUTH_SECRET`: NextAuth.js secret
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_GRPC_URL`: gRPC endpoint URL

---

**Last Updated**: 2025-01-19  
**Docker Version**: 24.0+  
**Docker Compose Version**: 2.0+
