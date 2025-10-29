# Docker Optimization for CI/CD Pipeline

## 🚀 Overview

This guide explains how to optimize Docker builds for the exam-bank-system CI/CD pipeline, reducing build time from 15+ minutes to under 5 minutes using caching, multi-stage builds, and build optimization techniques.

---

## 📊 Current Performance

### Before Optimization
- Backend build: 15-20 minutes
- Frontend build: 12-18 minutes
- Build cache hit rate: 0% (no caching)

### After Optimization (Target)
- Backend build: 3-5 minutes
- Frontend build: 2-4 minutes
- Build cache hit rate: 80%+

---

## 🏗️ Multi-Stage Build Strategy

### Backend Dockerfile Optimization

```dockerfile
# Stage 1: Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /build

# Install dependencies
RUN apk add --no-cache git ca-certificates tzdata

# Copy go mod files (leverage layer caching)
COPY apps/backend/go.mod apps/backend/go.sum ./

# Download dependencies (cached if go.mod/go.sum unchanged)
RUN go mod download

# Copy source code
COPY apps/backend/ ./

# Build binary
RUN CGO_ENABLED=0 GOOS=linux go build \
    -ldflags="-w -s" \
    -o server cmd/server/main.go

# Stage 2: Runtime stage (minimal image)
FROM alpine:3.18

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

# Copy only binary from builder stage
COPY --from=builder /build/server .

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

EXPOSE 50051 8080 8081

CMD ["./server"]
```

### Frontend Dockerfile Optimization

```dockerfile
# Stage 1: Dependencies
FROM node:18-alpine AS deps

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

COPY apps/frontend/package.json apps/frontend/pnpm-lock.yaml ./

# Install dependencies with caching
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:18-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY apps/frontend/package.json apps/frontend/pnpm-lock.yaml ./
COPY --from=deps /app/node_modules ./node_modules

COPY apps/frontend/ ./

# Build application
RUN pnpm build

# Stage 3: Runtime (using Next.js standalone)
FROM node:18-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY apps/frontend/package.json ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

CMD ["node", "server.js"]
```

---

## 💾 Layer Caching Strategy

### Optimal Layer Order

```dockerfile
# ❌ BAD - Copy everything first, small changes invalidate cache
COPY . .
RUN npm install
RUN npm run build

# ✅ GOOD - Copy layer-by-layer, invalidate only necessary layers
COPY package.json package-lock.json ./
RUN npm install          # Cached unless package files change

COPY src ./src           # Invalidated if source changes
RUN npm run build        # Only runs if source changed
```

### Cache Busting Patterns

```dockerfile
# ✅ Use ARG for cache busting only when needed
ARG BUILD_DATE
ARG BUILD_VERSION

# This layer is cached unless BUILD_DATE argument changes
RUN echo "Build: $BUILD_DATE Version: $BUILD_VERSION"

# ✅ Put frequently changing layers last
FROM base-image

# Stable: OS packages (rarely change)
RUN apk add --no-cache curl git

# More stable: dependencies (change when package.json updates)
COPY package.json .
RUN npm install

# Frequently changing: source code (changes often)
COPY src ./src
RUN npm run build
```

---

## 🔄 GitHub Actions Build Cache

### Enable BuildKit

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
        with:
          driver-options: |
            image=moby/buildkit:latest
            network=host
```

### Use GHA Cache

```yaml
- name: Build and push
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: ghcr.io/myrepo/image:latest
    cache-from: type=gha
    cache-to: type=gha,mode=max
    # Or use type=registry for persistent cache
    # cache-from: type=registry,ref=ghcr.io/myrepo/image:buildcache
    # cache-to: type=registry,ref=ghcr.io/myrepo/image:buildcache,mode=max
```

### Cache Configuration

```yaml
# Recommended settings
cache-from: |
  type=gha
  
cache-to: |
  type=gha,mode=max
  
# For persistent registry cache:
cache-from: |
  type=registry,ref=ghcr.io/repo/image:cache
  
cache-to: |
  type=registry,ref=ghcr.io/repo/image:cache,mode=max
```

---

## 🎯 Build Optimization Techniques

### 1. Use Minimal Base Images

```dockerfile
# ❌ Large: 1.2 GB
FROM ubuntu:22.04

# ✅ Medium: 370 MB
FROM debian:bookworm-slim

# ✅ Small: 7 MB
FROM alpine:3.18

# ✅ Tiny: 2 MB (for Go)
FROM scratch
```

### 2. Reduce Layer Count

```dockerfile
# ❌ Multiple layers (4 RUN instructions)
RUN apk add --no-cache curl
RUN apk add --no-cache git
RUN apk add --no-cache ca-certificates
RUN apk add --no-cache tzdata

# ✅ Single layer
RUN apk add --no-cache \
    curl \
    git \
    ca-certificates \
    tzdata
```

### 3. Clean Up Layer Content

```dockerfile
# ❌ Leaves cache data (40 MB)
RUN npm install

# ✅ Removes cache (saves 40 MB)
RUN npm install && npm cache clean --force

# ✅ For apk
RUN apk add --no-cache package && rm -rf /var/cache/apk/*
```

### 4. Optimize Build Arguments

```dockerfile
# Use build args efficiently
ARG NODE_ENV=production
ARG npm_CONFIG_loglevel=warn

FROM node:18-alpine

ENV NODE_ENV=${NODE_ENV} \
    npm_CONFIG_loglevel=${npm_CONFIG_loglevel}

RUN npm install

# Build outputs will be consistent for same args
```

---

## 📊 Build Configuration Examples

### Backend Go Build

```bash
# .github/workflows/ci-backend.yml

- name: Build Docker image
  uses: docker/build-push-action@v5
  with:
    context: .
    file: docker/backend.Dockerfile
    platforms: linux/amd64,linux/arm64
    push: ${{ github.event_name != 'pull_request' }}
    tags: |
      ghcr.io/org/backend:${{ github.sha }}
      ghcr.io/org/backend:latest
    cache-from: type=gha
    cache-to: type=gha,mode=max
    build-args: |
      BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
      BUILD_VERSION=${{ github.sha }}
      GO_VERSION=1.23
```

### Frontend Next.js Build

```bash
- name: Build Docker image
  uses: docker/build-push-action@v5
  with:
    context: apps/frontend
    platforms: linux/amd64,linux/arm64
    push: ${{ github.event_name != 'pull_request' }}
    tags: |
      ghcr.io/org/frontend:${{ github.sha }}
      ghcr.io/org/frontend:latest
    cache-from: type=gha
    cache-to: type=gha,mode=max
    build-args: |
      NODE_ENV=production
      NEXT_PUBLIC_API_URL=https://api.example.com
```

---

## 🎯 Performance Targets

### Build Time Breakdown

**Backend (Current: 15-20 min → Target: 3-5 min)**

```
Dockerfile stages:
- Stage 1 (Builder): 1-2 min
  - Base image pull: 20s (cached)
  - go mod download: 30s (cached most builds)
  - Build binary: 1-1.5 min

- Stage 2 (Runtime): 20s
  - Base image pull: 10s (cached)
  - Copy binary: 10s

Total: 3-5 min (with cache hits)
```

**Frontend (Current: 12-18 min → Target: 2-4 min)**

```
Dockerfile stages:
- Stage 1 (Deps): 1-1.5 min
  - npm install: 1-1.5 min (cached unless package.json changes)

- Stage 2 (Builder): 2-3 min
  - Copy deps: 10s
  - Copy source: 10s
  - pnpm build: 2-2.5 min

- Stage 3 (Runtime): 20s

Total: 2-4 min (with cache hits)
```

---

## ✅ Optimization Checklist

### Dockerfile Optimization

- [ ] Use multi-stage builds
- [ ] Use minimal base images (alpine, distroless)
- [ ] Order layers from stable to changing
- [ ] Combine RUN commands where possible
- [ ] Clean up after package managers
- [ ] Remove unnecessary files (docs, tests, examples)
- [ ] Use .dockerignore to exclude files
- [ ] Set HEALTHCHECK for all services

### CI Build Optimization

- [ ] Enable Docker BuildKit
- [ ] Use GitHub Actions cache (type=gha)
- [ ] Build multiple architectures (amd64, arm64)
- [ ] Use cache-from for previous builds
- [ ] Limit image layers
- [ ] Pre-download dependencies in CI cache
- [ ] Monitor build time trends

### Image Size Optimization

- [ ] Remove development dependencies
- [ ] Strip binaries (Go: -ldflags="-w -s")
- [ ] Use minimal base images
- [ ] Remove build tools from runtime stage
- [ ] Use .dockerignore effectively
- [ ] Consider distroless images for Go

---

## 📈 Monitoring & Analytics

### Build Time Metrics

```bash
# GitHub Actions build time
- Backend: 3-5 min ✅
- Frontend: 2-4 min ✅
- Mobile: N/A

# Image sizes
- Backend: 50-100 MB (target: < 100 MB)
- Frontend: 200-300 MB (target: < 300 MB)

# Cache hit rate
- Target: > 80% on repeated builds
- Monitor: GitHub Actions > Workflows > Build job
```

### Optimization Techniques to Monitor

1. **Dependency Installation** - Largest time consumer
2. **Source Code Copy** - Frequent cache invalidation
3. **Build Process** - Compilation/transpilation time
4. **Image Transfer** - Push to registry time

---

## 🔧 Troubleshooting

### Issue: Cache not working

**Check:**
1. Ensure BuildKit enabled: `docker buildx version`
2. Verify cache-from/cache-to arguments
3. Check layer changes (might invalidate cache)

**Fix:**
```bash
# Clear cache if needed
docker buildx prune --all

# Rebuild with verbose output
docker buildx build --progress=plain .
```

### Issue: Build fails in CI but works locally

**Causes:**
- Different BuildKit version
- Environment variables not set
- Missing build context files

**Solution:**
```bash
# Test locally with CI docker buildx
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --build-arg BUILD_VERSION=$(git rev-parse --short HEAD) \
  .
```

### Issue: Large image size

**Check:**
1. Base image size
2. Unnecessary dependencies
3. Not removing temp files

**Reduce:**
```dockerfile
# Remove apt/apk cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*
RUN apk del build-dependencies

# Remove documentation
RUN rm -rf /usr/share/doc /usr/share/man

# Strip Go binaries
RUN strip -s server
```

---

## 📚 Best Practices Summary

✅ **DO:**
- Use multi-stage builds
- Order layers by change frequency
- Leverage caching aggressively
- Use minimal base images
- Clean up after package managers
- Document HEALTHCHECK

❌ **DON'T:**
- Copy entire directory with COPY .
- Use large base images unnecessarily
- Skip cache optimization
- Leave package manager caches
- Build in single large layer
- Ignore image size growth

---

## 🔗 References

- [Docker Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Docker BuildKit](https://docs.docker.com/build/architecture/)
- [GitHub Actions Docker caching](https://docs.docker.com/build/cache/backends/gha/)
- [Optimize container images](https://docs.docker.com/build/optimize/images/)

---

**Last Updated:** 2025-01-20  
**Version:** 1.0.0
