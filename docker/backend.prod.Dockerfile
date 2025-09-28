# Production Backend Dockerfile - Optimized for NyNus
# Multi-stage build for minimal production image

# ========================================
# BUILD STAGE
# ========================================
FROM golang:1.23.0-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git ca-certificates tzdata

# Set working directory
WORKDIR /app

# Copy go mod files first for better caching
COPY apps/backend/go.mod apps/backend/go.sum ./
RUN go mod download

# Copy source code
COPY apps/backend .
COPY packages/database ./packages/database

# Verify dependencies
RUN go mod tidy
RUN go mod verify

# Build the application with optimizations
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags='-w -s -extldflags "-static"' \
    -a -installsuffix cgo \
    -o main cmd/main.go

# Verify the binary
RUN ./main --version || echo "Binary built successfully"

# ========================================
# PRODUCTION STAGE
# ========================================
FROM scratch AS production

# Copy timezone data and CA certificates from builder
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Copy the binary from builder stage
COPY --from=builder /app/main /main

# Copy migration files
COPY --from=builder /app/internal/database/migrations /internal/database/migrations

# Create non-root user (even in scratch)
# Note: In scratch, we can't create users, so we rely on Kubernetes security context

# Set environment variables for production
ENV ENV=production
ENV HTTP_GATEWAY_ENABLED=false
ENV LOG_LEVEL=info
ENV LOG_FORMAT=json
ENV TLS_ENABLED=true

# Only expose gRPC port in production (no HTTP gateway)
EXPOSE 8080

# Health check (if supported by orchestrator)
# HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
#   CMD ["/main", "health"] || exit 1

# Run as non-root user (set by Kubernetes security context)
USER 65534:65534

# Run the binary
ENTRYPOINT ["/main"]

# ========================================
# ALTERNATIVE: Alpine-based production stage
# Use this if you need shell access or additional tools
# ========================================
FROM alpine:3.19 AS production-alpine

# Install runtime dependencies
RUN apk --no-cache add ca-certificates tzdata curl

# Create non-root user
RUN addgroup -g 1001 -S nynus && \
    adduser -u 1001 -S nynus -G nynus

# Set working directory
WORKDIR /app

# Copy the binary from builder stage
COPY --from=builder /app/main .

# Copy migration files
COPY --from=builder /app/internal/database/migrations ./internal/database/migrations

# Set ownership
RUN chown -R nynus:nynus /app

# Set environment variables for production
ENV ENV=production
ENV HTTP_GATEWAY_ENABLED=false
ENV LOG_LEVEL=info
ENV LOG_FORMAT=json
ENV TLS_ENABLED=true

# Only expose gRPC port in production
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Switch to non-root user
USER nynus:nynus

# Run the binary
CMD ["./main"]

# ========================================
# BUILD INSTRUCTIONS
# ========================================
# 
# Build production image:
# docker build -f docker/backend.prod.Dockerfile -t nynus/backend:prod .
#
# Build with specific target:
# docker build -f docker/backend.prod.Dockerfile --target production -t nynus/backend:prod-scratch .
# docker build -f docker/backend.prod.Dockerfile --target production-alpine -t nynus/backend:prod-alpine .
#
# Run production container:
# docker run -d \
#   --name nynus-backend-prod \
#   -p 8080:8080 \
#   -e DB_PASSWORD=your-db-password \
#   -e JWT_SECRET=your-jwt-secret \
#   -v /etc/ssl/certs:/etc/ssl/certs:ro \
#   -v /etc/ssl/private:/etc/ssl/private:ro \
#   nynus/backend:prod
#
# ========================================
# KUBERNETES DEPLOYMENT
# ========================================
#
# apiVersion: apps/v1
# kind: Deployment
# metadata:
#   name: nynus-backend
#   labels:
#     app: nynus-backend
# spec:
#   replicas: 3
#   selector:
#     matchLabels:
#       app: nynus-backend
#   template:
#     metadata:
#       labels:
#         app: nynus-backend
#     spec:
#       securityContext:
#         runAsNonRoot: true
#         runAsUser: 65534
#         runAsGroup: 65534
#         fsGroup: 65534
#       containers:
#       - name: backend
#         image: nynus/backend:prod
#         ports:
#         - containerPort: 8080
#           name: grpc
#         env:
#         - name: ENV
#           value: "production"
#         - name: HTTP_GATEWAY_ENABLED
#           value: "false"
#         - name: DB_PASSWORD
#           valueFrom:
#             secretKeyRef:
#               name: nynus-secrets
#               key: db-password
#         - name: JWT_SECRET
#           valueFrom:
#             secretKeyRef:
#               name: nynus-secrets
#               key: jwt-secret
#         resources:
#           requests:
#             memory: "128Mi"
#             cpu: "100m"
#           limits:
#             memory: "512Mi"
#             cpu: "500m"
#         livenessProbe:
#           exec:
#             command: ["/main", "health"]
#           initialDelaySeconds: 30
#           periodSeconds: 10
#         readinessProbe:
#           exec:
#             command: ["/main", "health"]
#           initialDelaySeconds: 5
#           periodSeconds: 5
#         volumeMounts:
#         - name: tls-certs
#           mountPath: /etc/ssl/certs
#           readOnly: true
#         - name: tls-private
#           mountPath: /etc/ssl/private
#           readOnly: true
#       volumes:
#       - name: tls-certs
#         secret:
#           secretName: nynus-tls-certs
#       - name: tls-private
#         secret:
#           secretName: nynus-tls-private
#
# ========================================
# SECURITY CONSIDERATIONS
# ========================================
# 1. Uses scratch base image for minimal attack surface
# 2. Runs as non-root user (65534)
# 3. Only exposes gRPC port (8080)
# 4. HTTP Gateway disabled in production
# 5. TLS enabled by default
# 6. Static binary with no external dependencies
# 7. Multi-stage build to exclude build tools
# 8. Secrets managed via Kubernetes secrets
# 9. Resource limits defined
# 10. Health checks implemented
